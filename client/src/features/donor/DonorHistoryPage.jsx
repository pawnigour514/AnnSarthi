import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { RiskBadge } from '../../components/badges/RiskBadge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Search, Filter, PlusCircle } from 'lucide-react';

export function DonorHistoryPage() {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let url = '/donations?limit=50';
    if (statusFilter) url += `&status=${statusFilter}`;

    api
      .get(url)
      .then((res) => {
        setDonations(res.data?.data?.donations || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  const filtered = donations.filter((d) =>
    d.foodName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-brand-950">My Donation History</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
            Full audit log of your surplus listings, risk screening outcomes, and recipient deliveries
          </p>
        </div>

        <Link
          to="/donor/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Donation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by food name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'VERIFIED', label: 'Verified Safe' },
              { value: 'REVIEW_REQUIRED', label: 'Review Required' },
              { value: 'IN_TRANSIT', label: 'In Transit' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'DRAFT', label: 'Drafts' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-content-secondary uppercase text-[10px] tracking-wider border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Food Item</th>
                <th className="py-3 px-4">Quantity / Meals</th>
                <th className="py-3 px-4">Risk Screening</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-content-light">
                    No donation records found.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d._id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 text-content-secondary whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-content-primary block">{d.foodName}</span>
                      <span className="text-[10px] text-content-light capitalize">
                        {d.category} • {d.dietType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-content-primary">
                      {d.estimatedMeals} meals ({d.quantity} {d.unit})
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge riskLevel={d.riskLevel} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/donations/${d._id}`}
                        className="text-xs font-bold text-brand-700 hover:underline"
                      >
                        Details &rarr;
                      </Link>
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
