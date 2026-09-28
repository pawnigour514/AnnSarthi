import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, StatCard } from '../../components/ui/Card';
import {
  ShieldAlert,
  Users,
  HeartHandshake,
  Truck,
  Package,
  Sliders,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Scale,
} from 'lucide-react';

export function AdminOverview() {
  const [stats, setStats] = useState({
    pendingVerifications: 2,
    flaggedReviews: 1,
    activeDeliveries: 3,
    totalCompleted: 182,
    totalMeals: 14250,
    totalKg: 5985,
  });

  useEffect(() => {
    api.get('/admin/verifications').then((res) => {
      setStats((prev) => ({ ...prev, pendingVerifications: res.data?.data?.length || 0 }));
    }).catch(() => {});

    api.get('/safety/reviews').then((res) => {
      setStats((prev) => ({ ...prev, flaggedReviews: res.data?.data?.length || 0 }));
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-brand-950 text-white p-6 rounded-2xl shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-brand-300">
            System Administration & Compliance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-heading mt-0.5">
            Ecosystem Oversight Command Center
          </h1>
          <p className="text-xs text-brand-200 mt-1 max-w-xl">
            Human-in-the-loop food safety verifications, anti-fraud anomaly surveillance, and dynamic safety policy governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/safety-reviews"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Safety Queue ({stats.flaggedReviews})</span>
          </Link>
          <Link
            to="/admin/verifications"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Verifications ({stats.pendingVerifications})</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Flagged Safety Reviews"
          value={stats.flaggedReviews}
          unit="held items"
          icon={ShieldAlert}
          subtitle="Awaiting manual inspector decision"
          highlight={stats.flaggedReviews > 0}
        />
        <StatCard
          title="Pending Org Verifications"
          value={stats.pendingVerifications}
          unit="accounts"
          icon={Users}
          subtitle="NGOs & drivers review"
        />
        <StatCard
          title="Active Deliveries"
          value="4"
          unit="in transit"
          icon={Truck}
        />
        <StatCard
          title="Total Redistributed"
          value={stats.totalMeals.toLocaleString()}
          unit="meals"
          icon={Scale}
        />
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex flex-col justify-between space-y-3 border-2 hover:border-brand-300 transition-all">
          <div>
            <div className="p-2.5 w-fit rounded-xl bg-amber-50 text-amber-700 mb-2">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-heading text-content-primary">
              Food Safety Review Queue
            </h4>
            <p className="text-xs text-content-secondary mt-1">
              Inspect listings flagged as medium/high-risk or having potential packaging/shelf-life anomalies.
            </p>
          </div>
          <Link
            to="/admin/safety-reviews"
            className="text-xs font-bold text-brand-700 hover:underline inline-flex items-center gap-1 pt-2"
          >
            <span>Open Review Queue</span>
            <span>&rarr;</span>
          </Link>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3 border-2 hover:border-brand-300 transition-all">
          <div>
            <div className="p-2.5 w-fit rounded-xl bg-blue-50 text-blue-700 mb-2">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-heading text-content-primary">
              Food Safety Rule Matrix
            </h4>
            <p className="text-xs text-content-secondary mt-1">
              Adjust maximum allowable hours since preparation per storage temperature and category.
            </p>
          </div>
          <Link
            to="/admin/rules"
            className="text-xs font-bold text-brand-700 hover:underline inline-flex items-center gap-1 pt-2"
          >
            <span>Configure Policy Limits</span>
            <span>&rarr;</span>
          </Link>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3 border-2 hover:border-brand-300 transition-all">
          <div>
            <div className="p-2.5 w-fit rounded-xl bg-emerald-50 text-emerald-700 mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold font-heading text-content-primary">
              Immutable Audit Trail
            </h4>
            <p className="text-xs text-content-secondary mt-1">
              Filterable append-only audit trail recording every state machine transition and user action.
            </p>
          </div>
          <Link
            to="/admin/audit"
            className="text-xs font-bold text-brand-700 hover:underline inline-flex items-center gap-1 pt-2"
          >
            <span>Inspect System Audit Logs</span>
            <span>&rarr;</span>
          </Link>
        </Card>
      </div>
    </div>
  );
}
