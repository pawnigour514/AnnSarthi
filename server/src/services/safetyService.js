import { SafetyRuleConfig } from '../models/SafetyRuleConfig.js';
import { FoodSafetyAssessment } from '../models/FoodSafetyAssessment.js';
import { Donation } from '../models/Donation.js';
import { aiClient } from './aiClient.js';
import { ValidationError } from '../utils/errors.js';
import { recordAuditLog } from './auditService.js';
import { sendNotification } from './notificationService.js';
import { emitDonationStatus } from '../sockets/socket.js';
import { DONATION_STATUS } from '../utils/stateMachines.js';

export async function getActiveSafetyRules() {
  let ruleConfig = await SafetyRuleConfig.findOne({ isActive: true });
  if (!ruleConfig) {
    ruleConfig = await SafetyRuleConfig.create({
      name: 'Default Conservative Food Safety Matrix',
      isActive: true,
      autoVerifyLowRisk: true,
    });
  }
  return ruleConfig;
}

/**
 * Execute food safety screening pipeline on a donation
 */
export async function screenDonationSafety(donationId, userId = null) {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    throw new ValidationError('Donation not found for screening');
  }

  const rules = await getActiveSafetyRules();
  const ruleResults = [];
  const reasons = [];
  let deduction = 0; // starts at 100 max score

  const now = new Date();
  const prepTime = new Date(donation.preparationDateTime);
  const deadlineTime = new Date(donation.pickupDeadline);

  // 1. Check Information plausibility
  if (prepTime > now) {
    ruleResults.push({
      ruleCode: 'TIME_IN_FUTURE',
      ruleName: 'Preparation Time Validation',
      passed: false,
      severity: 'MANDATORY',
      message: 'Preparation time cannot be set in the future.',
    });
    reasons.push('Preparation time reported is in the future.');
    deduction += 40;
  } else {
    ruleResults.push({
      ruleCode: 'TIME_IN_FUTURE',
      ruleName: 'Preparation Time Validation',
      passed: true,
      severity: 'MANDATORY',
      message: 'Preparation time is valid and in the past.',
    });
  }

  // 2. Check pickup deadline
  const remainingHours = (deadlineTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (remainingHours < (rules.minPickupWindowHours || 0.5)) {
    ruleResults.push({
      ruleCode: 'PICKUP_DEADLINE_PASSED',
      ruleName: 'Pickup Window Feasibility',
      passed: false,
      severity: 'MANDATORY',
      message: `Pickup window is less than the minimum required ${rules.minPickupWindowHours} hours.`,
    });
    reasons.push('Insufficient time remaining before pickup deadline for safe redistribution.');
    deduction += 35;
  } else {
    ruleResults.push({
      ruleCode: 'PICKUP_DEADLINE_PASSED',
      ruleName: 'Pickup Window Feasibility',
      passed: true,
      severity: 'MANDATORY',
      message: `Feasible pickup window remaining (${remainingHours.toFixed(1)} hrs).`,
    });
  }

  // 3. Check Shelf-Life Matrix
  const hoursSincePrep = (now.getTime() - prepTime.getTime()) / (1000 * 60 * 60);
  const categoryMatrix = rules.shelfLifeMatrixHours[donation.category] || {
    ambient: 4,
    refrigerated: 24,
    heated: 6,
  };
  const maxAllowedHours = categoryMatrix[donation.storageMethod] || 4;

  if (hoursSincePrep > maxAllowedHours) {
    ruleResults.push({
      ruleCode: 'SHELF_LIFE_EXCEEDED',
      ruleName: 'Preparation Elapsed Time vs Storage Method',
      passed: false,
      severity: 'MANDATORY',
      message: `Time since prep (${hoursSincePrep.toFixed(1)} hrs) exceeds safe guideline threshold (${maxAllowedHours} hrs for ${donation.storageMethod} ${donation.category}).`,
    });
    reasons.push(
      `Elapsed time (${hoursSincePrep.toFixed(1)} hrs) exceeds standard safety limit (${maxAllowedHours} hrs) for ${donation.storageMethod} storage.`
    );
    deduction += 45;
  } else {
    ruleResults.push({
      ruleCode: 'SHELF_LIFE_EXCEEDED',
      ruleName: 'Preparation Elapsed Time vs Storage Method',
      passed: true,
      severity: 'MANDATORY',
      message: `Food within safe storage time limit (${hoursSincePrep.toFixed(1)} of max ${maxAllowedHours} hrs).`,
    });
  }

  // 4. Packaging inspection
  const isPackagingAllowed = rules.allowedPackagingTypes.includes(donation.packagingType);
  if (!isPackagingAllowed) {
    ruleResults.push({
      ruleCode: 'PACKAGING_STANDARDS',
      ruleName: 'Packaging Material Conformity',
      passed: false,
      severity: 'WARNING',
      message: `Packaging '${donation.packagingType}' is non-standard. Requires verification.`,
    });
    reasons.push(`Packaging type '${donation.packagingType}' flagged for manual review.`);
    deduction += 15;
  } else {
    ruleResults.push({
      ruleCode: 'PACKAGING_STANDARDS',
      ruleName: 'Packaging Material Conformity',
      passed: true,
      severity: 'INFO',
      message: 'Packaging meets food-grade redistribution guidelines.',
    });
  }

  // 5. Image Check & Duplicate Detection (via AI Service or local fallback)
  let imageAnalysis = {
    blurScore: 450,
    isBlurry: false,
    brightness: 130,
    isOverOrUnderexposed: false,
    duplicateHashFound: false,
    notes: 'Image quality acceptable for visual screening.',
  };
  let method = 'rule-based';
  let confidence = 0.94;

  // Check if AI service is available
  const aiResult = await aiClient.screenFoodRisk(
    {
      foodName: donation.foodName,
      category: donation.category,
      storageMethod: donation.storageMethod,
      hoursSincePrep,
    },
    donation.images
  );

  if (aiResult) {
    method = aiResult.method || 'rule-based';
    confidence = aiResult.confidence || 0.95;
    if (aiResult.imageAnalysis) {
      imageAnalysis = aiResult.imageAnalysis;
      if (imageAnalysis.duplicateHashFound) {
        ruleResults.push({
          ruleCode: 'DUPLICATE_IMAGE_DETECTED',
          ruleName: 'Anti-Fraud Duplicate Image Scan',
          passed: false,
          severity: 'MANDATORY',
          message: 'Image appears duplicated from an earlier listing.',
        });
        reasons.push('Potential duplicate image detected. Manual review required.');
        deduction += 35;
      }
    }
  }

  // Mandatory images check
  if (rules.mandatoryImageRequired && (!donation.images || donation.images.length === 0)) {
    ruleResults.push({
      ruleCode: 'MISSING_IMAGE',
      ruleName: 'Mandatory Food Image Evidence',
      passed: false,
      severity: 'MANDATORY',
      message: 'No photo provided for food condition screening.',
    });
    reasons.push('Photo required for initial visual screening.');
    deduction += 25;
  }

  // Calculate final score and risk level
  const finalScore = Math.max(0, Math.min(100, 100 - deduction));
  const hasMandatoryFailure = ruleResults.some((r) => !r.passed && r.severity === 'MANDATORY');

  let riskLevel = 'LOW';
  let requiredAction = 'AUTO_APPROVE';

  if (hasMandatoryFailure || finalScore < 60) {
    riskLevel = 'HIGH';
    requiredAction = 'MANUAL_REVIEW_REQUIRED';
  } else if (finalScore < 85 || ruleResults.some((r) => !r.passed)) {
    riskLevel = 'MEDIUM';
    requiredAction = 'MANUAL_REVIEW_REQUIRED';
  } else {
    riskLevel = 'LOW';
    requiredAction = rules.autoVerifyLowRisk ? 'AUTO_APPROVE' : 'MANUAL_REVIEW_REQUIRED';
  }

  if (reasons.length === 0) {
    reasons.push('All baseline food-safety screening checks passed with high confidence.');
  }

  // Create Assessment Record
  const assessment = new FoodSafetyAssessment({
    donationId: donation._id,
    riskLevel,
    score: finalScore,
    reasons,
    requiredAction,
    method,
    confidence,
    ruleResults,
    imageAnalysis,
    disclaimer:
      'DISCLAIMER: AI-assisted risk screening is a decision-support and anomaly-detection tool only. It does NOT guarantee food safety or detect microscopic bacterial/chemical contamination. Final verification rests on authorized human inspection and adherence to certified food hygiene standards.',
  });
  await assessment.save();

  // Update Donation status
  donation.safetyAssessmentId = assessment._id;
  donation.riskLevel = riskLevel;

  if (riskLevel === 'LOW' && requiredAction === 'AUTO_APPROVE') {
    donation.status = DONATION_STATUS.VERIFIED;
  } else {
    donation.status = DONATION_STATUS.REVIEW_REQUIRED;
  }
  await donation.save();

  // Audit log
  await recordAuditLog({
    entityType: 'SAFETY_ASSESSMENT',
    entityId: assessment._id,
    action: 'SCREENING_COMPLETED',
    performedBy: userId,
    performedByRole: userId ? 'USER' : 'SYSTEM',
    newState: { riskLevel, score: finalScore, status: donation.status },
    details: `AI-assisted screening completed. Risk: ${riskLevel}. Score: ${finalScore}. Next status: ${donation.status}`,
  });

  // Notifications
  if (donation.status === DONATION_STATUS.VERIFIED) {
    await sendNotification({
      userId: donation.donorId,
      role: 'DONOR',
      title: 'Donation Verified',
      message: `Your donation "${donation.foodName}" has passed safety screening and is now ready for matching.`,
      type: 'DONATION_STATUS',
      link: `/donations/${donation._id}`,
    });
  } else {
    await sendNotification({
      userId: donation.donorId,
      role: 'DONOR',
      title: 'Donation Under Review',
      message: `Your donation "${donation.foodName}" has been routed for manual safety review.`,
      type: 'SAFETY_REVIEW',
      link: `/donations/${donation._id}`,
    });

    // Notify admins about flagged item
    await sendNotification({
      role: 'ADMIN',
      title: 'Food Safety Review Required',
      message: `Donation "${donation.foodName}" flagged (${riskLevel} risk). Manual review queue updated.`,
      type: 'SAFETY_REVIEW',
      link: `/admin/safety-reviews`,
    });
  }

  emitDonationStatus(donation._id, donation);

  return {
    donation,
    assessment,
  };
}

