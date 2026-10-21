import { motion } from 'framer-motion';
import { IndianRupee, Wallet, TrendingUp, CalendarClock, Receipt, AlertCircle } from 'lucide-react';

function SummaryCard({ label, value, icon: Icon, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-xl p-4 border bg-card"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${gradient}`} />
      <div className="relative">
        <div className={`inline-flex p-2 rounded-lg ${gradient} mb-3`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <p className="text-xl font-bold font-heading">{value}</p>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export default function RentSummaryCards({ tenant, payments, rentDues }) {
  const monthlyRent = tenant?.monthly_rent || 0;
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingDue = rentDues
    .filter(d => d.status !== 'Paid')
    .reduce((s, d) => s + (d.pending_amount || d.rent_amount - (d.amount_paid || 0) || 0), 0);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentDue = rentDues.find(d => d.month === currentMonth && d.year === currentYear);
  const nextDueDate = currentDue
    ? new Date(currentYear, currentMonth - 1, tenant?.joining_date ? new Date(tenant.joining_date).getDate() : 5).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '—';

  const sortedPayments = [...payments].sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  const lastPayment = sortedPayments[0];
  const lastPaymentDate = lastPayment?.payment_date
    ? new Date(lastPayment.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const securityDeposit = tenant?.security_deposit || 0;

  const cards = [
    { label: 'Monthly Rent', value: `₹${monthlyRent.toLocaleString('en-IN')}`, icon: IndianRupee, gradient: 'bg-blue-500', delay: 0 },
    { label: 'Security Deposit', value: `₹${securityDeposit.toLocaleString('en-IN')}`, icon: Wallet, gradient: 'bg-indigo-500', delay: 0.05 },
    { label: 'Pending Due', value: `₹${pendingDue.toLocaleString('en-IN')}`, icon: AlertCircle, gradient: 'bg-rose-500', delay: 0.1 },
    { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: TrendingUp, gradient: 'bg-emerald-500', delay: 0.15 },
    { label: 'Next Due Date', value: nextDueDate, icon: CalendarClock, gradient: 'bg-amber-500', delay: 0.2 },
    { label: 'Last Payment', value: lastPaymentDate, icon: Receipt, gradient: 'bg-purple-500', delay: 0.25 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
}