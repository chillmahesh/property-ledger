import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const DOC_TYPES = ['Aadhaar', 'PAN', 'Rental Agreement', 'Police Verification', 'Other'];

export default function DocumentManager({ tenantId }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const [docType, setDocType] = useState('Aadhaar');
  const [customName, setCustomName] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: documents = [] } = useQuery({
    queryKey: ['tenantDocs', tenantId],
    queryFn: () => base44.entities.TenantDocument.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const deleteDocMut = useMutation({
    mutationFn: (id) => base44.entities.TenantDocument.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenantDocs', tenantId] }),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocFile(file);
    setDocPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setDocType('Aadhaar');
    setCustomName('');
    setDocFile(null);
    setDocPreview(null);
    setExpiryDate('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadDoc = async () => {
    const isOther = docType === 'Other';
    if (isOther && !customName.trim()) return;
    if (!docFile) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: docFile });
    await base44.entities.TenantDocument.create({
      tenant_id: tenantId,
      document_type: docType,
      document_name: isOther ? customName.trim() : docType,
      document_url: file_url,
      expiry_date: expiryDate || null,
    });
    qc.invalidateQueries({ queryKey: ['tenantDocs', tenantId] });
    resetForm();
    setUploading(false);
  };

  const getExpiryInfo = (expiry) => {
    if (!expiry) return null;
    const days = differenceInDays(new Date(expiry), new Date());
    if (days < 0) return { label: t('expired'), color: 'bg-rose-100 text-rose-700', icon: AlertTriangle };
    if (days <= 30) return { label: `${days} ${t('daysLeft')}`, color: 'bg-amber-100 text-amber-700', icon: AlertTriangle };
    return { label: format(new Date(expiry), 'dd MMM yyyy'), color: 'bg-slate-100 text-slate-600', icon: Calendar };
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">{t('addDocument')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div
            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {docPreview ? (
              <img src={docPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="w-8 h-8" />
                <p className="text-sm">{t('tapToSelect')}</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
          </div>

          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger><SelectValue placeholder={t('selectType')} /></SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>

          {docType === 'Other' && (
            <Input
              placeholder={t('customName')}
              value={customName}
              onChange={e => setCustomName(e.target.value)}
            />
          )}

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">{t('expiryDate')}</label>
            <Input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            disabled={!docFile || uploading || (docType === 'Other' && !customName.trim())}
            onClick={handleUploadDoc}
          >
            {uploading ? `${t('save')}...` : t('saveDocument')}
          </Button>
        </CardContent>
      </Card>

      {documents.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {documents.map(doc => {
            const expiry = getExpiryInfo(doc.expiry_date);
            const ExpiryIcon = expiry?.icon;
            return (
              <div key={doc.id} className="relative rounded-xl border bg-card overflow-hidden group">
                <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={doc.document_url}
                    alt={doc.document_name}
                    className="w-full h-28 object-cover bg-muted"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="p-2 space-y-1">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                      <p className="text-xs font-medium truncate">{doc.document_name}</p>
                    </div>
                    {expiry && (
                      <Badge variant="outline" className={`text-[9px] ${expiry.color}`}>
                        {ExpiryIcon && <ExpiryIcon className="w-2.5 h-2.5 mr-0.5" />}
                        {expiry.label}
                      </Badge>
                    )}
                  </div>
                </a>
                <button
                  onClick={() => deleteDocMut.mutate(doc.id)}
                  className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-center text-muted-foreground py-6">{t('noData')}</p>
      )}
    </div>
  );
}