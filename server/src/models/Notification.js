import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    role: {
      type: String,
      enum: ['DONOR', 'DELIVERY_PARTNER', 'RECEIVER', 'ADMIN', 'ALL'],
      default: 'ALL',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'DONATION_STATUS',
        'SAFETY_REVIEW',
        'MATCH_FOUND',
        'DELIVERY_ASSIGNED',
        'DELIVERY_UPDATE',
        'FRAUD_ALERT',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    link: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
