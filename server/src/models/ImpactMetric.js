import mongoose from 'mongoose';

const ImpactMetricSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalFoodKg: {
      type: Number,
      default: 0,
    },
    totalMealsServed: {
      type: Number,
      default: 0,
    },
    co2EmissionsDivertedKg: {
      type: Number,
      default: 0,
    },
    waterConservedLiters: {
      type: Number,
      default: 0,
    },
    landfillSpaceSavedM3: {
      type: Number,
      default: 0,
    },
    totalDonationsCompleted: {
      type: Number,
      default: 0,
    },
    activeDonorsCount: {
      type: Number,
      default: 0,
    },
    activeReceiversCount: {
      type: Number,
      default: 0,
    },
    activePartnersCount: {
      type: Number,
      default: 0,
    },
    isSyntheticDemoData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ImpactMetric = mongoose.model('ImpactMetric', ImpactMetricSchema);
