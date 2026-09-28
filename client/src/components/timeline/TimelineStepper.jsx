import React from 'react';
import { Check, Clock, AlertTriangle, ShieldCheck, Truck, PackageCheck, CheckCircle2 } from 'lucide-react';

const DONATION_STAGES = [
  { key: 'SUBMITTED', label: 'Submitted', icon: Clock },
  { key: 'SCREENING', label: 'Safety Screening', icon: ShieldCheck },
  { key: 'VERIFIED', label: 'Verified', icon: Check },
  { key: 'MATCHED', label: 'Matched', icon: PackageCheck },
  { key: 'PICKUP_ASSIGNED', label: 'Pickup Assigned', icon: Truck },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { key: 'COMPLETED', label: 'Delivered & Completed', icon: CheckCircle2 },
];

export function TimelineStepper({ currentStatus, riskLevel = 'LOW' }) {
  // Map donation status to stage index
  const getStageIndex = (status) => {
    switch (status) {
      case 'DRAFT':
        return -1;
      case 'SUBMITTED':
        return 0;
      case 'SCREENING':
      case 'REVIEW_REQUIRED':
        return 1;
      case 'VERIFIED':
        return 2;
      case 'MATCHED':
        return 3;
      case 'PICKUP_ASSIGNED':
      case 'PICKED_UP':
        return 4;
      case 'IN_TRANSIT':
        return 5;
      case 'DELIVERED':
      case 'COMPLETED':
        return 6;
      case 'REJECTED':
      case 'CANCELLED':
        return -2;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);
  const isHeld = currentStatus === 'REVIEW_REQUIRED';
  const isRejected = currentStatus === 'REJECTED';

  return (
    <div className="w-full py-4 overflow-x-auto no-scrollbar">
      <div className="min-w-[650px] flex items-center justify-between relative">
        {/* Connecting progress line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-surface-muted -z-0">
          <div
            className={`h-full transition-all duration-700 ${
              isRejected ? 'bg-risk-high' : isHeld ? 'bg-amber-500' : 'bg-brand-600'
            }`}
            style={{
              width: currentIndex >= 0 ? `${(currentIndex / (DONATION_STAGES.length - 1)) * 100}%` : '0%',
            }}
          />
        </div>

        {/* Steps */}
        {DONATION_STAGES.map((stage, idx) => {
          const isCompleted = currentIndex > idx;
          const isCurrent = currentIndex === idx;
          const isPending = currentIndex < idx;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-soft ${
                  isCurrent && isHeld
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                    : isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 scale-110'
                    : isCompleted
                    ? 'bg-brand-700 text-white'
                    : 'bg-white text-content-light border-2 border-surface-border'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>

              <span
                className={`mt-2 text-xs font-semibold text-center whitespace-nowrap ${
                  isCurrent
                    ? isHeld
                      ? 'text-amber-700 font-bold'
                      : 'text-brand-900 font-bold'
                    : isCompleted
                    ? 'text-content-primary'
                    : 'text-content-light'
                }`}
              >
                {isCurrent && isHeld ? 'Review Required' : stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
