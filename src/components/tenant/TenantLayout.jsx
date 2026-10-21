import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, CreditCard, FileText, MessageSquare, Wrench, Bell, Settings, LogOut, X, Building2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { path: '/tenant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tenant/payments', label: 'Payments', icon: CreditCard },
  { path: '/tenant/documents', label: 'Documents', icon: FileText },
  { path: '/tenant/complaints', label: 'Complaints', icon: MessageSquare },
  { path: '/tenant/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/tenant/notice', label: 'Notice', icon: Bell },
  { path: '/tenant/settings', label: 'Settings', icon: Settings },
];

const bottomTabs = navItems.slice(0, 5);

export default function TenantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { tenant, isLoading, isTenant } = useTenant();
  const { logout } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No tenant record found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your email doesn't match any registered tenant. Please contact your property manager to get added.
          </p>
          <Button onClick={() => logout()}>Log out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-indigo-950 to-blue-950 text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
          <Link to="/tenant/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm block">Tenant Portal</span>
              <span className="text-[10px] text-white/60">Property Ledger</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive ? 'bg-white/15 text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-[18px] h-[18px]" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
              {tenant?.full_name?.[0]?.toUpperCase() || 'T'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{tenant?.full_name}</p>
              <p className="text-[10px] text-white/60 truncate">{tenant?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" /> Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b bg-card/80 backdrop-blur-md flex items-center gap-3 px-4 lg:px-6 shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <ChevronLeft className="w-5 h-5 rotate-90" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{tenant?.full_name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard'}
            </p>
          </div>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground hidden sm:block">
            Admin Portal →
          </Link>
        </header>

        <main id="tenant-scroll" className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-0 pb-[calc(env(safe-area-inset-bottom)+72px)] lg:pb-6"
          style={{ overscrollBehavior: 'none' }}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}>
              <Outlet context={{ tenant }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom tab bar: mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {bottomTabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors
                ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium leading-tight">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}