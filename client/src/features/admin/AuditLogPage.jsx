import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FileText, Search, ShieldCheck } from 'lucide-react';

export function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let url = '/admin/audit-logs?limit=50';
    if (entityFilter) url += `&entityType=${entityFilter}`;

    api
      .get(url)
      .then((res) => {
        setLogs(res.data?.data?.logs || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [entityFilter]);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">
          Immutable System Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          Cryptographically auditable append-only ledger tracking all status transitions, verifications, and tool calls
        </p>
      </div>

      <Card className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by action or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            options={[
              { value: '', label: 'All Entities' },
              { value: 'DONATION', label: 'Donation Events' },
              { value: 'DELIVERY', label: 'Delivery Handshakes' },
              { value: 'SAFETY_ASSESSMENT', label: 'Safety Assessments' },
              { value: 'USER', label: 'User & Auth Actions' },
              { value: 'RULE_CONFIG', label: 'Rule Configurations' },
            ]}
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-content-secondary uppercase text-[10px] tracking-wider border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-content-light">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3 px-4 text-content-light whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-content-primary px-1.5 py-0.5 rounded bg-surface-subtle border border-surface-border text-[10px]">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-900">{log.action}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 font-bold text-[10px]">
                        {log.performedByRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-content-secondary max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
