import mongoose from 'mongoose';

const DonationImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  pHash: { type: String, default: '' }, // perceptual hash for duplicate/fraud detection
  blurScore: { type: Number, default: 0 },
  brightness: { type: Number, default: 0 },
  qualityFlag: { type: String, default: 'GOOD' },
  uploadedAt: { type: Date, default: Date.now },
});

const DonationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    donorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['cookedMeal', 'dairyBakery', 'freshProduce', 'packagedDry'],
      required: true,
      default: 'cookedMeal',
    },
    dietType: {
      type: String,
      enum: ['VEG', 'NON_VEG', 'VEGAN', 'OTHER'],
      required: true,
      default: 'VEG',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      enum: ['kg', 'liters', 'packets', 'meals', 'boxes'],
      default: 'meals',
    },
    estimatedMeals: {
      type: Number,
      required: true,
      min: 1,
    },
    preparationDateTime: {
      type: Date,
      required: true,
    },
    storageMethod: {
      type: String,
      enum: ['ambient', 'refrigerated', 'heated'],
      required: true,
      default: 'ambient',
    },
    packagingType: {
      type: String,
      required: true,
      default: 'Food Grade Foil / Box',
    },
    pickupDeadline: {
      type: Date,
      required: true,
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        street: String,
        landmark: String,
        city: { type: String, default: 'Indore' },
        formattedAddress: String,
      },
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    images: [DonationImageSchema],
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'SCREENING',
        'REVIEW_REQUIRED',
        'VERIFIED',
        'MATCHED',
        'PICKUP_ASSIGNED',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'COMPLETED',
        'REJECTED',
        'CANCELLED',
      ],
      default: 'DRAFT',
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'UNSCREENED'],
      default: 'UNSCREENED',
    },
    safetyAssessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodSafetyAssessment',
    },
    matchedReceiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    activeDeliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null,
    },
    pickupOtpHash: {
      type: String,
      select: false,
    },
    deliveryOtpHash: {
      type: String,
      select: false,
    },
    completedAt: Date,
    cancellationReason: String,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

DonationSchema.index({ pickupLocation: '2dsphere' });
DonationSchema.index({ status: 1, pickupDeadline: 1 });
DonationSchema.index({ matchedReceiverId: 1, status: 1 });
DonationSchema.index({ assignedPartnerId: 1, status: 1 });

export const Donation = mongoose.model('Donation', DonationSchema);
