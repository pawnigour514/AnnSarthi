import mongoose from 'mongoose';

const RequirementSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReceiverProfile',
    },
    foodCategory: {
      type: String,
      enum: ['cookedMeal', 'dairyBakery', 'freshProduce', 'packagedDry', 'any'],
      default: 'cookedMeal',
    },
    dietType: {
      type: String,
      enum: ['VEG', 'NON_VEG', 'VEGAN', 'ANY'],
      default: 'VEG',
    },
    targetMeals: {
      type: Number,
      required: true,
      min: 5,
    },
    requiredBy: {
      type: Date,
      required: true,
    },
    location: {
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
    urgency: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
      default: 'OPEN',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String, // e.g. "DAILY_EVENING"
      default: '',
    },
    matchedDonationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

RequirementSchema.index({ location: '2dsphere' });
RequirementSchema.index({ status: 1, requiredBy: 1 });

export const Requirement = mongoose.model('Requirement', RequirementSchema);
