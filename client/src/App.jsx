import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { Sidebar } from './components/navigation/Sidebar';
import { Topbar } from './components/navigation/Topbar';
import { ToastContainer } from './components/ui/Toast';
import { JudgeWalkthroughOverlay } from './components/ui/JudgeWalkthroughOverlay';
import { AssistantWidget } from './features/assistant/AssistantWidget';

// Public Pages
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';

// Donor Portal Pages
import { DonorOverview } from './features/donor/DonorOverview';
import { CreateDonationPage } from './features/donor/CreateDonationPage';
import { DonorHistoryPage } from './features/donor/DonorHistoryPage';
import { DonationDetailPage } from './features/donor/DonationDetailPage';
import { TrustProfilePage } from './features/donor/TrustProfilePage';
import { SurplusForecastPage } from './features/donor/SurplusForecastPage';

// Delivery Portal Pages
import { DeliveryOverview } from './features/delivery/DeliveryOverview';
import { AvailableRequestsPage } from './features/delivery/AvailableRequestsPage';
import { ActiveDeliveryPage } from './features/delivery/ActiveDeliveryPage';
import { RouteOptimizerPage } from './features/delivery/RouteOptimizerPage';

// Receiver Portal Pages
import { ReceiverOverview } from './features/receiver/ReceiverOverview';
import { AvailableFoodPage } from './features/receiver/AvailableFoodPage';
import { CreateRequirementPage } from './features/receiver/CreateRequirementPage';
import { IncomingDeliveriesPage } from './features/receiver/IncomingDeliveriesPage';
import { DemandInsightsPage } from './features/receiver/DemandInsightsPage';

// Admin Portal Pages
import { AdminOverview } from './features/admin/AdminOverview';
import { VerificationCenterPage } from './features/admin/VerificationCenterPage';
import { FoodSafetyReviewPage } from './features/admin/FoodSafetyReviewPage';
import { FraudAbusePage } from './features/admin/FraudAbusePage';
import { SafetyRulesConfigPage } from './features/admin/SafetyRulesConfigPage';
import { AuditLogPage } from './features/admin/AuditLogPage';

import { ShieldAlert, Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Guard with Role Check
function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-4">
          <img src="/logo.svg" alt="AnnSarthi Logo" className="w-16 h-16 animate-pulse" />
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin absolute -bottom-2 -right-2" />
        </div>
        <h3 className="font-heading font-extrabold text-lg text-content-primary">
          Initializing AnnSarthi
        </h3>
        <p className="text-xs text-content-secondary mt-1">
          Securing session & validating local credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned portal
    const roleRoutes = {
      DONOR: '/donor',
      DELIVERY_PARTNER: '/delivery',
      RECEIVER: '/receiver',
      ADMIN: '/admin',
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return <Outlet />;
}

// App Layout with Sidebar, Topbar, Persistent Safety Disclaimer & AI Assistant
function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Header */}
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          onAssistantToggle={() => setIsAssistantOpen((prev) => !prev)}
        />

        {/* Page View Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Persistent Non-Negotiable Safety Principle Footer */}
        <footer className="mt-auto border-t border-surface-border bg-amber-50/70 px-4 sm:px-6 py-3.5 text-left">
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
              <span className="font-bold uppercase tracking-wider text-amber-950">
                Non-Negotiable Safety Principle:
              </span>{' '}
              AnnSarthi does not certify or guarantee food safety. AI-assisted risk screening and image quality checks are advisory heuristics only. Mandatory human sensory checks, temperature logs, and visual inspection are required at pickup and delivery under FSSAI surplus food redistribution guidelines.
            </p>
          </div>
        </footer>
      </div>

      {/* Global Interactive Walkthrough for Judges */}
      <JudgeWalkthroughOverlay />

      {/* Role-Gated Operations Assistant Drawer */}
      <AssistantWidget isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
}

export function App() {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen text-content-primary">
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application Shell */}
          <Route element={<AppLayout />}>
            {/* Impact Analytics (Accessible across all authenticated roles & Admin) */}
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Donor Portal */}
            <Route element={<ProtectedRoute allowedRoles={['DONOR', 'ADMIN']} />}>
              <Route path="/donor" element={<DonorOverview />} />
              <Route path="/donor/create" element={<CreateDonationPage />} />
              <Route path="/donor/donations" element={<DonorHistoryPage />} />
              <Route path="/donor/donations/:id" element={<DonationDetailPage />} />
              <Route path="/donor/trust" element={<TrustProfilePage />} />
              <Route path="/donor/forecast" element={<SurplusForecastPage />} />
            </Route>

            {/* Delivery Partner Portal */}
            <Route element={<ProtectedRoute allowedRoles={['DELIVERY_PARTNER', 'ADMIN']} />}>
              <Route path="/delivery" element={<DeliveryOverview />} />
              <Route path="/delivery/requests" element={<AvailableRequestsPage />} />
              <Route path="/delivery/active" element={<ActiveDeliveryPage />} />
              <Route path="/delivery/route" element={<RouteOptimizerPage />} />
            </Route>

            {/* Receiver / NGO Portal */}
            <Route element={<ProtectedRoute allowedRoles={['RECEIVER', 'ADMIN']} />}>
              <Route path="/receiver" element={<ReceiverOverview />} />
              <Route path="/receiver/available" element={<AvailableFoodPage />} />
              <Route path="/receiver/requirement" element={<CreateRequirementPage />} />
              <Route path="/receiver/incoming" element={<IncomingDeliveriesPage />} />
              <Route path="/receiver/insights" element={<DemandInsightsPage />} />
            </Route>

            {/* Admin Portal */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/verifications" element={<VerificationCenterPage />} />
              <Route path="/admin/safety-reviews" element={<FoodSafetyReviewPage />} />
              <Route path="/admin/fraud" element={<FraudAbusePage />} />
              <Route path="/admin/rules" element={<SafetyRulesConfigPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
            </Route>
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Notifications Container */}
        <ToastContainer />
      </div>
    </QueryClientProvider>
  );
}
