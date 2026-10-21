import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

export default function TenantAuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <span className="font-heading font-bold text-xl">Property Ledger</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-heading font-bold leading-tight">
              Your home,<br />simplified.
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Pay rent, track payments, raise complaints, manage documents, and stay connected with your property — all in one place.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {['Rent & Receipts', 'Document Center', 'Complaint Desk', 'Maintenance'].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-white/90">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/60 text-sm">© 2026 Property Ledger. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">Property Ledger</span>
          </div>
          <h1 className="text-2xl font-heading font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1 mb-6">{subtitle}</p>}
          <div className="mt-2">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}