import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fromRole: {
      type: String,
      enum: ['RECEIVER', 'DONOR', 'DELIVERY_PARTNER'],
      required: true,
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    foodQualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    packagingRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    punctualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      default: '',
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.model('Feedback', FeedbackSchema);
