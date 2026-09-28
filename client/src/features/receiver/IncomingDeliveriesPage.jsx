import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { MapView } from '../../components/map/MapView';
import { DeliveryConfirmationModal } from './DeliveryConfirmationModal';
import { Truck, Clock, MapPin, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function IncomingDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useDemoStore();

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/deliveries/my');
      setDeliveries(data.data || []);
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not fetch incoming deliveries', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 8000);
    return () => clearInterval(interval);
  }, []);

  const openConfirmation = (del) => {
    setSelectedDelivery(del);
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">Incoming Food Shipments</h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          Real-time tracking of partner dispatches, transit progression, and delivery handshakes
        </p>
      </div>

      {deliveries.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="w-10 h-10 text-brand-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-content-primary">No deliveries currently scheduled</p>
          <p className="text-xs text-content-secondary mt-1">
            Accept fresh donations from the Available Food portal to schedule a partner pickup.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {deliveries.map((del) => {
            const isDelivered = del.status === 'DELIVERED' || del.status === 'COMPLETED';
            const isInTransit = ['IN_TRANSIT', 'PICKED_UP', 'ACCEPTED', 'PICKUP_STARTED'].includes(
              del.status
            );

            const mapMarkers = [
              {
                coords: del.pickupLocation?.coordinates || [75.89, 22.75],
                type: 'DONOR',
                title: 'Pickup Location',
                description: 'Donor Dispatch Point',
                isMasked: true,
              },
              {
                coords: del.dropLocation?.coordinates || [75.88, 22.71],
                type: 'RECEIVER',
                title: 'Drop Location',
                description: 'Your Shelter/Kitchen Point',
              },
            ];

            return (
              <Card key={del._id} className="space-y-4 border-2 border-surface-border">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-content-secondary">
                        Shipment #{del._id.slice(-6)}
                      </span>
                      <StatusBadge status={del.status} />
                    </div>
                    <h3 className="text-lg font-bold font-heading text-brand-900">
                      {del.donationId?.foodName || 'Meals'}
                    </h3>
                  </div>

                  {isInTransit && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openConfirmation(del)}
                      icon={CheckCircle2}
                    >
                      Confirm Delivery Handshake (OTP)
                    </Button>
                  )}
                  {isDelivered && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Delivery Successfully Completed</span>
                    </span>
                  )}
                </div>

                {/* Details Grid & Mini Map */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Driver and Timeline info */}
                  <div className="lg:col-span-1 space-y-3 text-xs">
                    <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border space-y-2">
                      <span className="font-bold text-content-primary block">
                        Delivery Partner Assignment
                      </span>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-brand-600" />
                        <span className="text-content-secondary font-medium">
                          {del.partnerId?.name || 'Awaiting Partner Acceptance'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-content-secondary">
                        <Clock className="w-4 h-4 text-brand-600" />
                        <span>Estimated Transit: {del.estimatedDurationMinutes || 15} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-content-secondary">
                        <MapPin className="w-4 h-4 text-brand-600" />
                        <span>Total Route Distance: {del.distanceKm} km</span>
                      </div>
                    </div>

                    <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200">
                      <span className="text-[11px] font-bold text-brand-900 block mb-1">
                        🔒 Digital Proof Verification
                      </span>
                      <p className="text-[11px] text-brand-800/80 leading-relaxed">
                        Pickup verified by donor via cryptographic OTP. Upon arrival, inspect packaging
                        integrity and complete receiver confirmation with code <strong>123456</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Right: Map view */}
                  <div className="lg:col-span-2">
                    <MapView
                      markers={mapMarkers}
                      height="200px"
                      zoom={13}
                      center={[22.73, 75.88]}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedDelivery && (
        <DeliveryConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          delivery={selectedDelivery}
          onConfirmed={fetchDeliveries}
        />
      )}
    </div>
  );
}
