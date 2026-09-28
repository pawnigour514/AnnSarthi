import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/badges/RiskBadge';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Select';
import { ShieldAlert, Check, X, HelpCircle, Pause, AlertTriangle, Info, Clock } from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function FoodSafetyReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionDecision, setActionDecision] = useState('');
  const [reason, setReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useDemoStore();

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/safety/reviews');
      setReviews(data.data || []);
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not fetch safety reviews', type: 'error' });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openDecisionModal = (rev, decision) => {
    setSelectedReview(rev);
    setActionDecision(decision);
    setReason(
      decision === 'APPROVED'
        ? 'Verified acceptable thermal container and validated storage timeline.'
        : decision === 'REJECTED'
        ? 'Exceeded safe maximum allowable ambient exposure limit.'
        : 'Requesting confirmation of refrigerator temperature log.'
    );
    setIsModalOpen(true);
  };

  const handleDecisionSubmit = async () => {
    if (!reason.trim()) {
      addToast({ title: 'Reason Required', message: 'A mandatory reason is required for compliance audit logs.', type: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/safety/reviews/${selectedReview._id}/decision`, {
        decision: actionDecision,
        reason,
      });

      addToast({
        title: 'Review Decision Recorded',
        message: `Donation review marked as ${actionDecision}. Donor has been notified.`,
        type: 'success',
      });

      setIsModalOpen(false);
      fetchReviews();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to record decision', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Human-in-the-Loop Review Required
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">
          Food Safety Inspector Review Queue
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          Listings held in REVIEW_REQUIRED status due to perishable category, shelf-life thresholds, or image anomalies.
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <Check className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-content-primary">Safety Review Queue Clear</p>
          <p className="text-xs text-content-secondary mt-1">
            All submitted surplus donations have been screened and verified.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((rev) => {
            const don = rev.donationId || {};
            const donor = don.donorId || {};

            return (
              <Card key={rev._id} className="p-6 border-2 border-amber-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <RiskBadge riskLevel={rev.riskLevel} score={rev.score} />
                      <span className="text-xs font-bold text-content-secondary">
                        Donation #{don._id?.slice(-6) || 'N/A'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-heading text-brand-950">{don.foodName}</h3>
                    <p className="text-xs text-content-secondary mt-0.5">
                      Donor: {donor.name} • Category: {don.category} • Storage: {don.storageMethod}
                    </p>
                  </div>

                  {/* Inspector Decision Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => openDecisionModal(rev, 'APPROVED')}
                      icon={Check}
                    >
                      Approve for Match
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDecisionModal(rev, 'REJECTED')}
                      icon={X}
                    >
                      Reject Listing
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openDecisionModal(rev, 'REQUEST_MORE_INFO')}
                      icon={HelpCircle}
                    >
                      Request Info
                    </Button>
                  </div>
                </div>

                {/* Screening Deductions & Rule Log */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border space-y-2">
                    <span className="font-bold text-brand-900 block">AI Screening Flags:</span>
                    <ul className="space-y-1">
                      {rev.reasons?.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-content-secondary">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border space-y-2">
                    <span className="font-bold text-brand-900 block">Timing & Preparation Audit:</span>
                    <div className="space-y-1 text-content-secondary">
                      <p>
                        Prepared: <strong>{new Date(don.preparationDateTime).toLocaleString()}</strong>
                      </p>
                      <p>
                        Pickup Deadline: <strong>{new Date(don.pickupDeadline).toLocaleString()}</strong>
                      </p>
                      <p>
                        Reported Storage: <strong className="capitalize">{don.storageMethod}</strong>
                      </p>
                      <p>
                        Packaging: <strong>{don.packagingType}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Non-negotiable protocol: Only approved items may enter matching. Rejections are protective
                    and logged with immutable audit rationale.
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {selectedReview && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Inspector Action: ${actionDecision}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-content-secondary">
              Record your verified regulatory reasoning for <strong>{selectedReview.donationId?.foodName}</strong>.
              This rationale will be archived in the immutable AuditLog and emailed to the donor.
            </p>

            <Textarea
              label="Mandatory Compliance Rationale"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the food safety standard rationale..."
              required
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant={actionDecision === 'REJECTED' ? 'danger' : 'primary'}
                onClick={handleDecisionSubmit}
                isLoading={isSubmitting}
                icon={Check}
              >
                Confirm {actionDecision}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
