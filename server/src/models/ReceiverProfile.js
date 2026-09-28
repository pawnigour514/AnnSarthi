import mongoose from 'mongoose';

const ReceiverProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    receiverType: {
      type: String,
      enum: [
        'NGO',
        'shelter',
        'community kitchen',
        'orphanage',
        'food bank',
        'verified community organization',
      ],
      required: true,
      default: 'NGO',
    },
    orgName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    dailyMealCapacity: {
      type: Number,
      required: true,
      default: 200,
    },
    storageCapacityKg: {
      type: Number,
      default: 150,
    },
    hasColdStorage: {
      type: Boolean,
      default: false,
    },
    contactPerson: {
      name: String,
      phone: String,
      designation: String,
    },
    address: {
      street: String,
      landmark: String,
      city: { type: String, default: 'Indore' },
      state: { type: String, default: 'Madhya Pradesh' },
      pincode: String,
      formattedAddress: String,
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
        default: [75.8577, 22.7196],
      },
    },
    proofDocumentUrl: {
      type: String,
      default: '',
    },
    totalMealsReceived: {
      type: Number,
      default: 0,
    },
    totalDeliveriesCompleted: {
      type: Number,
      default: 0,
    },
    peopleServedEstimate: {
      type: Number,
      default: 0,
    },
    operationalHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
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

ReceiverProfileSchema.index({ location: '2dsphere' });

export const ReceiverProfile = mongoose.model('ReceiverProfile', ReceiverProfileSchema);
