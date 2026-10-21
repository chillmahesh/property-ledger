import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/lib/i18n';
import { User, Phone, Briefcase, Upload, Save, Globe } from 'lucide-react';

export default function TenantSettings() {
  const { tenant } = useOutletContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { lang, setLang } = useI18n();

  const [form, setForm] = useState({
    mobile_number: tenant?.mobile_number || '',
    alternate_mobile: tenant?.alternate_mobile || '',
    occupation: tenant?.occupation || '',
    company_name: tenant?.company_name || '',
    emergency_contact_name: tenant?.emergency_contact_name || '',
    emergency_contact_number: tenant?.emergency_contact_number || '',
    photo_url: tenant?.photo_url || '',
  });

  const photoMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Tenant.update(tenant.id, { photo_url: file_url });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'Photo updated' });
    },
    onError: (err) => toast({ title: 'Upload failed', description: err.message, variant: 'destructive' }),
  });

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Tenant.update(tenant.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    },
    onError: (err) => toast({ title: 'Update failed', description: err.message, variant: 'destructive' }),
  });

  if (!tenant) return null;

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-heading font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Photo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold overflow-hidden">
            {form.photo_url ? <img src={form.photo_url} alt="Profile" className="w-full h-full object-cover" /> : tenant.full_name?.[0]?.toUpperCase()}
          </div>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span><Upload className="w-4 h-4 mr-2" /> Upload Photo</span>
            </Button>
            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files[0] && photoMutation.mutate(e.target.files[0])} />
          </label>
        </CardContent>
      </Card>

      {/* Contact & Occupation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.mobile_number} onChange={e => up('mobile_number', e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alternate Mobile</Label>
              <Input value={form.alternate_mobile} onChange={e => up('alternate_mobile', e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Occupation</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.occupation} onChange={e => up('occupation', e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={form.company_name} onChange={e => up('company_name', e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input value={form.emergency_contact_name} onChange={e => up('emergency_contact_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Number</Label>
              <Input value={form.emergency_contact_number} onChange={e => up('emergency_contact_number', e.target.value)} />
            </div>
          </div>
          <Button className="w-full" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}