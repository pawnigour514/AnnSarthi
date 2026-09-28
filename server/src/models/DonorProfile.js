import mongoose from 'mongoose';

const DonorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    donorType: {
      type: String,
      enum: [
        'Restaurant',
        'Hotel',
        'College',
        'School',
        'Hostel',
        'Wedding/Event organizer',
        'Office/Corporate',
        'Grocery/Food store',
        'Individual',
      ],
      required: true,
      default: 'Restaurant',
    },
    orgName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      name: String,
      phone: String,
      designation: String,
    },
    fssaiLicenseNumber: {
      type: String,
      trim: true,
      default: '',
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
        default: [75.8577, 22.7196], // Indore central default
      },
    },
    totalDonationsCount: {
      type: Number,
      default: 0,
    },
    successfulDonationsCount: {
      type: Number,
      default: 0,
    },
    safetyRejectionsCount: {
      type: Number,
      default: 0,
    },
    cancellationsCount: {
      type: Number,
      default: 0,
    },
    totalMealsDonated: {
      type: Number,
      default: 0,
    },
    trustScore: {
      score: { type: Number, default: 95 },
      reliability: { type: Number, default: 98 },
      timeliness: { type: Number, default: 96 },
      label: { type: String, default: 'Consistent & Verified' },
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

DonorProfileSchema.index({ location: '2dsphere' });

export const DonorProfile = mongoose.model('DonorProfile', DonorProfileSchema);
