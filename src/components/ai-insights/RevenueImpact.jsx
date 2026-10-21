import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Calendar, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedCounter from './AnimatedCounter';

export default function RevenueImpact({ data }) {
  if (!data) return null;

  const cards = [
    {
      label: 'Current Monthly Revenue',
      value: data.current_monthly_revenue || 0,
      icon: Wallet,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Potential Monthly Revenue',
      value: data.potential_monthly_revenue || 0,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Potential Annual Revenue',
      value: data.potential_annual_revenue || 0,
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Revenue Increase',
      value: data.revenue_increase_percent || 0,
      suffix: '%',
      prefix: '+',
      decimals: 1,
      icon: Percent,
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <span className="text-lg">📈</span> Revenue Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-xl p-4 border"
              >
                <div className={`absolute inset-0 ${card.bg} opacity-50`} />
                <div className="relative">
                  <div className={`p-2 rounded-lg ${card.bg} inline-block mb-3`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold font-heading">
                    <AnimatedCounter
                      value={card.value}
                      prefix={card.prefix || '₹'}
                      suffix={card.suffix || ''}
                      decimals={card.decimals || 0}
                    />
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">{card.label}</p>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}