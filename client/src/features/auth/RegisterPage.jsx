import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { AlertCircle, User, Mail, Lock, Phone, Building, Truck, Heart } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'DONOR';

  const { register } = useAuthStore();
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Role-specific fields
  const [donorType, setDonorType] = useState('Restaurant');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [receiverType, setReceiverType] = useState('NGO');
  const [dailyCapacity, setDailyCapacity] = useState('150');
  const [vehicleType, setVehicleType] = useState('Two-Wheeler');
  const [maxCapacityKg, setMaxCapacityKg] = useState('30');
  const [streetAddress, setStreetAddress] = useState('Indore');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const profileData = {
      donorType,
      fssaiLicenseNumber: fssaiNumber,
      receiverType,
      dailyMealCapacity: Number(dailyCapacity),
      vehicleType,
      maxCapacityKg: Number(maxCapacityKg),
      address: {
        street: streetAddress,
        city: 'Indore',
        state: 'Madhya Pradesh',
        formattedAddress: `${streetAddress}, Indore, MP`,
      },
    };

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        phone,
        profileData,
      });

      const routes = {
        DONOR: '/donor',
        DELIVERY_PARTNER: '/delivery',
        RECEIVER: '/receiver',
      };
      navigate(routes[user.role] || '/donor');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <img src="/logo.svg" alt="AnnSarthi" className="w-10 h-10" />
          <span className="font-extrabold text-2xl font-heading text-brand-900">AnnSarthi</span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-content-primary">
          Join the Ecosystem
        </h2>
        <p className="text-xs text-content-secondary mt-1">
          Select your organization role to begin onboarding
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-soft border border-surface-border rounded-2xl text-left">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-risk-high flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-content-primary mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('DONOR')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'DONOR'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                    : 'border-surface-border bg-white text-content-secondary hover:bg-surface-subtle'
                }`}
              >
                <Building className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                <span className="text-xs block">Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('RECEIVER')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'RECEIVER'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                    : 'border-surface-border bg-white text-content-secondary hover:bg-surface-subtle'
                }`}
              >
                <Heart className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">NGO / Receiver</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('DELIVERY_PARTNER')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'DELIVERY_PARTNER'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                    : 'border-surface-border bg-white text-content-secondary hover:bg-surface-subtle'
                }`}
              >
                <Truck className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <span className="text-xs block">Delivery Partner</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization / Full Name"
              type="text"
              placeholder="e.g. Sayaji Caterers or Asha Kiran Shelter"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="contact@org.org"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98260 00000"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Role-Specific Fields */}
            {role === 'DONOR' && (
              <div className="p-4 bg-surface-subtle rounded-xl space-y-3 border border-surface-border">
                <span className="text-xs font-bold text-brand-900 block">Donor Profile Setup</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Donor Type"
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value)}
                    options={[
                      { value: 'Restaurant', label: 'Restaurant' },
                      { value: 'Hotel', label: 'Hotel' },
                      { value: 'College', label: 'College / University' },
                      { value: 'Wedding/Event organizer', label: 'Wedding / Event Organizer' },
                      { value: 'Office/Corporate', label: 'Corporate Office Cafeteria' },
                      { value: 'Grocery/Food store', label: 'Grocery / Mart' },
                      { value: 'Individual', label: 'Individual Citizen' },
                    ]}
                  />
                  <Input
                    label="FSSAI License (Optional)"
                    placeholder="14-digit FSSAI No."
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            {role === 'RECEIVER' && (
              <div className="p-4 bg-surface-subtle rounded-xl space-y-3 border border-surface-border">
                <span className="text-xs font-bold text-blue-900 block">Receiver Organization Setup</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Receiver Category"
                    value={receiverType}
                    onChange={(e) => setReceiverType(e.target.value)}
                    options={[
                      { value: 'shelter', label: 'Night Shelter' },
                      { value: 'community kitchen', label: 'Community Kitchen' },
                      { value: 'orphanage', label: 'Children Orphanage' },
                      { value: 'food bank', label: 'Food Bank' },
                      { value: 'NGO', label: 'Registered NGO' },
                    ]}
                  />
                  <Input
                    label="Daily Meal Capacity"
                    type="number"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {role === 'DELIVERY_PARTNER' && (
              <div className="p-4 bg-surface-subtle rounded-xl space-y-3 border border-surface-border">
                <span className="text-xs font-bold text-amber-900 block">Logistics Partner Setup</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Vehicle Type"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    options={[
                      { value: 'Bicycle', label: 'Bicycle (Local short-haul)' },
                      { value: 'Two-Wheeler', label: 'Two-Wheeler (Motorbike/Scooter)' },
                      { value: 'Three-Wheeler', label: 'Three-Wheeler Auto' },
                      { value: 'Four-Wheeler/Van', label: 'Four-Wheeler Van' },
                      { value: 'Refrigerated Van', label: 'Refrigerated Cold-Chain Van' },
                    ]}
                  />
                  <Input
                    label="Max Capacity (kg)"
                    type="number"
                    value={maxCapacityKg}
                    onChange={(e) => setMaxCapacityKg(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <Input
              label="Location / Area"
              placeholder="e.g. Vijay Nagar, Palasia, or South Tukoganj"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full mt-4">
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-border text-center text-xs text-content-secondary">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-700 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
