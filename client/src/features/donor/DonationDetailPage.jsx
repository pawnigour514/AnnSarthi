import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { TimelineStepper } from '../../components/timeline/TimelineStepper';
import { RiskBadge } from '../../components/badges/RiskBadge';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { MapView } from '../../components/map/MapView';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/ProgressBar';
import {
  ShieldCheck,
  KeyRound,
  Truck,
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function DonationDetailPage() {
  const { id } = useParams();
  const { addToast } = useDemoStore();
  const [donation, setDonation] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonation = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/donations/${id}`);
      setDonation(data.data.donation);
      setAuditTrail(data.data.auditTrail || []);
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not fetch donation details', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonation();
    const interval = setInterval(fetchDonation, 8000);
    return () => clearInterval(interval);
  }, [id]);

  if (isLoading && !donation) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!donation) {
    return <div className="p-8 text-center text-sm">Donation record not found.</div>;
  }

  const assessment = donation.safetyAssessmentId;
  const isPickupReady = ['PICKUP_ASSIGNED', 'MATCHED'].includes(donation.status);

  const mapMarkers = [
    {
      coords: donation.pickupLocation?.coordinates || [75.8577, 22.7196],
      type: 'DONOR',
      title: 'Pickup Location',
      description: donation.foodName,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
              Donation #{donation._id.slice(-6)}
            </span>
            <StatusBadge status={donation.status} />
          </div>
          <h1 className="text-2xl font-bold font-heading text-brand-950">{donation.foodName}</h1>
          <p className="text-xs text-content-secondary mt-0.5">
            {donation.estimatedMeals} meals • {donation.quantity} {donation.unit} • {donation.dietType}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {assessment && (
            <RiskBadge
              riskLevel={donation.riskLevel}
              score={assessment.score}
              showMethod={true}
              method={assessment.method}
              size="lg"
            />
          )}
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <Card>
        <span className="text-xs font-bold uppercase tracking-wider text-content-secondary block mb-2">
          Redistribution Lifecycle
        </span>
        <TimelineStepper currentStatus={donation.status} riskLevel={donation.riskLevel} />
      </Card>

      {/* OTP Handshake Box (Crucial for Section 16 Verification) */}
      {isPickupReady && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-600 text-white rounded-xl shadow-soft">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                Pickup Verification Handshake
              </span>
              <p className="text-xs text-emerald-800">
                Provide this OTP to the delivery partner when they arrive to inspect and collect the food.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-emerald-300 shadow-sm">
            <span className="text-2xl font-black font-heading tracking-widest text-brand-900">
              123456
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText('123456');
                addToast({ title: 'Copied', message: 'Pickup OTP copied to clipboard', type: 'info' });
              }}
              className="p-1 rounded-lg hover:bg-surface-subtle text-content-secondary"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid: Safety Assessment & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Assessment Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="text-sm font-bold font-heading text-brand-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Food Safety Assessment</span>
            </h3>
            {assessment && (
              <span className="text-xs font-semibold text-content-secondary">
                Confidence: {(assessment.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {assessment ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-content-primary">Evaluation Score:</span>
                <p className="text-content-secondary mt-0.5">
                  <strong>{assessment.score} / 100</strong> (Threshold: &ge;85 for auto-approval)
                </p>
              </div>

              <div>
                <span className="font-semibold text-content-primary">Screening Observations:</span>
                <ul className="mt-1 space-y-1">
                  {assessment.reasons?.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-content-secondary">
                      <span className="text-brand-600 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {assessment.imageAnalysis && (
                <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border">
                  <span className="font-bold text-content-primary block mb-1">
                    Computer Vision Image Analysis
                  </span>
                  <p className="text-content-secondary">
                    Sharpness Score: <strong>{assessment.imageAnalysis.blurScore}</strong> (Blur free: {assessment.imageAnalysis.isBlurry ? 'No' : 'Yes'})
                  </p>
                  <p className="text-content-secondary mt-0.5">{assessment.imageAnalysis.notes}</p>
                </div>
              )}

              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[10px] text-amber-900 leading-snug">
                {assessment.disclaimer}
              </div>
            </div>
          ) : (
            <p className="text-xs text-content-secondary">Screening evaluation in progress...</p>
          )}
        </Card>

        {/* Map View & Pickup Location */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="text-sm font-bold font-heading text-brand-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Pickup & Transit Location</span>
            </h3>
            <span className="text-xs text-content-secondary">Indore, MP</span>
          </div>

          <p className="text-xs text-content-secondary">
            {donation.pickupLocation?.address?.formattedAddress || 'Pickup Point'}
          </p>

          <MapView markers={mapMarkers} height="240px" zoom={14} />
        </Card>
      </div>

      {/* Immutable Audit Trail Log */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold font-heading text-brand-900 flex items-center gap-2 border-b border-surface-border pb-3">
          <FileText className="w-4 h-4 text-brand-600" />
          <span>Immutable Audit Log Trail</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-content-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor Role</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {auditTrail.map((log) => (
                <tr key={log._id} className="hover:bg-surface-subtle/50">
                  <td className="py-2.5 px-3 text-content-light whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-content-primary">{log.action}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 font-bold text-[10px]">
                      {log.performedByRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-content-secondary">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
