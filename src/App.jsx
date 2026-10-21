import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { I18nProvider } from '@/lib/i18n';

import AppLayout from '@/components/layout/AppLayout';

import Landing from '@/pages/Landing';
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Properties = lazy(() => import('@/pages/Properties'));
const PropertyDetails = lazy(() => import('@/pages/PropertyDetails'));
const RoomDetails = lazy(() => import('@/pages/RoomDetails'));
const Tenants = lazy(() => import('@/pages/Tenants'));
const TenantDetails = lazy(() => import('@/pages/TenantDetails'));
const Payments = lazy(() => import('@/pages/Payments'));
const Expenses = lazy(() => import('@/pages/Expenses'));
const AlertDetail = lazy(() => import('@/pages/AlertDetail'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const AIInsights = lazy(() => import('@/pages/AIInsights'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const TenantLogin = lazy(() => import('@/pages/tenant/TenantLogin'));
const TenantRegister = lazy(() => import('@/pages/tenant/TenantRegister'));
const TenantDashboard = lazy(() => import('@/pages/tenant/TenantDashboard'));
const TenantPayments = lazy(() => import('@/pages/tenant/TenantPayments'));
const TenantDocuments = lazy(() => import('@/pages/tenant/TenantDocuments'));
const TenantComplaints = lazy(() => import('@/pages/tenant/TenantComplaints'));
const TenantMaintenance = lazy(() => import('@/pages/tenant/TenantMaintenance'));
const TenantNotice = lazy(() => import('@/pages/tenant/TenantNotice'));
const TenantSettings = lazy(() => import('@/pages/tenant/TenantSettings'));
const TenantLayout = lazy(() => import('@/components/tenant/TenantLayout'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div></div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Landing />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/tenants/:id" element={<TenantDetails />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/alerts/:type" element={<AlertDetail />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-insights" element={<AIInsights />} />
          </Route>
        </Route>
        {/* Tenant Portal Routes */}
        <Route path="/tenant/login" element={<TenantLogin />} />
        <Route path="/tenant/register" element={<TenantRegister />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/tenant/login" replace />} />}>
          <Route element={<TenantLayout />}>
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/payments" element={<TenantPayments />} />
            <Route path="/tenant/documents" element={<TenantDocuments />} />
            <Route path="/tenant/complaints" element={<TenantComplaints />} />
            <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
            <Route path="/tenant/notice" element={<TenantNotice />} />
            <Route path="/tenant/settings" element={<TenantSettings />} />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <I18nProvider>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </I18nProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App