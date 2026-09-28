import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Sparkles, TrendingUp, Users, Clock, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DemandInsightsPage() {
  const [area, setArea] = useState('Indore Central / Palasia');
  const [day, setDay] = useState('6'); // Sunday

  const demandData = [
    { time: '08:00', meals: 60 },
    { time: '10:00', meals: 90 },
    { time: '12:00', meals: 240 }, // Lunch peak
    { time: '14:00', meals: 180 },
    { time: '16:00', meals: 80 },
    { time: '18:00', meals: 190 },
    { time: '20:00', meals: 380 }, // Dinner peak
    { time: '22:00', meals: 110 },
  ];

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            AI Decision Support Module 3
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">
          Zonal Food Demand Forecast
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          Projected hunger relief requirements aggregated by geographical zone and meal schedules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <h3 className="text-sm font-bold font-heading text-brand-900 border-b border-surface-border pb-2">
            Zone Parameters
          </h3>

          <div className="space-y-3">
            <Select
              label="Ecosystem Area / Zone"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              options={[
                { value: 'Indore Central / Palasia', label: 'Indore Central / Palasia' },
                { value: 'Vijay Nagar & Scheme 54', label: 'Vijay Nagar & Scheme 54' },
                { value: 'Rajwada / Sarafa Zone', label: 'Rajwada / Sarafa Zone' },
                { value: 'Bhawarkua University Area', label: 'Bhawarkua University Area' },
              ]}
            />

            <Select
              label="Target Day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              options={[
                { value: '0', label: 'Monday' },
                { value: '2', label: 'Wednesday' },
                { value: '4', label: 'Friday' },
                { value: '5', label: 'Saturday' },
                { value: '6', label: 'Sunday (Peak Demand)' },
              ]}
            />

            <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border text-xs space-y-1">
              <span className="font-bold text-brand-900 block">Forecast Model Details:</span>
              <p className="text-content-secondary">
                Method: <strong>ML & Area Schedule Aggregator</strong>
              </p>
              <p className="text-content-secondary">Confidence: <strong>86%</strong></p>
              <p className="text-[10px] text-content-light mt-1">
                Aggregated across 12 registered community shelters and night shelters.
              </p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h3 className="text-sm font-bold font-heading text-brand-900">
                Hourly Demand Pattern ({area})
              </h3>
              <p className="text-xs text-content-secondary">
                Peak expected hunger distribution windows
              </p>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">
              Projected Total: 1,330 meals
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F7F2" vertical={false} />
                <XAxis dataKey="time" stroke="#94A89C" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A89C" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.75rem',
                    borderColor: '#E3EFE6',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="meals" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-start gap-2 text-[11px] text-brand-900">
            <Info className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" />
            <span>
              Dinner peak (19:30 - 21:00) experiences the highest unfulfilled demand in this zone. Donors
              are prioritized to route hot evening banquet surpluses to this quadrant.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
