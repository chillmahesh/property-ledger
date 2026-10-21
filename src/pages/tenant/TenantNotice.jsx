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
import { Bell, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

const REASONS = ['Job Change', 'Relocating', 'Personal Reasons', 'Financial', 'Dissatisfaction', 'Other'];
const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function TenantNotice() {
  const { tenant } = useOutletContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ vacating_date: '', reason: 'Personal Reasons', comments: '' });

  const { data: notices = [] } = useQuery({
    queryKey: ['tenant-notices', tenant?.id],
    queryFn: () => base44.entities.TenantNotice.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.TenantNotice.create({
      ...form,
      tenant_id: tenant.id,
      property_id: tenant.property_id,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-notices', tenant.id] });
      setForm({ vacating_date: '', reason: 'Personal Reasons', comments: '' });
      toast({ title: 'Notice submitted', description: 'Your notice has been sent to the property manager.' });
    },
    onError: (err) => toast({ title: 'Submission failed', description: err.message, variant: 'destructive' }),
  });

  if (!tenant) return null;

  const hasActiveNotice = notices.some(n => n.status === 'Pending');
  const latestNotice = [...notices].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-heading font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" /> Notice Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit a vacating notice to inform your property manager
        </p>
      </div>

      {/* Current status */}
      {latestNotice && (
        <Card className="overflow-hidden">
          <div className={`h-1 ${STATUS_STYLES[latestNotice.status]?.includes('emerald') ? 'bg-emerald-500' : STATUS_STYLES[latestNotice.status]?.includes('rose') ? 'bg-rose-500' : 'bg-amber-500'}`} />
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Current Notice Status</h3>
              <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[latestNotice.status] || STATUS_STYLES.Pending}`}>
                {latestNotice.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Vacating Date</p>
                <p className="font-medium">{new Date(latestNotice.vacating_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="font-medium">{latestNotice.reason}</p>
              </div>
            </div>
            {latestNotice.comments && (
              <div className="p-2 rounded-lg bg-muted/50 text-xs">
                <span className="font-medium text-muted-foreground">Comments: </span>{latestNotice.comments}
              </div>
            )}
            {latestNotice.admin_response && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs">
                <p className="font-semibold text-blue-700 mb-1">Manager Response</p>
                {latestNotice.admin_response}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit form */}
      {!hasActiveNotice && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Submit Notice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Vacating Date</Label>
                <Input type="date" value={form.vacating_date} onChange={e => setForm(f => ({ ...f, vacating_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={form.reason} onValueChange={v => setForm(f => ({ ...f, reason: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                placeholder="Additional information for your property manager..." rows={3} />
            </div>
            <Button className="w-full" disabled={!form.vacating_date || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}>
              <Send className="w-4 h-4" />
              {submitMutation.isPending ? 'Submitting...' : 'Submit Notice'}
            </Button>
          </CardContent>
        </Card>
      )}

      {hasActiveNotice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          You have a pending notice. Your property manager will respond soon.
        </div>
      )}
    </div>
  );
}