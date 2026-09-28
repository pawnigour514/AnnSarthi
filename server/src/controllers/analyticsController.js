import {
  getEcosystemOverviewStats,
  getMonthlyTrends,
  getFoodCategoryBreakdown,
} from '../services/analyticsService.js';

export async function getOverview(req, res, next) {
  try {
    const data = await getEcosystemOverviewStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getTrends(req, res, next) {
  try {
    const data = await getMonthlyTrends();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req, res, next) {
  try {
    const data = await getFoodCategoryBreakdown();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
