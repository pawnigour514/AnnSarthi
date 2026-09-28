import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/badges/RiskBadge';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';
import { useNavigate } from 'react-router-dom';

export function AvailableFoodPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const { addToast } = useDemoStore();
  const navigate = useNavigate();

  const fetchAvailable = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/matches/available-for-receivers');
      setItems(data.data || []);
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not fetch available food', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleAcceptMatch = async (donationId) => {
    setAcceptingId(donationId);
    try {
      await api.post('/matches/accept', { donationId });
      addToast({
        title: 'Donation Accepted!',
        message: 'A pickup request has been dispatched to nearby delivery partners.',
        type: 'success',
      });
      navigate('/receiver/incoming');
    } catch (err) {
      addToast({
        title: 'Acceptance Error',
        message: err.response?.data?.error?.message || 'Could not claim donation',
        type: 'error',
      });
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Explainable Smart Matching Active
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">
          Available Verified Surplus Food
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          Only listings verified through AI-assisted risk screening and hygiene checks are presented here.
        </p>
      </div>

      {/* Listings */}
      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm font-bold text-content-primary">No available surplus listings right now</p>
          <p className="text-xs text-content-secondary mt-1 max-w-sm mx-auto">
            All fresh donations have been matched. You will receive an instant notification when new food is screened and verified.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(({ donation, match }) => {
            const factors = match?.factorBreakdown || {
              foodTypeScore: 90,
              quantityFitScore: 85,
              distanceScore: 88,
              distanceKm: 2.4,
              timeWindowScore: 90,
            };

            return (
              <Card
                key={donation._id}
                className="flex flex-col justify-between space-y-4 border-2 hover:border-brand-300 transition-all shadow-soft"
              >
                {/* Top Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-surface-border pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {donation.category}
                        </span>
                        <RiskBadge riskLevel={donation.riskLevel} />
                      </div>
                      <h3 className="text-base font-bold font-heading text-brand-950">
                        {donation.foodName}
                      </h3>
                      <p className="text-xs text-content-secondary mt-0.5">
                        {donation.estimatedMeals} meals ({donation.quantity} {donation.unit}) • {donation.dietType}
                      </p>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right flex-shrink-0">
                      <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-center">
                        <span className="text-lg font-black font-heading text-brand-800 leading-none block">
                          {match.matchScore}%
                        </span>
                        <span className="text-[9px] uppercase font-bold text-brand-600 block mt-0.5">
                          Match Fit
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transparent Explanation Box */}
                  <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border space-y-2">
                    <span className="text-[11px] font-bold text-content-primary flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Transparent Factor Breakdown:</span>
                    </span>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                      <div>
                        <div className="flex justify-between text-content-secondary">
                          <span>Diet & Category:</span>
                          <span className="font-semibold text-content-primary">
                            {factors.foodTypeScore}%
                          </span>
                        </div>
                        <ProgressBar value={factors.foodTypeScore} height="h-1.5" />
                      </div>

                      <div>
                        <div className="flex justify-between text-content-secondary">
                          <span>Quantity Fit:</span>
                          <span className="font-semibold text-content-primary">
                            {factors.quantityFitScore}%
                          </span>
                        </div>
                        <ProgressBar value={factors.quantityFitScore} height="h-1.5" />
                      </div>

                      <div>
                        <div className="flex justify-between text-content-secondary">
                          <span>Distance ({factors.distanceKm} km):</span>
                          <span className="font-semibold text-content-primary">
                            {factors.distanceScore}%
                          </span>
                        </div>
                        <ProgressBar value={factors.distanceScore} height="h-1.5" />
                      </div>

                      <div>
                        <div className="flex justify-between text-content-secondary">
                          <span>Delivery Window:</span>
                          <span className="font-semibold text-content-primary">
                            {factors.timeWindowScore}%
                          </span>
                        </div>
                        <ProgressBar value={factors.timeWindowScore} height="h-1.5" />
                      </div>
                    </div>

                    <p className="text-[10px] text-content-light italic pt-1 border-t border-surface-border">
                      {match.explanationText}
                    </p>
                  </div>

                  {/* Pickup & Storage Details */}
                  <div className="space-y-1.5 text-xs text-content-secondary pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      <span>{donation.pickupLocation?.address?.formattedAddress || 'Indore'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>
                        Deadline: {new Date(donation.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <div className="pt-3 border-t border-surface-border">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    isLoading={acceptingId === donation._id}
                    onClick={() => handleAcceptMatch(donation._id)}
                    icon={Send}
                  >
                    Accept Donation & Request Driver
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
