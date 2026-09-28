import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, XCircle, Users, FileText, Check, X, ShieldAlert } from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function VerificationCenterPage() {
  const [pending, setPending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useDemoStore();

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/admin/verifications');
      setPending(data.data || []);
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not fetch verifications', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleDecision = async (userId, decision) => {
    try {
      await api.post(`/admin/verifications/${userId}/decision`, {
        decision,
        reason: decision === 'VERIFIED' ? 'Registration credentials and ID proof verified.' : 'Incomplete documentation provided.',
      });
      addToast({
        title: 'Organization Verification Updated',
        message: `Account has been marked as ${decision}.`,
        type: 'success',
      });
      fetchPending();
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not update verification', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">Organization Verification Center</h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          Verify registration documents, FSSAI licenses, and identity proofs before organizations can transact
        </p>
      </div>

      {pending.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-content-primary">No Pending Verifications</p>
          <p className="text-xs text-content-secondary mt-1">
            All registered donors, community shelters, and delivery partners are currently verified.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.map(({ user, profile }) => (
            <Card key={user._id} className="p-5 border-2 border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {user.role}
                  </span>
                  <span className="text-xs font-semibold text-content-secondary">
                    Registered: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold font-heading text-brand-950">{user.name}</h3>
                <p className="text-xs text-content-secondary">
                  Email: {user.email} • Phone: {user.phone || 'N/A'} • Address: {profile?.address?.formattedAddress || 'Indore'}
                </p>
                {profile?.fssaiLicenseNumber && (
                  <span className="inline-block text-[11px] font-semibold text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
                    FSSAI: {profile.fssaiLicenseNumber}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleDecision(user._id, 'VERIFIED')}
                  icon={Check}
                >
                  Approve Account
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDecision(user._id, 'REJECTED')}
                  icon={X}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
