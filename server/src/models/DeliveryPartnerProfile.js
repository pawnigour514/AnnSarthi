import mongoose from 'mongoose';

const DeliveryPartnerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    partnerType: {
      type: String,
      enum: ['volunteer', 'NGO driver', 'logistics partner'],
      default: 'volunteer',
    },
    vehicleType: {
      type: String,
      enum: [
        'Bicycle',
        'Two-Wheeler',
        'Three-Wheeler',
        'Four-Wheeler/Van',
        'Refrigerated Van',
      ],
      default: 'Two-Wheeler',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: '',
    },
    maxCapacityKg: {
      type: Number,
      default: 30,
    },
    hasInsulatedBags: {
      type: Boolean,
      default: true,
    },
    drivingLicenseNumber: {
      type: String,
      trim: true,
      default: '',
    },
    idProofDocumentUrl: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [75.8577, 22.7196],
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    totalDeliveriesCompleted: {
      type: Number,
      default: 0,
    },
    totalDistanceKm: {
      type: Number,
      default: 0,
    },
    totalMealsDelivered: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    activeDeliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null,
    },
    verifiedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

DeliveryPartnerProfileSchema.index({ currentLocation: '2dsphere' });

export const DeliveryPartnerProfile = mongoose.model(
  'DeliveryPartnerProfile',
  DeliveryPartnerProfileSchema
);
