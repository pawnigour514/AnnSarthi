import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      default: null,
    },
    matchScore: {
      type: Number, // 0 - 100
      required: true,
    },
    factorBreakdown: {
      foodTypeScore: { type: Number, required: true },
      quantityFitScore: { type: Number, required: true },
      distanceScore: { type: Number, required: true },
      distanceKm: { type: Number, required: true },
      timeWindowScore: { type: Number, required: true },
      capacityScore: { type: Number, required: true },
      urgencyBonus: { type: Number, default: 0 },
    },
    explanationText: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['rule-based', 'ml'],
      default: 'rule-based',
    },
    status: {
      type: String,
      enum: ['PROPOSED', 'ACCEPTED', 'REJECTED', 'SUPERSEDED'],
      default: 'PROPOSED',
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

MatchSchema.index({ donationId: 1, receiverId: 1 });

export const Match = mongoose.model('Match', MatchSchema);
