import React, { useState, useRef } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { OTPInput } from '../../components/ui/OTPInput';
import { Input } from '../../components/ui/Input';
import { CheckCircle2, AlertTriangle, KeyRound, PenTool, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { useDemoStore } from '../../store/demoStore';
import confetti from 'canvas-confetti';

export function DeliveryConfirmationModal({ isOpen, onClose, delivery, onConfirmed }) {
  const { addToast } = useDemoStore();
  const [otp, setOtp] = useState('');
  const [quantityReceived, setQuantityReceived] = useState(
    delivery?.donationId?.estimatedMeals || '100'
  );
  const [conditionOk, setConditionOk] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Simple signature pad simulation on canvas
  const canvasRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#14532D';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirm = async () => {
    if (!otp) {
      setError('Please enter the 6-digit confirmation OTP.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const signatureDataUrl = canvasRef.current?.toDataURL() || '';
      await api.post(`/deliveries/${delivery._id}/confirm-delivery`, {
        otp,
        signatureDataUrl,
        quantityReceivedMeals: Number(quantityReceived),
        conditionConfirmed: conditionOk,
        currentCoords: [75.8841, 22.7156],
      });

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      addToast({
        title: 'Delivery Confirmed 🎉',
        message: 'Donation marked as COMPLETED! Environmental impact recorded.',
        type: 'success',
      });

      if (onConfirmed) onConfirmed();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid OTP or confirmation error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !delivery) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receiver Food Delivery Confirmation" maxWidth="max-w-lg">
      <div className="space-y-4 text-left">
        <p className="text-xs text-content-secondary leading-relaxed">
          Verify physical handover of <strong>{delivery.donationId?.foodName}</strong> from delivery partner{' '}
          <strong>{delivery.partnerId?.name || 'Driver'}</strong>.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-risk-high flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: OTP Entry */}
        <div className="p-4 bg-surface-subtle border border-surface-border rounded-xl space-y-2">
          <span className="text-xs font-bold text-content-primary flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-brand-600" />
            <span>1. Enter Delivery Handshake OTP</span>
          </span>
          <p className="text-[11px] text-content-secondary">
            Enter the 6-digit code shown on the delivery partner's app upon physical arrival.
          </p>
          <OTPInput value={otp} onChange={setOtp} onComplete={setOtp} />
        </div>

        {/* Step 2: Quality Inspection Confirmation */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-content-primary block">2. Visual Inspection & Count</span>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Meals Received"
              type="number"
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(e.target.value)}
              required
            />
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-surface-border bg-white hover:bg-surface-subtle">
                <input
                  type="checkbox"
                  checked={conditionOk}
                  onChange={(e) => setConditionOk(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-content-primary">
                  Thermal Seal & Condition OK
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 3: Digital Signature Pad */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-content-primary flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-brand-600" />
              <span>3. Beneficiary / Receiver Representative Signature</span>
            </span>
            {hasSignature && (
              <button
                type="button"
                onClick={clearSignature}
                className="text-[11px] font-semibold text-risk-high hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="border border-surface-border rounded-xl overflow-hidden bg-white shadow-inner">
            <canvas
              ref={canvasRef}
              width={450}
              height={100}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-24 cursor-crosshair touch-none"
            />
          </div>
          <p className="text-[10px] text-content-light">
            Sign above with touch or mouse to record digital receipt evidence.
          </p>
        </div>

        {/* Confirm Button */}
        <div className="pt-3 border-t border-surface-border flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            icon={Check}
          >
            Confirm Food Delivery & Complete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
