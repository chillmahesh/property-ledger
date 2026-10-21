import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Wrench, Send, User, Calendar } from 'lucide-react';

const SERVICE_TYPES = ['Cleaning', 'AC Service', 'Electrician', 'Plumber', 'Furniture Repair', 'Painting', 'Deep Cleaning'];
const STATUS_STYLES = {
  Requested: 'bg-blue-100 text-blue-700 border-blue-200',
  Scheduled: 'bg-amber-100 text-amber-700 border-amber-200',
  Assigned: 'bg-purple-100 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function TenantMaintenance() {
  const { tenant } = useOutletContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ service_type: 'Cleaning', description: '', preferred_date: '' });

  const { data: requests = [] } = useQuery({
    queryKey: ['tenant-maintenance', tenant?.id],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.MaintenanceRequest.create({
      ...form,
      tenant_id: tenant.id,
      property_id: tenant.property_id,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-maintenance', tenant.id] });
      setForm({ service_type: 'Cleaning', description: '', preferred_date: '' });
      toast({ title: 'Request submitted', description: 'Your maintenance request has been logged.' });
    },
    onError: (err) => toast({ title: 'Submission failed', description: err.message, variant: 'destructive' }),
  });

  if (!tenant) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" /> Request Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select value={form.service_type} onValueChange={v => setForm(f => ({ ...f, service_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Input type="date" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what needs to be done..." rows={4} />
          </div>
          <Button className="w-full" disabled={!form.description || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}>
            <Send className="w-4 h-4" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Your Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No maintenance requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {[...requests].reverse().map((r) => (
                <div key={r.id} className="p-3 rounded-xl border space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold">{r.service_type}</h4>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${STATUS_STYLES[r.status] || STATUS_STYLES.Requested}`}>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {r.preferred_date && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Preferred: {new Date(r.preferred_date).toLocaleDateString('en-IN')}</span>
                    )}
                    {r.scheduled_date && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Scheduled: {new Date(r.scheduled_date).toLocaleDateString('en-IN')}</span>
                    )}
                    {r.technician_name && (
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {r.technician_name}</span>
                    )}
                  </div>
                  {r.notes && (
                    <div className="p-2 rounded-lg bg-muted/50 text-xs">
                      <span className="font-medium text-muted-foreground">Notes: </span>{r.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}