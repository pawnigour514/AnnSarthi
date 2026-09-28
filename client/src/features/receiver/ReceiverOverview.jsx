import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { Heart, Package, Truck, Users, Search, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export function ReceiverOverview() {
  const [availableCount, setAvailableCount] = useState(0);
  const [incomingDeliveries, setIncomingDeliveries] = useState([]);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    api.get('/matches/available-for-receivers').then((res) => {
      setAvailableCount(res.data?.data?.length || 0);
    }).catch(() => {});

    api.get('/deliveries/my').then((res) => {
      setIncomingDeliveries(res.data?.data || []);
    }).catch(() => {});

    api.get('/matches/requirements').then((res) => {
      setRequirements(res.data?.data || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-900 text-white p-6 rounded-2xl shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-brand-300">
            NGO & Community Shelter Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-heading mt-0.5">
            Food Ingestion & Distribution Center
          </h1>
          <p className="text-xs text-brand-200 mt-1 max-w-xl">
            Match with verified surplus donations, track incoming partner shipments with live ETAs, and confirm receipt with digital OTP handshakes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/receiver/available"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs text-white shadow-soft transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Browse Food ({availableCount})</span>
          </Link>
          <Link
            to="/receiver/requirement"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs text-white border border-white/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Need</span>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Verified Surplus"
          value={availableCount}
          unit="listings"
          icon={Package}
          subtitle="Ready for immediate claiming"
          highlight
        />
        <StatCard
          title="Meals Received"
          value="4,120"
          unit="servings"
          icon={Heart}
          trend="+410 meals this week"
        />
        <StatCard
          title="Active Deliveries"
          value={incomingDeliveries.filter((d) => ['ACCEPTED', 'IN_TRANSIT', 'PICKED_UP'].includes(d.status)).length}
          unit="in transit"
          icon={Truck}
        />
        <StatCard
          title="People Nourished"
          value="380"
          unit="daily average"
          icon={Users}
        />
      </div>

      {/* Active Incoming Shipments */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <h3 className="text-sm font-bold font-heading text-brand-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-600" />
            <span>Active Incoming Deliveries</span>
          </h3>
          <Link to="/receiver/incoming" className="text-xs font-semibold text-brand-700 hover:underline">
            View details &rarr;
          </Link>
        </div>

        {incomingDeliveries.length === 0 ? (
          <div className="p-8 text-center text-xs text-content-secondary">
            No active deliveries in transit right now. Accept available donations to request dispatch!
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {incomingDeliveries.map((del) => (
              <div key={del._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-content-primary">
                      {del.donationId?.foodName || 'Meals'}
                    </span>
                    <StatusBadge status={del.status} />
                  </div>
                  <p className="text-xs text-content-secondary mt-0.5">
                    Est. Duration: {del.estimatedDurationMinutes} mins • Distance: {del.distanceKm} km
                  </p>
                </div>
                <Link
                  to="/receiver/incoming"
                  className="px-3 py-1.5 text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-lg self-start sm:self-auto"
                >
                  Track & Confirm Delivery &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
