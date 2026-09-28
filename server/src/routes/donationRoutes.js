import express from 'express';
import {
  createDonation,
  screenDonation,
  getDonations,
  getDonationById,
  cancelDonation,
} from '../controllers/donationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.post('/', requireRole('DONOR', 'ADMIN'), createDonation);
router.post('/:id/screen', screenDonation);
router.get('/', getDonations);
router.get('/:id', getDonationById);
router.patch('/:id/cancel', cancelDonation);

export default router;
