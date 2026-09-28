import express from 'express';
import { getOverview, getTrends, getCategories } from '../controllers/analyticsController.js';

const router = express.Router();

// Analytics can be viewed publicly (for landing page impact counter) or in dashboard
router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/categories', getCategories);

export default router;
