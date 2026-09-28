import React from 'react';
import {
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileEdit,
  Sparkles,
  Link,
  PackageCheck,
} from 'lucide-react';

export function StatusBadge({ status, size = 'md' }) {
  const configs = {
    DRAFT: { label: 'Draft', icon: FileEdit, style: 'bg-gray-100 text-gray-700 border-gray-200' },
    SUBMITTED: { label: 'Submitted', icon: Clock, style: 'bg-blue-50 text-blue-700 border-blue-200' },
    SCREENING: { label: 'Screening', icon: Sparkles, style: 'bg-purple-50 text-purple-700 border-purple-200' },
    REVIEW_REQUIRED: {
      label: 'Review Required',
      icon: AlertCircle,
      style: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    },
    VERIFIED: {
      label: 'Verified Safe',
      icon: ShieldCheck,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    },
    MATCHED: { label: 'Matched', icon: Link, style: 'bg-teal-50 text-teal-800 border-teal-200' },
    PICKUP_ASSIGNED: {
      label: 'Pickup Assigned',
      icon: Truck,
      style: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    PICKED_UP: { label: 'Picked Up', icon: PackageCheck, style: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    IN_TRANSIT: {
      label: 'In Transit',
      icon: Truck,
      style: 'bg-blue-50 text-blue-800 border-blue-300 animate-pulse',
    },
    DELIVERED: {
      label: 'Delivered',
      icon: CheckCircle,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    COMPLETED: {
      label: 'Completed',
      icon: CheckCircle,
      style: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    },
    REJECTED: { label: 'Rejected', icon: XCircle, style: 'bg-rose-50 text-rose-800 border-rose-200' },
    CANCELLED: { label: 'Cancelled', icon: XCircle, style: 'bg-gray-100 text-gray-600 border-gray-200' },
  };

  const current = configs[status] || {
    label: status || 'Unknown',
    icon: Clock,
    style: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium select-none ${current.style} ${sizeClasses[size]}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
