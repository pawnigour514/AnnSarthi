import mongoose from 'mongoose';

const RuleResultSchema = new mongoose.Schema({
  ruleCode: { type: String, required: true },
  ruleName: { type: String, required: true },
  passed: { type: Boolean, required: true },
  severity: { type: String, enum: ['MANDATORY', 'WARNING', 'INFO'], default: 'MANDATORY' },
  message: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
});

const FoodSafetyAssessmentSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true,
    },
    score: {
      type: Number, // 0 to 100 (higher means safer / lower risk)
      required: true,
    },
    reasons: {
      type: [String],
      default: [],
    },
    requiredAction: {
      type: String,
      enum: ['AUTO_APPROVE', 'MANUAL_REVIEW_REQUIRED', 'REJECT_IMMEDIATELY'],
      required: true,
    },
    method: {
      type: String,
      enum: ['rule-based', 'ml'],
      default: 'rule-based',
    },
    confidence: {
      type: Number, // 0.0 to 1.0
      default: 0.95,
    },
    ruleResults: [RuleResultSchema],
    imageAnalysis: {
      blurScore: Number,
      isBlurry: Boolean,
      brightness: Number,
      isOverOrUnderexposed: Boolean,
      duplicateHashFound: Boolean,
      notes: String,
    },
    disclaimer: {
      type: String,
      default:
        'DISCLAIMER: AI-assisted risk screening is a decision-support and anomaly-detection tool only. It does NOT guarantee food safety or detect microscopic bacterial/chemical contamination. Final verification rests on authorized human inspection and adherence to certified food hygiene standards.',
    },
    humanReview: {
      reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      decision: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'REQUEST_MORE_INFO', 'HOLD'],
        default: 'PENDING',
      },
      reason: String,
      infoRequestNote: String,
      reviewedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const FoodSafetyAssessment = mongoose.model(
  'FoodSafetyAssessment',
  FoodSafetyAssessmentSchema
);
