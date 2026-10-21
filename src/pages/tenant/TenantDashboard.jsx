import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useTenant } from '@/hooks/useTenant';
import TenantProfileCard from '@/components/tenant/TenantProfileCard';
import RentSummaryCards from '@/components/tenant/RentSummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const STATUS_STYLES = {
  Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Unpaid: 'bg-rose-100 text-rose-700 border-rose-200',
  'Partially Paid': 'bg-amber-100 text-amber-700 border-amber-200',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TenantDashboard() {
  const { tenant: routeTenant } = useOutletContext();
  const { tenant } = useTenant();
  const t = tenant || routeTenant;

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list(),
  });
  const { data: payments = [] } = useQuery({
    queryKey: ['tenant-payments', t?.id],
    queryFn: () => base44.entities.Payment.filter({ tenant_id: t.id }),
    enabled: !!t?.id,
  });
  const { data: rentDues = [] } = useQuery({
    queryKey: ['tenant-dues', t?.id],
    queryFn: () => base44.entities.RentDue.filter({ tenant_id: t.id }),
    enabled: !!t?.id,
  });

  if (!t) return null;

  const property = properties.find(p => p.id === t.property_id);
  const room = rooms.find(r => r.id === t.room_id);
  const recentDues = [...rentDues].sort((a, b) => (b.year - a.year) || (b.month - a.month)).slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <TenantProfileCard tenant={t} property={property} room={room} />
      <RentSummaryCards tenant={t} payments={payments} rentDues={rentDues} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Recent Rent History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentDues.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No rent records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Month</th>
                    <th className="pb-2 font-medium">Rent</th>
                    <th className="pb-2 font-medium">Paid</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDues.map((due, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{MONTHS[due.month - 1] || due.month} {due.year}</td>
                      <td className="py-2.5">₹{(due.rent_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5">₹{(due.amount_paid || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[due.status] || STATUS_STYLES.Unpaid}`}>
                          {due.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}