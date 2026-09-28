import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { Truck, MapPin, CheckCircle2, Clock, ArrowRight, ShieldCheck, Navigation } from 'lucide-react';

export function DeliveryOverview() {
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    api.get('/deliveries/active').then((res) => {
      setActiveDelivery(res.data?.data || null);
    }).catch(() => {});

    api.get('/deliveries/available').then((res) => {
      setAvailableCount(res.data?.data?.length || 0);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-900 text-white p-6 rounded-2xl shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-brand-300">
            Logistics & Volunteer Fleet
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-heading mt-0.5">
            Smart Transit Operations
          </h1>
          <p className="text-xs text-brand-200 mt-1 max-w-xl">
            Accept urgent local food rescue requests, navigate optimized 2-opt multi-stop routes, and verify handshakes with cryptographic proof.
          </p>
        </div>

        <Link
          to="/delivery/requests"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs sm:text-sm text-white shadow-soft transition-all self-start sm:self-auto"
        >
          <Truck className="w-4 h-4" />
          <span>Available Pickups ({availableCount})</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Deliveries Completed"
          value="38"
          unit="trips"
          icon={CheckCircle2}
          trend="+5 this week"
        />
        <StatCard
          title="Distance Covered"
          value="215 km"
          subtitle="Eco-optimized routing"
          icon={Navigation}
          highlight
        />
        <StatCard
          title="Meals Transported"
          value="1,890"
          unit="servings"
          icon={Truck}
        />
        <StatCard
          title="Driver Rating"
          value="4.95 ⭐"
          subtitle="Prompt & reliable"
          icon={ShieldCheck}
        />
      </div>

      {/* Active Shipment Banner */}
      {activeDelivery ? (
        <Card className="p-6 border-2 border-brand-500 bg-brand-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                Active Transit Task
              </span>
              <StatusBadge status={activeDelivery.status} />
            </div>
            <h3 className="text-lg font-bold font-heading text-brand-950">
              {activeDelivery.donationId?.foodName || 'Meals'}
            </h3>
            <p className="text-xs text-content-secondary mt-0.5">
              Destination: {activeDelivery.dropLocation?.address || 'Community Shelter'} • {activeDelivery.distanceKm} km
            </p>
          </div>

          <Link
            to="/delivery/active"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 font-bold text-xs sm:text-sm text-white shadow-soft self-start sm:self-auto"
          >
            Open Active Navigation &rarr;
          </Link>
        </Card>
      ) : (
        <Card className="p-6 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-content-primary">No Active Delivery in Progress</h4>
            <p className="text-xs text-content-secondary mt-0.5">
              You are currently available to accept nearby surplus pickup tasks.
            </p>
          </div>
          <Link
            to="/delivery/requests"
            className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold rounded-xl border border-brand-200"
          >
            Find Next Pickup
          </Link>
        </Card>
      )}
    </div>
  );
}
