import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Eye, MessageCircle, CheckCircle, CalendarPlus, LogOut,
  FileCheck, Upload, ExternalLink, UserCheck, XCircle
} from 'lucide-react';
import { differenceInDays, format, addDays } from 'date-fns';
import AlertDataTable from '@/components/alerts/AlertDataTable';
import { useToast } from '@/components/ui/use-toast';

const badgeVariant = (v) => ({
  red: 'bg-rose-100 text-rose-700 border-rose-200',
  orange: 'bg-amber-100 text-amber-700 border-amber-200',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}[v] || 'bg-slate-100 text-slate-600');

function ActionBtn({ icon: Icon, label, onClick, className = '', disabled }) {
  return (
    <Button variant="ghost" size="icon" className={`h-8 w-8 shrink-0 ${className}`} onClick={onClick} disabled={disabled} title={label}>
      <Icon className="w-3.5 h-3.5" />
    </Button>
  );
}

const TYPE_META = {
  overdue: { titleKey: 'overdueRent', emptyKey: 'noOverdueRent', icon: '🔴' },
  vacating: { titleKey: 'vacatingSoon', emptyKey: 'noVacatingSoon', icon: '🟠' },
  documents: { titleKey: 'expiringDocuments', emptyKey: 'noExpiringDocs', icon: '📄' },
  reserved: { titleKey: 'reservedBeds', emptyKey: 'noReservedBeds', icon: '🛏️' },
};

