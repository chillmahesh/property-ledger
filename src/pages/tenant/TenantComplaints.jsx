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
import { MessageSquare, Send, Upload } from 'lucide-react';

const CATEGORIES = ['Electrical', 'Water', 'Furniture', 'Cleaning', 'Internet', 'Security', 'Maintenance', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUS_STYLES = {
  Open: 'bg-blue-100 text-blue-700 border-blue-200',
  Assigned: 'bg-amber-100 text-amber-700 border-amber-200',
  'In Progress': 'bg-purple-100 text-purple-700 border-purple-200',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function TenantComplaints() {
  const { tenant } = useOutletContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', category: 'Maintenance', priority: 'Medium', description: '' });
  const [file, setFile] = useState(null);

  const { data: complaints = [] } = useQuery({
    queryKey: ['tenant-complaints', tenant?.id],
    queryFn: () => base44.entities.Complaint.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      let photo_url = null;
      if (file) {
        const res = await base44.integrations.Core.UploadFile({ file });
        photo_url = res.file_url;
      }
      return base44.entities.Complaint.create({
        ...form,
        tenant_id: tenant.id,
        property_id: tenant.property_id,
        photo_url,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-complaints', tenant.id] });
      setForm({ title: '', category: 'Maintenance', priority: 'Medium', description: '' });
      setFile(null);
      toast({ title: 'Complaint submitted', description: 'Your ticket has been lodged successfully.' });
    },
    onError: (err) => toast({ title: 'Submission failed', description: err.message, variant: 'destructive' }),
  });

  if (!tenant) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {/* Complaint form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Lodge a Complaint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Issue Title</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. WiFi Router Not Working" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description of Issue</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in detail..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Attach Photo (optional)</Label>
            <label className="cursor-pointer">
              <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">{file ? file.name : 'Click to upload'}</p>
              </div>
              <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} accept="image/*" />
            </label>
          </div>
          <Button className="w-full" disabled={!form.title || !form.description || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}>
            <Send className="w-4 h-4" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit Complaint Ticket'}
          </Button>
        </CardContent>
      </Card>

      {/* Complaints list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Your Lodged Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No complaints logged. Excellent!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {[...complaints].reverse().map((c) => (
                <div key={c.id} className="p-3 rounded-xl border space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold truncate">{c.title}</h4>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${STATUS_STYLES[c.status] || STATUS_STYLES.Open}`}>{c.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{c.priority} Priority</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                  {c.admin_response && (
                    <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs">
                      <span className="font-medium text-muted-foreground">Admin response: </span>{c.admin_response}
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