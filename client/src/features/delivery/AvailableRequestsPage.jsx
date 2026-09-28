import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { Truck, MapPin, Clock, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function AvailableRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const { addToast } = useDemoStore();
  const navigate = useNavigate();

  const fetchAvailable = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/deliveries/available');
      setRequests(data.data || []);
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not fetch pickup requests', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleAccept = async (deliveryId) => {
    setAcceptingId(deliveryId);
    try {
      await api.post(`/deliveries/${deliveryId}/accept`);
      addToast({
        title: 'Task Accepted!',
        message: 'Delivery assigned to you. Proceed to donor pickup location.',
        type: 'success',
      });
      navigate('/delivery/active');
    } catch (err) {
      addToast({
        title: 'Acceptance Error',
        message: err.response?.data?.error?.message || 'Could not accept task',
        type: 'error',
      });
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">Available Pickup Requests</h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          Surplus food matched with receivers ready for volunteer transit in your Indore quadrant
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="w-10 h-10 text-brand-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-content-primary">No available pickups right now</p>
          <p className="text-xs text-content-secondary mt-1">
            All requests are currently assigned. Stay online—new alerts arrive live!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((del) => {
            const don = del.donationId || {};
            return (
              <Card
                key={del._id}
                className="p-5 border-2 hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {don.category || 'Cooked Meal'}
                    </span>
                    <span className="text-xs font-bold text-content-secondary">
                      {del.distanceKm} km route
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-heading text-brand-950">
                    {don.foodName || 'Surplus Meals'}
                  </h3>

                  <div className="space-y-1 text-xs text-content-secondary">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                      <span>
                        <strong>Pickup:</strong> {del.pickupLocation?.address || 'Donor Gate'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>
                        <strong>Drop:</strong> {del.dropLocation?.address || 'Receiver Point'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                      <span>
                        Est. Duration: {del.estimatedDurationMinutes || 18} minutes • Quantity: {don.estimatedMeals || 100} meals
                      </span>
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center flex-shrink-0">
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={acceptingId === del._id}
                    onClick={() => handleAccept(del._id)}
                    icon={Check}
                  >
                    Accept Pickup & Navigate
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
