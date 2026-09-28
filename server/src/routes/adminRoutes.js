import express from 'express';
import {
  getPendingVerifications,
  handleVerificationDecision,
  getAuditLogs,
  getReports,
  getFraudAlerts,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/verifications', getPendingVerifications);
router.post('/verifications/:userId/decision', handleVerificationDecision);
router.get('/audit-logs', getAuditLogs);
router.get('/reports', getReports);
router.get('/fraud-alerts', getFraudAlerts);

export default router;
