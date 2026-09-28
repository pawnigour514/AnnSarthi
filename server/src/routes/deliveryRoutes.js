import express from 'express';
import {
  getAvailableDeliveries,
  getMyDeliveries,
  getActiveDelivery,
  getDeliveryById,
  acceptDelivery,
  confirmPickup,
  confirmDelivery,
  reportIssue,
} from '../controllers/deliveryController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.get('/available', requireRole('DELIVERY_PARTNER', 'ADMIN'), getAvailableDeliveries);
router.get('/my', getMyDeliveries);
router.get('/active', requireRole('DELIVERY_PARTNER'), getActiveDelivery);
router.get('/:id', getDeliveryById);
router.post('/:id/accept', requireRole('DELIVERY_PARTNER', 'ADMIN'), acceptDelivery);
router.post(
  '/:id/confirm-pickup',
  otpLimiter,
  requireRole('DELIVERY_PARTNER', 'ADMIN'),
  confirmPickup
);
router.post(
  '/:id/confirm-delivery',
  otpLimiter,
  requireRole('RECEIVER', 'ADMIN', 'DELIVERY_PARTNER'),
  confirmDelivery
);
router.post('/:id/report-issue', reportIssue);

export default router;
