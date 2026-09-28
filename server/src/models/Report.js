import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterRole: {
      type: String,
      enum: ['DONOR', 'DELIVERY_PARTNER', 'RECEIVER', 'ADMIN'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['DONATION', 'DELIVERY', 'USER'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    issueCategory: {
      type: String,
      enum: [
        'FOOD_CONDITION_CONCERN',
        'PACKAGING_DAMAGED',
        'DONOR_UNAVAILABLE',
        'RECEIVER_UNAVAILABLE',
        'ROUTE_ISSUE',
        'VEHICLE_BREAKDOWN',
        'MISLEADING_INFO',
        'OTHER',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true,
    },
    adminNotes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model('Report', ReportSchema);
