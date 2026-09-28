import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Select';
import { AlertTriangle, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { useDemoStore } from '../../store/demoStore';

export function ReportIssueModal({ isOpen, onClose, deliveryId }) {
  const { addToast } = useDemoStore();
  const [issueCategory, setIssueCategory] = useState('PACKAGING_DAMAGED');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/deliveries/${deliveryId}/report-issue`, {
        issueCategory,
        description,
      });

      addToast({
        title: 'Issue Logged',
        message: 'Incident reported to operations review team.',
        type: 'warning',
      });
      onClose();
    } catch (err) {
      addToast({
        title: 'Error',
        message: 'Could not log issue',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Incident / Concern" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <p className="text-xs text-content-secondary">
          Flagging an issue alerts the safety operations team and pauses the redistribution clock if food integrity is compromised.
        </p>

        <Select
          label="Issue Category"
          value={issueCategory}
          onChange={(e) => setIssueCategory(e.target.value)}
          options={[
            { value: 'PACKAGING_DAMAGED', label: 'Packaging Damaged / Lid Unsealed' },
            { value: 'FOOD_CONDITION_CONCERN', label: 'Food Condition / Temperature Concern' },
            { value: 'DONOR_UNAVAILABLE', label: 'Donor Unavailable at Pickup Gate' },
            { value: 'RECEIVER_UNAVAILABLE', label: 'Receiver Unavailable at Drop Point' },
            { value: 'VEHICLE_BREAKDOWN', label: 'Vehicle Breakdown / Transit Delay' },
            { value: 'OTHER', label: 'Other Operational Obstacle' },
          ]}
        />

        <Textarea
          label="Detailed Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what occurred (e.g. foil seal was punctured; soup spilled during transfer)..."
          required
        />

        <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" isLoading={isSubmitting} icon={AlertTriangle}>
            Submit Incident Report
          </Button>
        </div>
      </form>
    </Modal>
  );
}
