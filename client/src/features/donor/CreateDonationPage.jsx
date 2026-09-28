import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Select';
import { FileUpload } from '../../components/ui/FileUpload';
import { SafetyScreeningModal } from './SafetyScreeningModal';
import { Sparkles, Save, ShieldCheck, MapPin } from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

export function CreateDonationPage() {
  const navigate = useNavigate();
  const { addToast } = useDemoStore();

  const [foodName, setFoodName] = useState('Matar Paneer & Pulao Rice');
  const [category, setCategory] = useState('cookedMeal');
  const [dietType, setDietType] = useState('VEG');
  const [quantity, setQuantity] = useState('35');
  const [unit, setUnit] = useState('kg');
  const [estimatedMeals, setEstimatedMeals] = useState('85');

  // Time handling: prep time 1 hour ago, deadline 4 hours from now
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString().slice(0, 16);
  const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [prepDateTime, setPrepDateTime] = useState(oneHourAgo);
  const [pickupDeadline, setPickupDeadline] = useState(fourHoursLater);
  const [storageMethod, setStorageMethod] = useState('ambient');
  const [packagingType, setPackagingType] = useState('Food Grade Foil / Box');
  const [streetAddress, setStreetAddress] = useState('Sayaji Hotel Banquet Hall, Vijay Nagar');
  const [notes, setNotes] = useState('Prepared for afternoon conference luncheon. Packed in insulated containers.');
  const [images, setImages] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screeningResult, setScreeningResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (isDraft = false) => {
    setIsSubmitting(true);
    try {
      const payload = {
        foodName,
        category,
        dietType,
        quantity: Number(quantity),
        unit,
        estimatedMeals: Number(estimatedMeals),
        preparationDateTime: new Date(prepDateTime),
        pickupDeadline: new Date(pickupDeadline),
        storageMethod,
        packagingType,
        pickupLocation: {
          type: 'Point',
          coordinates: [75.8937, 22.7533],
          address: { formattedAddress: streetAddress, city: 'Indore' },
        },
        notes,
        images: images.length > 0 ? images : [
          {
            url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=60',
            blurScore: 480,
            brightness: 130,
            pHash: 'phash_fresh_sample_' + Date.now(),
          }
        ],
        isDraft,
      };

      const { data } = await api.post('/donations', payload);

      if (isDraft) {
        addToast({
          title: 'Draft Saved',
          message: 'Donation draft has been saved to your records.',
          type: 'info',
        });
        navigate('/donor/donations');
      } else {
        setScreeningResult(data.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.response?.data?.error?.message || 'Failed to submit donation',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-brand-950">Create Food Donation</h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-1">
          Provide accurate preparation details for automated AI risk screening & recipient matching
        </p>
      </div>

      <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-soft space-y-6">
        {/* Food Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-heading text-brand-900 border-b border-surface-border pb-2 flex items-center gap-2">
            <span>1. Surplus Food Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Food Item Description"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Vegetable Biryani with Raita"
              required
            />

            <Select
              label="Food Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'cookedMeal', label: 'Prepared Cooked Meals' },
                { value: 'dairyBakery', label: 'Dairy & Bakery Items' },
                { value: 'freshProduce', label: 'Fresh Fruits & Vegetables' },
                { value: 'packagedDry', label: 'Packaged / Dry Rations' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Dietary Classification"
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              options={[
                { value: 'VEG', label: 'Vegetarian (Pure Veg)' },
                { value: 'NON_VEG', label: 'Non-Vegetarian' },
                { value: 'VEGAN', label: 'Vegan' },
                { value: 'OTHER', label: 'Other / Jain Food' },
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setEstimatedMeals(String(Math.round(Number(e.target.value) * 2.4)));
                }}
                required
              />
              <Select
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={[
                  { value: 'kg', label: 'Kilograms (kg)' },
                  { value: 'meals', label: 'Meals / Packets' },
                  { value: 'boxes', label: 'Boxes / Trays' },
                ]}
              />
            </div>

            <Input
              label="Estimated Servings / Meals"
              type="number"
              value={estimatedMeals}
              onChange={(e) => setEstimatedMeals(e.target.value)}
              helperText="Capacity of hungry people nourished"
              required
            />
          </div>
        </div>

        {/* Safety & Storage Parameters */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold font-heading text-brand-900 border-b border-surface-border pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>2. Preparation Timestamp & Storage Safety</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preparation Date & Time"
              type="datetime-local"
              value={prepDateTime}
              onChange={(e) => setPrepDateTime(e.target.value)}
              helperText="Must be in the past. Used for shelf-life verification."
              required
            />

            <Input
              label="Pickup Deadline"
              type="datetime-local"
              value={pickupDeadline}
              onChange={(e) => setPickupDeadline(e.target.value)}
              helperText="Time until food remains safe for pickup."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Current Storage Temperature"
              value={storageMethod}
              onChange={(e) => setStorageMethod(e.target.value)}
              options={[
                { value: 'ambient', label: 'Ambient / Room Temperature (Max 4 hrs for cooked meals)' },
                { value: 'heated', label: 'Heated Insulated Casseroles (>65°C)' },
                { value: 'refrigerated', label: 'Refrigerated Cold Storage (<5°C)' },
              ]}
            />

            <Select
              label="Packaging Type"
              value={packagingType}
              onChange={(e) => setPackagingType(e.target.value)}
              options={[
                { value: 'Food Grade Foil / Box', label: 'Food Grade Foil / Box' },
                { value: 'Airtight Container', label: 'Airtight Sealed Containers' },
                { value: 'Insulated Casserole', label: 'Insulated Hot Casseroles' },
                { value: 'Clean Reusable Tray', label: 'Clean Reusable Tray' },
              ]}
            />
          </div>
        </div>

        {/* Location & Photos */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold font-heading text-brand-900 border-b border-surface-border pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>3. Pickup Address & Photo Evidence</span>
          </h3>

          <Input
            label="Pickup Address / Landmark"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="e.g. Ground floor banquet dispatch gate, Sayaji Hotel"
            required
          />

          <FileUpload
            label="Food Photos for Visual Screening"
            sublabel="Upload 1-5 photos to verify appearance and container hygiene"
            value={images}
            onChange={setImages}
          />

          <Textarea
            label="Special Handling / Allergen Notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Contains dairy/nuts; handles and lids disinfected."
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            isLoading={isSubmitting}
            icon={Save}
          >
            Save as Draft
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleSubmit(false)}
            isLoading={isSubmitting}
            icon={Sparkles}
          >
            Submit for AI Safety Screening
          </Button>
        </div>
      </div>

      {/* Food Safety Screening Modal */}
      {screeningResult && (
        <SafetyScreeningModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assessment={screeningResult.assessment}
          donation={screeningResult.donation}
          onProceed={() => navigate(`/donations/${screeningResult.donation._id}`)}
        />
      )}
    </div>
  );
}
