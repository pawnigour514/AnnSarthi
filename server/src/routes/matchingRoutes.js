import express from 'express';
import {
  getMatches,
  getAvailableForReceivers,
  acceptMatch,
  createRequirement,
  getRequirements,
} from '../controllers/matchingController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/donation/:donationId', getMatches);
router.get('/available-for-receivers', requireRole('RECEIVER', 'ADMIN'), getAvailableForReceivers);
router.post('/accept', requireRole('RECEIVER', 'ADMIN'), acceptMatch);
router.post('/requirements', requireRole('RECEIVER', 'ADMIN'), createRequirement);
router.get('/requirements', getRequirements);

export default router;
