import React from 'react';
import { Card, StatCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ShieldCheck, Award, Heart, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function TrustProfilePage() {
  const { user, profile } = useAuthStore();

  const metrics = {
    reliabilityScore: 96,
    timelinessScore: 94,
    packagingHygiene: 98,
    successfulDeliveries: profile?.successfulDonationsCount || 40,
    safetyRejections: profile?.safetyRejectionsCount || 2,
    cancellations: profile?.cancellationsCount || 1,
    totalMeals: profile?.totalMealsDonated || 3450,
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              Verified Community Partner
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-brand-950">
            {profile?.orgName || user?.name} — Trust Profile
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
            Transparent, multi-dimensional reliability indicators. We measure consistency without punitive scoring.
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Reliability"
          value="96%"
          unit="Consistent"
          icon={Award}
          trend="+1.2% this quarter"
        />
        <StatCard
          title="Meals Delivered"
          value={metrics.totalMeals.toLocaleString()}
          unit="servings"
          icon={Heart}
          highlight
        />
        <StatCard
          title="Successful Pickups"
          value={metrics.successfulDeliveries}
          subtitle="Fulfilled on schedule"
          icon={CheckCircle2}
        />
        <StatCard
          title="Protective Holds"
          value={metrics.safetyRejections}
          subtitle="Safety thresholds applied"
          icon={AlertCircle}
        />
      </div>

      {/* Philosophy Callout: Non-Punitive Safety Metric */}
      <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-brand-900 leading-relaxed">
          <strong>Why safety holds are non-punitive:</strong> In AnnSarthi, when a donation is held or redirected
          under food-safety screening, it reflects a functioning protective shield, not a penalty. Donors are
          never shamed for conservative expiration rejections—protecting beneficiaries is our collective responsibility.
        </div>
      </div>

      {/* Detailed Factor Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h3 className="text-sm font-bold font-heading text-brand-900 border-b border-surface-border pb-2">
            Reliability & Service Consistency
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-content-primary mb-1">
                <span>Handshake Timeliness (Pickup Readiness)</span>
                <span>{metrics.timelinessScore}%</span>
              </div>
              <ProgressBar value={metrics.timelinessScore} color="bg-brand-600" />
              <p className="text-[11px] text-content-light mt-1">
                Food prepared and packaged before the scheduled pickup window begins.
              </p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-content-primary mb-1">
                <span>Packaging Hygiene & Thermal Seal</span>
                <span>{metrics.packagingHygiene}%</span>
              </div>
              <ProgressBar value={metrics.packagingHygiene} color="bg-brand-600" />
              <p className="text-[11px] text-content-light mt-1">
                Adherence to food-grade containers and leak-proof transport packaging.
              </p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-content-primary mb-1">
                <span>Listing Integrity (Photo Accuracy)</span>
                <span>99%</span>
              </div>
              <ProgressBar value={99} color="bg-brand-600" />
              <p className="text-[11px] text-content-light mt-1">
                No duplicate or misleading photos detected during visual screening.
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-bold font-heading text-brand-900 border-b border-surface-border pb-2">
            Recent Beneficiary Feedback
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border">
              <div className="flex items-center justify-between font-bold text-content-primary">
                <span>Asha Kiran Shelter</span>
                <span className="text-amber-600">★★★★★</span>
              </div>
              <p className="text-content-secondary mt-1">
                "The hot dal and phulkas were impeccably packed in thermal containers. Nourished 110 people seamlessly."
              </p>
              <span className="text-[10px] text-content-light mt-1 block">2 days ago</span>
            </div>

            <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border">
              <div className="flex items-center justify-between font-bold text-content-primary">
                <span>Roti Bank Indore</span>
                <span className="text-amber-600">★★★★★</span>
              </div>
              <p className="text-content-secondary mt-1">
                "Prompt handover and clean labeling. Pickup took under 2 minutes."
              </p>
              <span className="text-[10px] text-content-light mt-1 block">5 days ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
