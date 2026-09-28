import mongoose from 'mongoose';

const SafetyRuleConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Default Conservative Food Safety Matrix',
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoVerifyLowRisk: {
      type: Boolean,
      default: true, // when true, low-risk auto-progresses to VERIFIED
    },
    labelNotice: {
      type: String,
      default:
        'Example baseline defaults. Must be reviewed against applicable food-safety regulations (e.g., FSSAI guidance) and verified by certified food handlers.',
    },
    // Max hours from preparation time based on category and storage
    shelfLifeMatrixHours: {
      cookedMeal: {
        ambient: { type: Number, default: 4 }, // 4 hours at room temp
        refrigerated: { type: Number, default: 24 },
        heated: { type: Number, default: 6 },
      },
      dairyBakery: {
        ambient: { type: Number, default: 6 },
        refrigerated: { type: Number, default: 36 },
        heated: { type: Number, default: 4 },
      },
      freshProduce: {
        ambient: { type: Number, default: 48 },
        refrigerated: { type: Number, default: 96 },
        heated: { type: Number, default: 12 },
      },
      packagedDry: {
        ambient: { type: Number, default: 720 }, // 30 days
        refrigerated: { type: Number, default: 720 },
        heated: { type: Number, default: 24 },
      },
    },
    minPickupWindowHours: {
      type: Number,
      default: 0.5, // at least 30 minutes window before pickup deadline
    },
    highRiskCategories: {
      type: [String],
      default: ['Raw Seafood', 'Raw Poultry', 'Unpasteurized Dairy', 'Cut Melons'],
    },
    allowedPackagingTypes: {
      type: [String],
      default: [
        'Airtight Container',
        'Food Grade Foil / Box',
        'Insulated Casserole',
        'Sealed Commercial Package',
        'Clean Reusable Tray',
      ],
    },
    mandatoryImageRequired: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const SafetyRuleConfig = mongoose.model('SafetyRuleConfig', SafetyRuleConfigSchema);
