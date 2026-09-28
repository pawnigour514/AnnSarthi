import { SafetyRuleConfig } from '../models/SafetyRuleConfig.js';
import { FoodSafetyAssessment } from '../models/FoodSafetyAssessment.js';
import { Donation } from '../models/Donation.js';
import { reviewDonationSafetyAdmin, getActiveSafetyRules } from '../services/safetyService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { recordAuditLog } from '../services/auditService.js';

export async function getRules(req, res, next) {
  try {
    const rules = await getActiveSafetyRules();
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
}

export async function updateRules(req, res, next) {
  try {
    const rules = await getActiveSafetyRules();
    const { shelfLifeMatrixHours, minPickupWindowHours, autoVerifyLowRisk, highRiskCategories, allowedPackagingTypes } = req.body;

    if (shelfLifeMatrixHours) rules.shelfLifeMatrixHours = shelfLifeMatrixHours;
    if (minPickupWindowHours !== undefined) rules.minPickupWindowHours = minPickupWindowHours;
    if (autoVerifyLowRisk !== undefined) rules.autoVerifyLowRisk = autoVerifyLowRisk;
    if (highRiskCategories) rules.highRiskCategories = highRiskCategories;
    if (allowedPackagingTypes) rules.allowedPackagingTypes = allowedPackagingTypes;
    rules.updatedBy = req.user._id;

    await rules.save();

    await recordAuditLog({
      entityType: 'RULE_CONFIG',
      entityId: rules._id,
      action: 'SAFETY_RULES_UPDATED',
      performedBy: req.user._id,
      performedByRole: 'ADMIN',
      details: 'Administrator updated food safety policy parameters.',
    });

    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
}

export async function getReviewQueue(req, res, next) {
  try {
    const assessments = await FoodSafetyAssessment.find({
      'humanReview.decision': 'PENDING',
    })
      .populate({
        path: 'donationId',
        populate: { path: 'donorId', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assessments });
  } catch (err) {
    next(err);
  }
}

export async function submitReviewDecision(req, res, next) {
  try {
    const { id } = req.params; // assessmentId
    const { decision, reason, infoRequestNote } = req.body;

    if (!['APPROVED', 'REJECTED', 'REQUEST_MORE_INFO', 'HOLD'].includes(decision)) {
      throw new ValidationError('Invalid review decision');
    }
    if (!reason) {
      throw new ValidationError('A mandatory reason is required for every review decision.');
    }

    const result = await reviewDonationSafetyAdmin(id, req.user, {
      decision,
      reason,
      infoRequestNote,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
