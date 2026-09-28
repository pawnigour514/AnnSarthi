import express from 'express';
import {
  getRules,
  updateRules,
  getReviewQueue,
  submitReviewDecision,
} from '../controllers/safetyController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/rules', getRules);
router.put('/rules', requireRole('ADMIN'), updateRules);
router.get('/reviews', requireRole('ADMIN'), getReviewQueue);
router.post('/reviews/:id/decision', requireRole('ADMIN'), submitReviewDecision);

export default router;
