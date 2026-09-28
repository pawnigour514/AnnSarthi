import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { MapView } from '../../components/map/MapView';
import { PickupConfirmationModal } from './PickupConfirmationModal';
import { ReportIssueModal } from './ReportIssueModal';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function ActiveDeliveryPage() {
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const { addToast } = useDemoStore();

  const fetchActive = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/deliveries/active');
      setActiveDelivery(data.data || null);
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  // Simulated GPS waypoints along Indore AB road from Vijay Nagar to Geeta Bhawan
  const waypoints = [
    [75.8937, 22.7533], // Vijay Nagar
    [75.8885, 22.7420],
    [75.8841, 22.7290],
    [75.8824, 22.7244], // Palasia
    [75.8841, 22.7156], // Geeta Bhawan / South Tukoganj
  ];

  const currentCoords = waypoints[simStep] || waypoints[0];

  const advanceSimulation = () => {
    if (simStep < waypoints.length - 1) {
      setSimStep(simStep + 1);
      addToast({
        title: 'GPS Position Updated',
        message: `Simulated vehicle moved along route to waypoint ${simStep + 2}/${waypoints.length}`,
        type: 'info',
      });
    } else {
      setSimStep(0);
    }
  };

  if (isLoading && !activeDelivery) {
    return <div className="p-8 text-center text-xs">Loading active delivery details...</div>;
  }

  if (!activeDelivery) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto mt-8">
        <Truck className="w-12 h-12 text-content-light mx-auto mb-3" />
        <h3 className="text-base font-bold text-content-primary">No Active Delivery</h3>
        <p className="text-xs text-content-secondary mt-1">
          You do not have any tasks currently assigned. Check Available Pickups to start a route.
        </p>
      </Card>
    );
  }

  const don = activeDelivery.donationId || {};
  const isPickedUp = ['PICKED_UP', 'IN_TRANSIT'].includes(activeDelivery.status);

  const mapMarkers = [
    {
      coords: activeDelivery.pickupLocation?.coordinates || [75.8937, 22.7533],
      type: 'DONOR',
      title: 'Pickup Location',
      description: don.foodName,
    },
    {
      coords: activeDelivery.dropLocation?.coordinates || [75.8841, 22.7156],
      type: 'RECEIVER',
      title: 'Drop Location',
      description: 'Asha Kiran Shelter',
    },
    {
      coords: currentCoords,
      type: 'DELIVERY',
      title: 'Your Vehicle (Live)',
      description: 'Speed: 24 km/h',
    },
  ];

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-content-secondary">
              Active Delivery Task #{activeDelivery._id.slice(-6)}
            </span>
            <StatusBadge status={activeDelivery.status} />
          </div>
          <h1 className="text-2xl font-bold font-heading text-brand-950">
            {don.foodName || 'Surplus Food'}
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            {don.estimatedMeals || 100} meals • {activeDelivery.distanceKm} km transit distance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            icon={AlertTriangle}
          >
            Report Issue
          </Button>

          {!isPickedUp && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPickupModalOpen(true)}
              icon={CheckCircle2}
            >
              Verify Food Pickup (OTP)
            </Button>
          )}
        </div>
      </div>

      {/* Demo Simulation Control Bar */}
      <div className="p-3 bg-surface-subtle border border-surface-border rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-brand-600 animate-spin" />
          <span className="font-semibold text-content-primary">
            Evaluator Simulation Mode: GPS Location Tracking
          </span>
        </div>
        <button
          onClick={advanceSimulation}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-surface-border hover:border-brand-500 rounded-lg font-bold text-brand-800 shadow-sm"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Advance Vehicle Simulation ({simStep + 1}/5)</span>
        </button>
      </div>

      {/* Interactive Map */}
      <Card className="p-2 overflow-hidden">
        <MapView
          markers={mapMarkers}
          height="320px"
          center={[22.73, 75.88]}
          zoom={13}
          routeCoordinates={waypoints.map((w) => [w[1], w[0]])}
        />
      </Card>

      {/* Pickup vs Drop Off Comparison Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pickup Details */}
        <Card className={`space-y-3 ${!isPickedUp ? 'border-2 border-brand-500 bg-brand-50/20' : ''}`}>
          <div className="flex items-center justify-between border-b border-surface-border pb-2">
            <span className="text-xs font-bold text-brand-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Step 1: Donor Pickup</span>
            </span>
            {isPickedUp ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Picked Up ✓
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Current Objective
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-bold text-content-primary">
              {activeDelivery.pickupLocation?.address || 'Hotel Banquet Dispatch'}
            </p>
            <p className="text-content-secondary">
              Contact: {activeDelivery.pickupLocation?.contactPerson || 'Catering Desk'}
            </p>
            <p className="text-brand-700 font-semibold pt-1">
              Instructions: Request donor's 6-digit cryptographic OTP to verify and proceed.
            </p>
          </div>
        </Card>

        {/* Drop Details */}
        <Card className={`space-y-3 ${isPickedUp ? 'border-2 border-brand-500 bg-brand-50/20' : ''}`}>
          <div className="flex items-center justify-between border-b border-surface-border pb-2">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Step 2: Receiver Delivery</span>
            </span>
            {isPickedUp ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded animate-pulse">
                In Transit &rarr;
              </span>
            ) : (
              <span className="text-[10px] font-bold text-content-light">Pending Pickup</span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-bold text-content-primary">
              {activeDelivery.dropLocation?.address || 'Asha Kiran Community Shelter'}
            </p>
            <p className="text-content-secondary">
              Receiver Rep: {activeDelivery.dropLocation?.contactPerson || 'Staff Manager'}
            </p>
            <p className="text-blue-700 font-semibold pt-1">
              Instructions: Present handover code to receiver upon arrival for their digital signature confirmation.
            </p>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <PickupConfirmationModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        delivery={activeDelivery}
        onConfirmed={fetchActive}
      />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        deliveryId={activeDelivery._id}
      />
    </div>
  );
}
