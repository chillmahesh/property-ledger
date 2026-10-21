import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const STATUS_STYLES = {
  Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Unpaid: 'bg-rose-100 text-rose-700 border-rose-200',
  'Partially Paid': 'bg-amber-100 text-amber-700 border-amber-200',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TenantPayments() {
  const { tenant } = useOutletContext();

  const { data: payments = [] } = useQuery({
    queryKey: ['tenant-payments', tenant?.id],
    queryFn: () => base44.entities.Payment.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });
  const { data: rentDues = [] } = useQuery({
    queryKey: ['tenant-dues', tenant?.id],
    queryFn: () => base44.entities.RentDue.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  if (!tenant) return null;

  const sortedPayments = [...payments].sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  const sortedDues = [...rentDues].sort((a, b) => (b.year - a.year) || (b.month - a.month));

  const paidCount = rentDues.filter(d => d.status === 'Paid').length;
  const missedCount = rentDues.filter(d => d.status === 'Unpaid' && new Date(d.year, d.month - 1) < new Date()).length;

  const downloadReceipt = (payment) => {
    const receipt = `PAYMENT RECEIPT\n${'='.repeat(40)}\n\nTenant: ${tenant.full_name}\nProperty: ${tenant.property_id}\n\nRent Period: ${payment.rent_month || 'N/A'}\nPayment Date: ${payment.payment_date}\nAmount: ₹${(payment.amount || 0).toLocaleString('en-IN')}\nMethod: ${payment.payment_method || 'N/A'}\nReference: ${payment.reference_number || 'N/A'}\nRemarks: ${payment.remarks || 'N/A'}\n\n${'='.repeat(40)}\nGenerated on ${new Date().toLocaleString('en-IN')}`;
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment.rent_month || payment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-heading font-bold">Rent & Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor due dates, payment history, and download receipts</p>
      </div>

      {/* Payment timeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50"><Clock className="w-4 h-4 text-blue-600" /></div>
          <div><p className="text-lg font-bold">{rentDues.length}</p><p className="text-[11px] text-muted-foreground">Total Months</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>
          <div><p className="text-lg font-bold">{paidCount}</p><p className="text-[11px] text-muted-foreground">Paid Months</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50"><XCircle className="w-4 h-4 text-rose-600" /></div>
          <div><p className="text-lg font-bold">{missedCount}</p><p className="text-[11px] text-muted-foreground">Missed Payments</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50"><CreditCard className="w-4 h-4 text-purple-600" /></div>
          <div><p className="text-lg font-bold">{payments.length}</p><p className="text-[11px] text-muted-foreground">Transactions</p></div>
        </CardContent></Card>
      </div>

      {/* Rent dues breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Rent Dues Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDues.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No rent dues records yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedDues.map((due, i) => (
                <div key={i} className="p-3 rounded-xl border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{MONTHS[due.month - 1] || due.month} / {due.year}</span>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[due.status] || STATUS_STYLES.Unpaid}`}>{due.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Due: ₹{(due.rent_amount || 0).toLocaleString('en-IN')}</span>
                    <span className="text-emerald-600 font-medium">Paid: ₹{(due.amount_paid || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No payment transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Rent Period</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Method</th>
                    <th className="pb-2 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPayments.map((p, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2.5 font-medium">{p.rent_month || '—'}</td>
                      <td className="py-2.5">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="py-2.5 font-semibold">₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5"><Badge variant="secondary" className="text-[10px]">{p.payment_method || '—'}</Badge></td>
                      <td className="py-2.5">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadReceipt(p)}>
                          <Download className="w-3 h-3 mr-1" /> Receipt
                        </Button>
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