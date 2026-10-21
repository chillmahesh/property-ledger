import { motion } from 'framer-motion';
import { MapPin, Phone, CreditCard, Briefcase, Calendar, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const STATUS_BADGES = {
  Active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Notice Given': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Vacated: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

function maskAadhaar(aadhaar) {
  if (!aadhaar || aadhaar.length < 4) return aadhaar || 'N/A';
  return `•••• •••• ${aadhaar.slice(-4)}`;
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="p-2 rounded-lg bg-white/5">
        <Icon className="w-4 h-4 text-white/60" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-white/50 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value || 'N/A'}</p>
      </div>
    </div>
  );
}

export default function TenantProfileCard({ tenant, property, room }) {
  const initials = tenant?.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'T';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Profile header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 p-5 sm:p-6">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shrink-0 overflow-hidden">
            {tenant?.photo_url ? (
              <img src={tenant.photo_url} alt={tenant.full_name} className="w-full h-full object-cover" />
            ) : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">{tenant?.full_name}</h2>
              {tenant?.status && (
                <Badge className={`border ${STATUS_BADGES[tenant.status] || STATUS_BADGES.Active} text-[10px] font-bold`}>
                  {tenant.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/70 mt-1">
              {property?.name || 'Property'}{room ? ` • Room ${room.room_number}` : ''}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-white/60">
              {tenant?.joining_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Joined {new Date(tenant.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {property?.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {property.city ? `${property.city}, ${property.state || ''}` : property.address}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DetailCard icon={Phone} label="Contact Number" value={tenant?.mobile_number} />
        <DetailCard icon={CreditCard} label="Aadhaar Number" value={maskAadhaar(tenant?.aadhaar_number)} />
        <DetailCard icon={Briefcase} label="Occupation / Employer" value={tenant?.occupation ? `${tenant.occupation}${tenant.company_name ? ` (${tenant.company_name})` : ''}` : 'N/A'} />
      </div>
    </motion.div>
  );
}