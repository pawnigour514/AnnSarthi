import mongoose from 'mongoose';

const DeliverySchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'ASSIGNED',
        'ACCEPTED',
        'PICKUP_STARTED',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'FAILED',
      ],
      default: 'AVAILABLE',
      index: true,
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      address: String,
      contactPerson: String,
      contactPhone: String,
    },
    dropLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      address: String,
      contactPerson: String,
      contactPhone: String,
    },
    distanceKm: {
      type: Number,
      default: 0,
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 0,
    },
    routePolyline: {
      type: String,
      default: '',
    },
    pickupProof: {
      photoUrl: String,
      otpVerified: { type: Boolean, default: false },
      timestamp: Date,
      locationCoordinates: [Number],
      geofenceVerified: { type: Boolean, default: false },
    },
    deliveryProof: {
      photoUrl: String,
      signatureDataUrl: String,
      otpVerified: { type: Boolean, default: false },
      timestamp: Date,
      locationCoordinates: [Number],
      geofenceVerified: { type: Boolean, default: false },
      quantityReceivedMeals: Number,
      conditionConfirmed: { type: Boolean, default: true },
    },
    currentPartnerLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      updatedAt: Date,
    },
    failureReason: String,
    assignedAt: Date,
    acceptedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

DeliverySchema.index({ partnerId: 1, status: 1 });

export const Delivery = mongoose.model('Delivery', DeliverySchema);
