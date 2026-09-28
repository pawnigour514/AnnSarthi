import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setError('');
    setIsLoading(true);
    try {
      const user = await demoLogin(role);
      redirectByRole(user.role);
    } catch (err) {
      setError('Could not log into demo account. Please ensure server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectByRole = (role) => {
    const routes = {
      DONOR: '/donor',
      DELIVERY_PARTNER: '/delivery',
      RECEIVER: '/receiver',
      ADMIN: '/admin',
    };
    navigate(routes[role] || '/donor');
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <img src="/logo.svg" alt="AnnSarthi" className="w-10 h-10" />
          <span className="font-extrabold text-2xl font-heading text-brand-900">AnnSarthi</span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-content-primary">
          Sign In to Your Ecosystem Account
        </h2>
        <p className="text-xs text-content-secondary mt-1">
          Turn surplus food into shared nourishment across communities
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* 1-Click Demo Login Box */}
        <div className="mb-6 p-4 bg-brand-50/70 border border-brand-200 rounded-2xl text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Hackathon Judge Quick Login (1-Click)</span>
          </div>
          <p className="text-[11px] text-brand-800/80 mt-1">
            Choose a role to sign in instantly with seeded sample data:
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              type="button"
              onClick={() => handleDemoClick('DONOR')}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-bold bg-white border border-brand-200 hover:border-brand-500 rounded-xl text-brand-900 shadow-sm transition-all"
            >
              🍲 Donor (Hotel/Caterer)
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('RECEIVER')}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-bold bg-white border border-brand-200 hover:border-brand-500 rounded-xl text-brand-900 shadow-sm transition-all"
            >
              🏠 Receiver (Shelter/NGO)
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('DELIVERY_PARTNER')}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-bold bg-white border border-brand-200 hover:border-brand-500 rounded-xl text-brand-900 shadow-sm transition-all"
            >
              🛵 Delivery Partner
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('ADMIN')}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-bold bg-brand-900 text-white hover:bg-black rounded-xl shadow-sm transition-all"
            >
              🛡️ Administrator
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white py-8 px-6 shadow-soft border border-surface-border rounded-2xl text-left">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-risk-high flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-content-secondary">Demo password: DemoPassword123!</span>
              <a href="#forgot" className="font-semibold text-brand-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-border text-center text-xs text-content-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-700 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
