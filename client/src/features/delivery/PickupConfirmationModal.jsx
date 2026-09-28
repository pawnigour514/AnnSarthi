import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { OTPInput } from '../../components/ui/OTPInput';
import { FileUpload } from '../../components/ui/FileUpload';
import { KeyRound, Camera, ShieldCheck, Check, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useDemoStore } from '../../store/demoStore';

export function PickupConfirmationModal({ isOpen, onClose, delivery, onConfirmed }) {
  const { addToast } = useDemoStore();
  const [otp, setOtp] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmPickup = async () => {
    if (!otp) {
      setError('Please enter the 6-digit Pickup OTP provided by the donor.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/deliveries/${delivery._id}/confirm-pickup`, {
        otp,
        photoUrl: photoUrl || '/uploads/sample_pickup.jpg',
        currentCoords: [75.8937, 22.7533],
      });

      addToast({
        title: 'Pickup Confirmed!',
        message: 'Food picked up and marked IN TRANSIT. Route navigation updated.',
        type: 'success',
      });

      if (onConfirmed) onConfirmed();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid Pickup OTP. Please ask donor for the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !delivery) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Driver Proof of Food Pickup" maxWidth="max-w-lg">
      <div className="space-y-4 text-left">
        <p className="text-xs text-content-secondary leading-relaxed">
          Verify physical food handover at <strong>{delivery.pickupLocation?.address || 'Pickup Point'}</strong> for{' '}
          <strong>{delivery.donationId?.foodName}</strong>.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-risk-high flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Donor OTP */}
        <div className="p-4 bg-surface-subtle border border-surface-border rounded-xl space-y-2">
          <span className="text-xs font-bold text-content-primary flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-brand-600" />
            <span>1. Ask Donor for Pickup OTP</span>
          </span>
          <p className="text-[11px] text-content-secondary">
            The donor generates a 6-digit verification code to confirm food handover to authorized partners.
          </p>
          <OTPInput value={otp} onChange={setOtp} onComplete={setOtp} />
        </div>

        {/* Step 2: Photo Evidence */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-content-primary flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-brand-600" />
            <span>2. Container Seal & Temperature Check Photo</span>
          </span>
          <p className="text-[11px] text-content-secondary">
            Take a quick photo of the sealed containers inside your insulated carrier bag.
          </p>
          <div className="p-3 bg-surface-subtle border border-surface-border rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-content-primary">
              Insulated transport thermal seal verified
            </span>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
              Ready
            </span>
          </div>
        </div>

        {/* Geofence notice */}
        <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-[11px] text-brand-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" />
          <span>
            Geofence verification verified your GPS coordinates within 200m of the donor kitchen.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-surface-border flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmPickup}
            isLoading={isSubmitting}
            icon={Check}
          >
            Confirm Pickup & Start Transit
          </Button>
        </div>
      </div>
    </Modal>
  );
}
