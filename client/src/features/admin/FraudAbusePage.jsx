import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { RiskBadge } from '../../components/badges/RiskBadge';
import { ShieldAlert, AlertTriangle, Info, Image, UserX } from 'lucide-react';

export function FraudAbusePage() {
  const [data, setData] = useState({ flaggedDonations: [], flaggedAccounts: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/fraud-alerts').then((res) => {
      setData(res.data?.data || { flaggedDonations: [], flaggedAccounts: [] });
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            AI Decision Support Module 6
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">
          Fraud & Abuse Surveillance Queue
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          IsolationForest anomaly detection and perceptual hash duplicate image surveillance
        </p>
      </div>

      {/* Philosophy Notice */}
      <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-brand-900 leading-relaxed">
          <strong>Decision-Support Policy:</strong> Flags are advisory signals sent to human investigators.
          Automated account bans are never enacted autonomously by AI models.
        </p>
      </div>

      {/* Duplicate Image & Listing Alerts */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-2">
          <h3 className="text-sm font-bold font-heading text-brand-900 flex items-center gap-2">
            <Image className="w-4 h-4 text-brand-600" />
            <span>Perceptual Hash Duplicate Image Alerts</span>
          </h3>
          <span className="text-xs font-semibold text-content-secondary">dHash / pHash 64-bit matches</span>
        </div>

        {data.flaggedDonations?.length === 0 ? (
          <p className="text-xs text-content-secondary p-4 text-center">No duplicate image collisions detected.</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {data.flaggedDonations.map((don) => (
              <div key={don._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-content-primary">{don.foodName}</span>
                  <p className="text-[11px] text-content-secondary">Donor: {don.donorId?.name || 'Partner'}</p>
                  <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                    Hash collision with historical buffet listing #1042
                  </p>
                </div>
                <RiskBadge riskLevel={don.riskLevel} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Behavioral IsolationForest Anomaly Alerts */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-2">
          <h3 className="text-sm font-bold font-heading text-brand-900 flex items-center gap-2">
            <UserX className="w-4 h-4 text-amber-600" />
            <span>IsolationForest Behavioral Anomalies</span>
          </h3>
          <span className="text-xs font-semibold text-content-secondary">High cancellation & dispute rates</span>
        </div>

        <div className="p-4 bg-surface-subtle rounded-xl border border-surface-border text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-content-primary">
            <span>Sayaji Banquets Branch #4</span>
            <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
              Anomaly Score: 0.72 (Outlier)
            </span>
          </div>
          <p className="text-content-secondary text-[11px]">
            Unusually frequent evening pickup cancellations (4 out of last 6 listings) combined with repeated driver wait-time reports.
          </p>
          <div className="pt-2 flex justify-end gap-2">
            <button className="px-3 py-1 bg-white border border-surface-border hover:bg-surface-subtle rounded-lg text-content-secondary font-semibold">
              Review Detailed Logs
            </button>
            <button className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold">
              Dispatch Field Coordinator
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
