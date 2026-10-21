import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle, Clock, XCircle, CloudUpload } from 'lucide-react';

const DOC_TYPES = ['Aadhaar', 'PAN', 'Rental Agreement', 'Police Verification', 'Other'];
const DOC_STATUS = {
  Verified: { style: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  'Pending Verification': { style: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  Rejected: { style: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
};

export default function TenantDocuments() {
  const { tenant } = useOutletContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [docType, setDocType] = useState('Aadhaar');
  const [customName, setCustomName] = useState('');
  const [file, setFile] = useState(null);

  const { data: documents = [] } = useQuery({
    queryKey: ['tenant-docs', tenant?.id],
    queryFn: () => base44.entities.TenantDocument.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a file');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.TenantDocument.create({
        tenant_id: tenant.id,
        document_type: docType,
        document_name: docType === 'Other' ? (customName || 'Document') : docType,
        document_url: file_url,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-docs', tenant.id] });
      setFile(null);
      setCustomName('');
      toast({ title: 'Document uploaded', description: 'Your document is pending verification.' });
    },
    onError: (err) => toast({ title: 'Upload failed', description: err.message, variant: 'destructive' }),
  });

  if (!tenant) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-heading font-bold">Document Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload and manage your KYC documents and agreements</p>
      </div>

      {/* Upload form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-primary" /> Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {docType === 'Other' && (
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. College ID" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Select File</Label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : 'Click to select photo / file'}
                  </p>
                </div>
                <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} accept="image/*,.pdf" />
              </label>
            </div>
          </div>
          <Button className="w-full" disabled={!file || uploadMutation.isPending} onClick={() => uploadMutation.mutate()}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
          </Button>
        </CardContent>
      </Card>

      {/* Documents list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const status = DOC_STATUS[doc.status] || DOC_STATUS['Pending Verification'];
                const StatusIcon = status.icon;
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border hover:shadow-sm transition-shadow">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${status.style}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {doc.status || 'Pending Verification'}
                    </Badge>
                    {doc.document_url && (
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">View</Button>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}