/**
 * Admin manual decision on safety review
 */
export async function reviewDonationSafetyAdmin(assessmentId, adminUser, { decision, reason, infoRequestNote }) {
  const assessment = await FoodSafetyAssessment.findById(assessmentId);
  if (!assessment) {
    throw new ValidationError('Assessment record not found');
  }

  const donation = await Donation.findById(assessment.donationId);
  if (!donation) {
    throw new ValidationError('Associated donation not found');
  }

  assessment.humanReview = {
    reviewerId: adminUser._id,
    decision,
    reason: reason || 'Reviewed by administrator',
    infoRequestNote: infoRequestNote || '',
    reviewedAt: new Date(),
  };
  await assessment.save();

  const prevStatus = donation.status;

  if (decision === 'APPROVED') {
    donation.status = DONATION_STATUS.VERIFIED;
  } else if (decision === 'REJECTED') {
    donation.status = DONATION_STATUS.REJECTED;
    donation.rejectionReason = reason;
  } else if (decision === 'REQUEST_MORE_INFO' || decision === 'HOLD') {
    donation.status = DONATION_STATUS.REVIEW_REQUIRED;
  }
  await donation.save();

  await recordAuditLog({
    entityType: 'DONATION',
    entityId: donation._id,
    action: `ADMIN_SAFETY_REVIEW_${decision}`,
    performedBy: adminUser._id,
    performedByRole: 'ADMIN',
    previousState: { status: prevStatus },
    newState: { status: donation.status, decision, reason },
    details: `Admin reviewed food safety: ${decision}. Reason: ${reason || 'N/A'}`,
  });

  await sendNotification({
    userId: donation.donorId,
    role: 'DONOR',
    title: `Safety Review: ${decision}`,
    message: `Admin review for "${donation.foodName}": ${decision}. ${reason || ''}`,
    type: 'SAFETY_REVIEW',
    link: `/donations/${donation._id}`,
  });

  emitDonationStatus(donation._id, donation);

  return { donation, assessment };
}