export default function AlertDetail() {
  const { type } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => base44.entities.Property.list() });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });
  const { data: beds = [] } = useQuery({ queryKey: ['beds'], queryFn: () => base44.entities.Bed.list() });
  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: () => base44.entities.Tenant.list() });
  const { data: rentDues = [] } = useQuery({ queryKey: ['rentDues'], queryFn: () => base44.entities.RentDue.list() });
  const { data: deposits = [] } = useQuery({ queryKey: ['deposits'], queryFn: () => base44.entities.Deposit.list() });
  const { data: documents = [] } = useQuery({ queryKey: ['tenantDocsAll'], queryFn: () => base44.entities.TenantDocument.list() });

  const getTenant = (id) => tenants.find(t => t.id === id);
  const getProperty = (id) => properties.find(p => p.id === id);
  const getRoom = (id) => rooms.find(r => r.id === id);
  const getBed = (id) => beds.find(b => b.id === id);
  const getDeposit = (tenantId) => deposits.find(d => d.tenant_id === tenantId);

  const roomBedLabel = (tenant) => {
    const room = getRoom(tenant?.room_id);
    const bed = getBed(tenant?.bed_id);
    const parts = [];
    if (room?.room_number) parts.push(room.room_number);
    if (bed?.bed_number) parts.push(bed.bed_number);
    return parts.join(' / ') || '—';
  };

  const sendWhatsApp = (phone, name, msg) => {
    const text = encodeURIComponent(msg || `Hi ${name}, this is a reminder from your property manager.`);
    window.open(`https://wa.me/${phone?.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  // --- Mutations ---
  const markPaidMut = useMutation({
    mutationFn: async (row) => {
      const due = row._due;
      await base44.entities.Payment.create({
        tenant_id: due.tenant_id,
        property_id: due.property_id || getTenant(due.tenant_id)?.property_id,
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        amount: row.rentAmount,
        payment_method: 'Cash',
        remarks: `Rent for ${due.month}/${due.year}`,
        rent_month: `${due.year}-${String(due.month).padStart(2, '0')}`,
      });
      await base44.entities.RentDue.update(due.id, { amount_paid: due.rent_amount, pending_amount: 0, status: 'Paid' });
    },
    onSuccess: () => { qc.invalidateQueries(); toast({ title: t('markedAsPaid') }); },
  });

  const extendStayMut = useMutation({
    mutationFn: async (row) => {
      const newDate = addDays(new Date(row.moveOutDate), 30);
      await base44.entities.Tenant.update(row.tenantId, { vacating_date: format(newDate, 'yyyy-MM-dd'), status: 'Active' });
    },
    onSuccess: () => { qc.invalidateQueries(); toast({ title: t('stayExtended') }); },
  });

  const checkoutMut = useMutation({
    mutationFn: async (row) => {
      const tenant = row._tenant;
      await base44.entities.Tenant.update(tenant.id, { status: 'Vacated', vacating_date: format(new Date(), 'yyyy-MM-dd') });
      if (tenant.bed_id) await base44.entities.Bed.update(tenant.bed_id, { status: 'Vacant' });
    },
    onSuccess: () => { qc.invalidateQueries(); toast({ title: t('checkoutCompleted') }); },
  });

  const renewDocMut = useMutation({
    mutationFn: async (row) => {
      const baseDate = row.expiryDate ? new Date(row.expiryDate) : new Date();
      await base44.entities.TenantDocument.update(row._doc.id, { expiry_date: format(addDays(baseDate, 365), 'yyyy-MM-dd') });
    },
    onSuccess: () => { qc.invalidateQueries(); toast({ title: t('documentRenewed') }); },
  });

  const checkInMut = useMutation({
    mutationFn: async (row) => {
      await base44.entities.Bed.update(row._bed.id, {
        status: 'Occupied', reserved_for: null, reserved_join_date: null, reservation_expiry_date: null,
      });
    },
    onSuccess: () => { qc.invalidateQueries(); toast({ title: t('checkinConfirmed') }); },
  });

  const cancelResMut = useMutation({
    mutationFn: async (row) => {
      await base44.entities.Bed.update(row._bed.id, {
        status: 'Vacant', reserved_for: null, reserved_join_date: null, reservation_expiry_date: null,
      });
    },
    onSuccess: () => { qc.invalidateQueries(); toast({ title: t('reservationCancelled') }); },
  });

  // --- Build rows + columns + actions per type ---
  const { title, rows, columns, actions, emptyMessage } = useMemo(() => {
    const now = new Date();
    const meta = TYPE_META[type] || TYPE_META.overdue;
    const emptyMessage = t(meta.emptyKey);
    const title = t(meta.titleKey);

    if (type === 'overdue') {
      const rows = rentDues
        .filter(d => d.status !== 'Paid' && (d.year < now.getFullYear() || (d.year === now.getFullYear() && d.month < now.getMonth() + 1)))
        .map(due => {
          const tenant = getTenant(due.tenant_id);
          const prop = getProperty(tenant?.property_id);
          const dueDate = new Date(due.year, due.month - 1, 1);
          const daysOverdue = differenceInDays(now, dueDate);
          return {
            id: due.id,
            tenantName: tenant?.full_name || '—',
            tenantId: tenant?.id,
            propertyName: prop?.name || '—',
            roomBed: tenant ? roomBedLabel(tenant) : '—',
            rentAmount: due.pending_amount || due.rent_amount || 0,
            dueDate: format(dueDate, 'MMM yyyy'),
            daysOverdue,
            contact: tenant?.mobile_number || '—',
            status: daysOverdue > 30 ? 'critical' : 'overdue',
            _due: due, _tenant: tenant,
          };
        });
      const columns = [
        { key: 'tenantName', label: t('tenant'), sortable: true },
        { key: 'propertyName', label: t('property'), sortable: true },
        { key: 'roomBed', label: `${t('room')}/${t('bed')}` },
        { key: 'rentAmount', label: t('amount'), sortable: true, render: r => `₹${r.rentAmount.toLocaleString('en-IN')}` },
        { key: 'dueDate', label: t('dueDate'), sortable: true },
        { key: 'daysOverdue', label: t('daysOverdue'), sortable: true, render: r => `${r.daysOverdue}d` },
        { key: 'contact', label: t('mobileNumber') },
        { key: 'status', label: t('status'), render: r => <Badge variant="outline" className={`text-[10px] ${badgeVariant('red')}`}>{t('overdue')}</Badge> },
      ];
      const actions = (row) => (
        <>
          <ActionBtn icon={Eye} label={t('viewTenant')} onClick={() => navigate(`/tenants/${row.tenantId}`)} />
          <ActionBtn icon={MessageCircle} label={t('sendWhatsApp')} className="text-emerald-600" onClick={() => sendWhatsApp(row.contact, row.tenantName, `Hi ${row.tenantName}, your rent of ₹${row.rentAmount.toLocaleString('en-IN')} for ${row.dueDate} is overdue (${row.daysOverdue} days). Please pay at the earliest.`)} />
          <ActionBtn icon={CheckCircle} label={t('markAsPaid')} className="text-blue-600" disabled={markPaidMut.isPending} onClick={() => markPaidMut.mutate(row)} />
        </>
      );
      return { title, rows, columns, actions, emptyMessage };
    }

    if (type === 'vacating') {
      const threshold = addDays(now, 30);
      const rows = tenants
        .filter(tn => tn.status === 'Notice Given' || (tn.vacating_date && new Date(tn.vacating_date) <= threshold && tn.status === 'Active'))
        .map(tn => {
          const prop = getProperty(tn.property_id);
          const dep = getDeposit(tn.id);
          const moveOutDate = tn.vacating_date;
          const daysRemaining = moveOutDate ? differenceInDays(new Date(moveOutDate), now) : 0;
          return {
            id: tn.id,
            tenantName: tn.full_name,
            tenantId: tn.id,
            propertyName: prop?.name || '—',
            roomBed: roomBedLabel(tn),
            moveOutDate,
            daysRemaining,
            depositAmount: dep?.deposit_amount || 0,
            contact: tn.mobile_number || '—',
            status: daysRemaining < 0 ? 'pastDue' : daysRemaining <= 7 ? 'critical' : 'soon',
            _tenant: tn,
          };
        });
      const columns = [
        { key: 'tenantName', label: t('tenant'), sortable: true },
        { key: 'propertyName', label: t('property'), sortable: true },
        { key: 'roomBed', label: `${t('room')}/${t('bed')}` },
        { key: 'moveOutDate', label: t('moveOutDate'), sortable: true, render: r => r.moveOutDate ? format(new Date(r.moveOutDate), 'dd MMM yyyy') : '—' },
        { key: 'daysRemaining', label: t('daysRemaining'), sortable: true, render: r => `${r.daysRemaining}d` },
        { key: 'depositAmount', label: t('depositAmount'), sortable: true, render: r => `₹${r.depositAmount.toLocaleString('en-IN')}` },
        { key: 'contact', label: t('mobileNumber') },
        { key: 'status', label: t('status'), render: r => (
          <Badge variant="outline" className={`text-[10px] ${badgeVariant(r.status === 'pastDue' || r.status === 'critical' ? 'red' : 'orange')}`}>
            {r.status === 'pastDue' ? t('pastDue') : t('soon')}
          </Badge>
        ) },
      ];
      const actions = (row) => (
        <>
          <ActionBtn icon={Eye} label={t('viewTenant')} onClick={() => navigate(`/tenants/${row.tenantId}`)} />
          <ActionBtn icon={CalendarPlus} label={t('extendStay')} className="text-blue-600" disabled={extendStayMut.isPending} onClick={() => extendStayMut.mutate(row)} />
          <ActionBtn icon={LogOut} label={t('startCheckout')} className="text-amber-600" disabled={checkoutMut.isPending} onClick={() => checkoutMut.mutate(row)} />
          <ActionBtn icon={MessageCircle} label={t('contactTenant')} className="text-emerald-600" onClick={() => sendWhatsApp(row.contact, row.tenantName)} />
        </>
      );
      return { title, rows, columns, actions, emptyMessage };
    }

    if (type === 'documents') {
      const threshold = addDays(now, 30);
      const rows = documents
        .filter(d => d.expiry_date && new Date(d.expiry_date) <= threshold)
        .map(doc => {
          const tenant = getTenant(doc.tenant_id);
          const prop = getProperty(tenant?.property_id);
          const daysRemaining = differenceInDays(new Date(doc.expiry_date), now);
          return {
            id: doc.id,
            tenantName: tenant?.full_name || '—',
            tenantId: tenant?.id,
            propertyName: prop?.name || '—',
            documentType: doc.document_type || 'Other',
            documentName: doc.document_name,
            expiryDate: doc.expiry_date,
            daysRemaining,
            status: daysRemaining < 0 ? 'expired' : 'expiringSoon',
            _doc: doc, _tenant: tenant,
          };
        });
      const columns = [
        { key: 'tenantName', label: t('tenant'), sortable: true },
        { key: 'propertyName', label: t('property'), sortable: true },
        { key: 'documentType', label: t('documentType'), sortable: true },
        { key: 'expiryDate', label: t('expiryDate'), sortable: true, render: r => format(new Date(r.expiryDate), 'dd MMM yyyy') },
        { key: 'daysRemaining', label: t('daysRemaining'), sortable: true, render: r => `${r.daysRemaining}d` },
        { key: 'status', label: t('status'), render: r => (
          <Badge variant="outline" className={`text-[10px] ${badgeVariant(r.status === 'expired' ? 'red' : 'orange')}`}>
            {r.status === 'expired' ? t('expired') : t('expiringSoon')}
          </Badge>
        ) },
      ];
      const actions = (row) => (
        <>
          <ActionBtn icon={ExternalLink} label={t('viewDocument')} onClick={() => window.open(row._doc.document_url, '_blank')} />
          <ActionBtn icon={Upload} label={t('uploadNew')} onClick={() => navigate(`/tenants/${row.tenantId}`)} />
          <ActionBtn icon={FileCheck} label={t('markAsRenewed')} className="text-emerald-600" disabled={renewDocMut.isPending} onClick={() => renewDocMut.mutate(row)} />
        </>
      );
      return { title, rows, columns, actions, emptyMessage };
    }

    if (type === 'reserved') {
      const rows = beds
        .filter(b => b.status === 'Reserved')
        .map(bed => {
          const room = getRoom(bed.room_id);
          const prop = getProperty(room?.property_id);
          return {
            id: bed.id,
            reservedBy: bed.reserved_for || '—',
            propertyName: prop?.name || '—',
            roomBed: `${room?.room_number || '—'} / ${bed.bed_number}`,
            checkInDate: bed.reserved_join_date,
            reservationExpiry: bed.reservation_expiry_date,
            contact: bed.reserved_contact || '—',
            status: bed.reserved_join_date && differenceInDays(new Date(bed.reserved_join_date), now) < 0 ? 'overdue' : 'active',
            _bed: bed,
          };
        });
      const columns = [
        { key: 'reservedBy', label: t('reservedBy'), sortable: true },
        { key: 'propertyName', label: t('property'), sortable: true },
        { key: 'roomBed', label: `${t('room')}/${t('bed')}` },
        { key: 'checkInDate', label: t('checkInDate'), sortable: true, render: r => r.checkInDate ? format(new Date(r.checkInDate), 'dd MMM yyyy') : '—' },
        { key: 'reservationExpiry', label: t('reservationExpiry'), sortable: true, render: r => r.reservationExpiry ? format(new Date(r.reservationExpiry), 'dd MMM yyyy') : '—' },
        { key: 'contact', label: t('mobileNumber') },
        { key: 'status', label: t('status'), render: r => (
          <Badge variant="outline" className={`text-[10px] ${badgeVariant(r.status === 'overdue' ? 'orange' : 'green')}`}>
            {r.status === 'overdue' ? t('pastDue') : t('active')}
          </Badge>
        ) },
      ];
      const actions = (row) => (
        <>
          <ActionBtn icon={Eye} label={t('viewReservation')} onClick={() => navigate(`/rooms/${row._bed.room_id}`)} />
          <ActionBtn icon={UserCheck} label={t('confirmCheckin')} className="text-emerald-600" disabled={checkInMut.isPending} onClick={() => checkInMut.mutate(row)} />
          <ActionBtn icon={XCircle} label={t('cancelReservation')} className="text-rose-600" disabled={cancelResMut.isPending} onClick={() => cancelResMut.mutate(row)} />
        </>
      );
      return { title, rows, columns, actions, emptyMessage };
    }

    return { title, rows: [], columns: [], actions: null, emptyMessage };
  }, [type, properties, rooms, beds, tenants, rentDues, deposits, documents, t]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{rows.length} records</p>
        </div>
      </div>

      <AlertDataTable columns={columns} rows={rows} actions={actions} emptyMessage={emptyMessage} />
    </div>
  );
}