import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Select';
import { Send, Clock, PlusCircle } from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function CreateRequirementPage() {
  const navigate = useNavigate();
  const { addToast } = useDemoStore();

  const [foodCategory, setFoodCategory] = useState('cookedMeal');
  const [dietType, setDietType] = useState('VEG');
  const [targetMeals, setTargetMeals] = useState('120');

  const now = new Date();
  const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [requiredBy, setRequiredBy] = useState(fourHoursLater);
  const [urgency, setUrgency] = useState('HIGH');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('Daily evening dinner distribution for homeless individuals at shelter.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/matches/requirements', {
        foodCategory,
        dietType,
        targetMeals: Number(targetMeals),
        requiredBy: new Date(requiredBy),
        urgency,
        isRecurring,
        notes,
      });

      addToast({
        title: 'Requirement Posted!',
        message: 'Your food demand has been broadcasted to surplus donors.',
        type: 'success',
      });
      navigate('/receiver/available');
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.response?.data?.error?.message || 'Could not post requirement',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">Post Food Requirement</h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
          Broadcast your community shelter or kitchen demand to nearby registered donors
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Food Category"
              value={foodCategory}
              onChange={(e) => setFoodCategory(e.target.value)}
              options={[
                { value: 'cookedMeal', label: 'Prepared Cooked Meals' },
                { value: 'dairyBakery', label: 'Bakery / Dairy Products' },
                { value: 'freshProduce', label: 'Raw Vegetables & Fruits' },
                { value: 'packagedDry', label: 'Dry Grains & Groceries' },
                { value: 'any', label: 'Any Nutritious Food' },
              ]}
            />

            <Select
              label="Dietary Requirement"
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              options={[
                { value: 'VEG', label: 'Vegetarian (Pure Veg)' },
                { value: 'NON_VEG', label: 'Non-Vegetarian' },
                { value: 'ANY', label: 'Any Diet' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Number of Meals / Servings"
              type="number"
              value={targetMeals}
              onChange={(e) => setTargetMeals(e.target.value)}
              required
            />

            <Input
              label="Required By (Time Window)"
              type="datetime-local"
              value={requiredBy}
              onChange={(e) => setRequiredBy(e.target.value)}
              required
            />

            <Select
              label="Urgency Level"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              options={[
                { value: 'LOW', label: 'Low (Flexible)' },
                { value: 'MEDIUM', label: 'Medium (Standard Service)' },
                { value: 'HIGH', label: 'High (Imminent Meal Service)' },
                { value: 'CRITICAL', label: 'Critical / Emergency Relief' },
              ]}
            />
          </div>

          <Textarea
            label="Beneficiary Notes & Logistics Instructions"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-content-primary">
                Recurring Requirement (Repeat schedule daily for dinner distribution)
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} icon={Send}>
              Publish Food Requirement
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
