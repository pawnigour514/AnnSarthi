import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { StatCard, Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { RiskBadge } from '../../components/badges/RiskBadge';
import {
  Package,
  Heart,
  Scale,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DonorOverview() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 42,
    mealsRedistributed: 3450,
    divertedKg: 1450,
    trustScore: 95,
  });

  useEffect(() => {
    api
      .get('/donations?limit=5')
      .then((res) => {
        setDonations(res.data?.data?.donations || []);
      })
      .catch(() => {});
  }, []);

  const chartData = [
    { day: 'Mon', meals: 65 },
    { day: 'Tue', meals: 80 },
    { day: 'Wed', meals: 95 },
    { day: 'Thu', meals: 120 },
    { day: 'Fri', meals: 180 },
    { day: 'Sat', meals: 220 },
    { day: 'Sun', meals: 160 },
  ];

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-900 text-white p-6 rounded-2xl shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-brand-300">
            Donor Operations Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-heading mt-0.5">
            Surplus Redistribution Hub
          </h1>
          <p className="text-xs text-brand-200 mt-1 max-w-xl">
            Schedule surplus food donations, inspect real-time safety screening ratings, and track delivery
            progress directly to local community kitchens.
          </p>
        </div>

        <Link
          to="/donor/create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs sm:text-sm text-white shadow-soft transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Surplus Donation</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Donations"
          value={stats.totalDonations}
          unit="listings"
          icon={Package}
          trend="+14% this month"
        />
        <StatCard
          title="Meals Provided"
          value={stats.mealsRedistributed.toLocaleString()}
          unit="servings"
          icon={Heart}
          trend="+320 meals"
          highlight
        />
        <StatCard
          title="Waste Diverted"
          value={`${stats.divertedKg} kg`}
          subtitle="≈ 3,625 kg CO2e saved"
          icon={Scale}
        />
        <StatCard
          title="Trust Profile"
          value={`${stats.trustScore}%`}
          subtitle="Consistent & Verified"
          icon={ShieldCheck}
        />
      </div>

      {/* Grid: Weekly Trend & Active Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h3 className="text-sm font-bold font-heading text-brand-900">
                Weekly Redistribution Volume
              </h3>
              <p className="text-xs text-content-secondary">Meals diverted over the last 7 days</p>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">
              Indore Central
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F7F2" vertical={false} />
                <XAxis dataKey="day" stroke="#94A89C" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A89C" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.75rem',
                    borderColor: '#E3EFE6',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="meals"
                  stroke="#16A34A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMeals)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Predictive Forecast Card */}
        <Card className="flex flex-col justify-between space-y-4 bg-surface-subtle">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span>AI Surplus Forecast</span>
            </div>
            <h4 className="text-base font-bold font-heading text-content-primary mt-2">
              Tonight's Service Projection
            </h4>
            <p className="text-xs text-content-secondary mt-1 leading-relaxed">
              Based on historical Saturday dinner records (350 estimated banquet guests), our ML model projects
              a surplus of:
            </p>

            <div className="mt-4 p-4 rounded-xl bg-white border border-surface-border">
              <span className="text-2xl font-black font-heading text-brand-900 block">
                48 – 65 meals
              </span>
              <span className="text-[11px] text-content-secondary">
                Quantile regression model (70% prediction band)
              </span>
            </div>
          </div>

          <Link
            to="/donor/forecast"
            className="w-full text-center py-2.5 rounded-xl bg-white border border-surface-border hover:border-brand-500 text-xs font-bold text-brand-800 transition-all shadow-soft"
          >
            Run Custom Surplus Forecast →
          </Link>
        </Card>
      </div>

      {/* Recent Donations Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <h3 className="text-sm font-bold font-heading text-brand-900">Recent Surplus Donations</h3>
          <Link
            to="/donor/donations"
            className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-content-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Meals</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Risk Screening</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {donations.map((d) => (
                <tr key={d._id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-content-primary block">{d.foodName}</span>
                    <span className="text-[10px] text-content-light">
                      Prepared: {new Date(d.preparationDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-content-primary">
                    {d.estimatedMeals} meals
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge riskLevel={d.riskLevel} />
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      to={`/donations/${d._id}`}
                      className="text-xs font-bold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Track &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
