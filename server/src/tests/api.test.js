import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedAll } from '../seed/seed.js';
import { validateDonationTransition, validateDeliveryTransition, DONATION_STATUS, DELIVERY_STATUS } from '../utils/stateMachines.js';

describe('AnnSarthi Core API & State Machine Integration Suite', () => {
  let donorToken = '';
  let adminToken = '';
  let partnerToken = '';

  beforeAll(async () => {
    // Establish connection (falls back to MongoMemoryServer if no local mongod)
    await connectDB();
    await seedAll();

    // Acquire tokens for donor, admin, and partner
    const donorRes = await request(app)
      .post('/api/v1/auth/demo-login')
      .send({ role: 'DONOR' });
    donorToken = donorRes.body?.data?.accessToken;

    const adminRes = await request(app)
      .post('/api/v1/auth/demo-login')
      .send({ role: 'ADMIN' });
    adminToken = adminRes.body?.data?.accessToken;

    const partnerRes = await request(app)
      .post('/api/v1/auth/demo-login')
      .send({ role: 'DELIVERY_PARTNER' });
    partnerToken = partnerRes.body?.data?.accessToken;
  }, 40000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Health & System Status', () => {
    it('GET /api/v1/health returns status 200 with service information', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.service).toContain('AnnSarthi');
      expect(res.body.demoMode).toBe(true);
    });
  });

  describe('2. Authentication & RBAC Authorization Guards', () => {
    it('POST /api/v1/auth/demo-login logs in successfully as DONOR', async () => {
      const res = await request(app)
        .post('/api/v1/auth/demo-login')
        .send({ role: 'DONOR' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('DONOR');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('GET /api/v1/auth/me returns 401 when token is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me returns 200 when authenticated with donor token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${donorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('DONOR');
    });

    it('Enforces RBAC: DONOR is rejected with 403 Forbidden from accessing Admin routes', async () => {
      const res = await request(app)
        .get('/api/v1/admin/verifications')
        .set('Authorization', `Bearer ${donorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Enforces RBAC: ADMIN is granted access (200) to Admin routes', async () => {
      const res = await request(app)
        .get('/api/v1/admin/verifications')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('3. Non-Negotiable Food Safety Rules & Risk Screening Pipeline', () => {
    it('GET /api/v1/safety/rules returns active food safety rules matrix', async () => {
      const res = await request(app)
        .get('/api/v1/safety/rules')
        .set('Authorization', `Bearer ${donorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.shelfLifeMatrixHours).toBeDefined();
    });

    it('Evaluates safe fresh food with valid pickup window as LOW or MEDIUM risk', async () => {
      const now = new Date();
      const prepTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
      const deadline = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

      const res = await request(app)
        .post('/api/v1/donations')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          foodName: 'Fresh Vegetable Pulao & Raita',
          category: 'cookedMeal',
          dietType: 'VEG',
          quantity: 25,
          unit: 'kg',
          estimatedMeals: 60,
          preparationDateTime: prepTime.toISOString(),
          storageMethod: 'refrigerated',
          packagingType: 'Food Grade Foil / Box',
          pickupDeadline: deadline.toISOString(),
          images: [{ url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' }],
          notes: 'Freshly prepared wedding banquet surplus in sterile food containers',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assessment).toBeDefined();
      expect(['LOW', 'MEDIUM']).toContain(res.body.data.assessment.riskLevel);
      expect(res.body.data.assessment.reasons).toBeInstanceOf(Array);
      expect(res.body.data.assessment.method).toBeDefined();
    });

    it('Flags cooked food with expired or insufficient pickup window as HIGH risk requiring human review', async () => {
      const now = new Date();
      const prepTime = new Date(now.getTime() - 8 * 60 * 60 * 1000); // 8 hours ago
      const deadline = new Date(now.getTime() + 5 * 60 * 1000); // only 5 mins window!

      const res = await request(app)
        .post('/api/v1/donations')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          foodName: 'Leftover Buffet Curries',
          category: 'cookedMeal',
          dietType: 'VEG',
          quantity: 15,
          unit: 'kg',
          estimatedMeals: 35,
          preparationDateTime: prepTime.toISOString(),
          storageMethod: 'ambient',
          packagingType: 'Open Trays',
          pickupDeadline: deadline.toISOString(),
          notes: 'Kept unsealed at room temperature',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assessment).toBeDefined();
      expect(res.body.data.assessment.riskLevel).toBe('HIGH');
      expect(res.body.data.assessment.requiredAction).toBe('MANUAL_REVIEW_REQUIRED');
    });
  });

  describe('4. Strict Finite State Machine Validation & 409 Conflict Prevention', () => {
    it('Allows valid sequential donation transitions (DRAFT -> SUBMITTED)', () => {
      expect(() => {
        validateDonationTransition(DONATION_STATUS.DRAFT, DONATION_STATUS.SUBMITTED);
      }).not.toThrow();
    });

    it('Throws 409 ConflictError on illegal skip (e.g. SUBMITTED directly to COMPLETED)', () => {
      expect(() => {
        validateDonationTransition(DONATION_STATUS.SUBMITTED, DONATION_STATUS.COMPLETED);
      }).toThrow(/Illegal donation status transition/);
    });

    it('Throws 409 ConflictError on illegal delivery leap (e.g. ASSIGNED directly to DELIVERED)', () => {
      expect(() => {
        validateDeliveryTransition(DELIVERY_STATUS.ASSIGNED, DELIVERY_STATUS.DELIVERED);
      }).toThrow(/Illegal delivery status transition/);
    });

    it('Blocks illegal transition attempts from terminal states (COMPLETED -> DRAFT)', () => {
      expect(() => {
        validateDonationTransition(DONATION_STATUS.COMPLETED, DONATION_STATUS.DRAFT);
      }).toThrow();
    });
  });

  describe('5. Ecosystem Impact Analytics', () => {
    it('GET /api/v1/analytics/overview returns aggregate impact figures with methodology note', async () => {
      const res = await request(app).get('/api/v1/analytics/overview');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.totalMealsRedistributed).toBeGreaterThan(0);
      expect(res.body.data.metrics.estimatedCo2SavedKg).toBeGreaterThan(0);
      expect(res.body.data.methodologyNote).toBeDefined();
      expect(res.body.data.methodologyNote.disclaimer).toBeDefined();
    });

    it('GET /api/v1/analytics/trends returns monthly redistribution trajectories', async () => {
      const res = await request(app).get('/api/v1/analytics/trends');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('6. AI Operations Assistant Role-Gated Tool Safety', () => {
    it('Returns assistant greeting with role awareness', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ message: 'What is my current donor score and history?' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toBeDefined();
    });

    it('Enforces human write confirmation barrier for draft actions', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ message: 'Create a donation of 50 kg surplus rice and dal from today event' });
      expect(res.status).toBe(200);
      expect(res.body.data.requiresConfirmation).toBe(true);
      expect(res.body.data.proposedAction).toBeDefined();
    });
  });
});
