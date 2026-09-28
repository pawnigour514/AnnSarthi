import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sliders, Save, Info, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function SafetyRulesConfigPage() {
  const { addToast } = useDemoStore();
  const [rules, setRules] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/safety/rules').then((res) => {
      setRules(res.data?.data || null);
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/safety/rules', rules);
      addToast({
        title: 'Safety Policy Updated',
        message: 'Food safety matrices and verification thresholds updated across the ecosystem.',
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not update safety rules', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!rules) return <div className="p-8 text-center text-xs">Loading safety rules...</div>;

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-brand-950">
            Food Safety Policy & Threshold Matrix
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
            Configurable regulatory rules governing automated risk screening and hold triggers
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} icon={Save}>
          Save Policy Changes
        </Button>
      </div>

      {/* Mandatory Statutory Notice */}
      <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-brand-900 leading-relaxed">
          <strong>Regulatory Notice:</strong> {rules.labelNotice}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Auto-verify Toggle */}
        <Card className="p-5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold font-heading text-content-primary">
              Auto-Verify Low-Risk Listings
            </h4>
            <p className="text-xs text-content-secondary mt-0.5">
              When enabled, donations with 100% passed rules and &ge;85 score auto-transition to VERIFIED.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rules.autoVerifyLowRisk}
              onChange={(e) => setRules({ ...rules, autoVerifyLowRisk: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
          </label>
        </Card>

        {/* Shelf Life Matrix */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold font-heading text-brand-900 border-b border-surface-border pb-2">
            Maximum Allowable Hours Since Preparation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cooked Meal */}
            <div className="p-4 bg-surface-subtle rounded-xl border border-surface-border space-y-3">
              <span className="font-bold text-xs text-brand-900 block">Cooked Meals</span>
              <Input
                label="Ambient / Room Temp (hrs)"
                type="number"
                value={rules.shelfLifeMatrixHours?.cookedMeal?.ambient || 4}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    shelfLifeMatrixHours: {
                      ...rules.shelfLifeMatrixHours,
                      cookedMeal: {
                        ...rules.shelfLifeMatrixHours.cookedMeal,
                        ambient: Number(e.target.value),
                      },
                    },
                  })
                }
              />
              <Input
                label="Heated Casserole (hrs)"
                type="number"
                value={rules.shelfLifeMatrixHours?.cookedMeal?.heated || 6}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    shelfLifeMatrixHours: {
                      ...rules.shelfLifeMatrixHours,
                      cookedMeal: {
                        ...rules.shelfLifeMatrixHours.cookedMeal,
                        heated: Number(e.target.value),
                      },
                    },
                  })
                }
              />
              <Input
                label="Refrigerated (hrs)"
                type="number"
                value={rules.shelfLifeMatrixHours?.cookedMeal?.refrigerated || 24}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    shelfLifeMatrixHours: {
                      ...rules.shelfLifeMatrixHours,
                      cookedMeal: {
                        ...rules.shelfLifeMatrixHours.cookedMeal,
                        refrigerated: Number(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>

            {/* Dairy & Bakery */}
            <div className="p-4 bg-surface-subtle rounded-xl border border-surface-border space-y-3">
              <span className="font-bold text-xs text-brand-900 block">Dairy & Bakery</span>
              <Input
                label="Ambient / Room Temp (hrs)"
                type="number"
                value={rules.shelfLifeMatrixHours?.dairyBakery?.ambient || 6}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    shelfLifeMatrixHours: {
                      ...rules.shelfLifeMatrixHours,
                      dairyBakery: {
                        ...rules.shelfLifeMatrixHours.dairyBakery,
                        ambient: Number(e.target.value),
                      },
                    },
                  })
                }
              />
              <Input
                label="Refrigerated (hrs)"
                type="number"
                value={rules.shelfLifeMatrixHours?.dairyBakery?.refrigerated || 36}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    shelfLifeMatrixHours: {
                      ...rules.shelfLifeMatrixHours,
                      dairyBakery: {
                        ...rules.shelfLifeMatrixHours.dairyBakery,
                        refrigerated: Number(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>

            {/* Fresh Produce */}
            <div className="p-4 bg-surface-subtle rounded-xl border border-surface-border space-y-3">
              <span className="font-bold text-xs text-brand-900 block">Fresh Produce</span>
              <Input
                label="Ambient (hrs)"
                type="number"
                value={rules.shelfLifeMatrixHours?.freshProduce?.ambient || 48}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    shelfLifeMatrixHours: {
                      ...rules.shelfLifeMatrixHours,
                      freshProduce: {
                        ...rules.shelfLifeMatrixHours.freshProduce,
                        ambient: Number(e.target.value),
                      },
                    },
                  })
                }
              />
              <Input
                label="Refrigerated (hrs)"
                type="number"
                value={rules.shelfLifeMatrixHours?.freshProduce?.refrigerated || 96}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    shelfLifeMatrixHours: {
                      ...rules.shelfLifeMatrixHours,
                      freshProduce: {
                        ...rules.shelfLifeMatrixHours.freshProduce,
                        refrigerated: Number(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>

            {/* Transit Window */}
            <div className="p-4 bg-surface-subtle rounded-xl border border-surface-border space-y-3">
              <span className="font-bold text-xs text-brand-900 block">Transit Feasibility</span>
              <Input
                label="Min Pickup Window (hrs)"
                type="number"
                step="0.1"
                value={rules.minPickupWindowHours || 0.5}
                onChange={(e) => setRules({ ...rules, minPickupWindowHours: Number(e.target.value) })}
                helperText="Minimum window required before pickup deadline."
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
