import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['DONATION', 'DELIVERY', 'USER', 'SAFETY_ASSESSMENT', 'RULE_CONFIG', 'REPORT'],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performedByRole: {
      type: String,
      default: 'SYSTEM',
    },
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed,
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // append-only: immutable
  }
);

AuditLogSchema.index({ entityId: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
