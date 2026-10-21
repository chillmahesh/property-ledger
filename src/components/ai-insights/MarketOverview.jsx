import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, TrendingUp, Zap, Target, Percent, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDemandColor, formatINR } from '@/lib/ai-insights-schema';

export default function MarketOverview({ data }) {
  if (!data) return null;

  const items = [
    { label: 'Avg Market Rent', value: formatINR(data.average_market_rent), icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
    { label: 'Lowest Rent', value: formatINR(data.lowest_rent), icon: TrendingDown, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Highest Rent', value: formatINR(data.highest_rent), icon: TrendingUp, color: 'text-rose-600 bg-rose-50' },
    { label: 'Demand Level', value: data.demand_level, badge: true, color: getDemandColor(data.demand_level), icon: Zap },
    { label: 'Competition', value: data.competition_level, badge: true, color: getDemandColor(data.competition_level), icon: Target },
    { label: 'Occupancy Trend', value: data.occupancy_trend, icon: Gauge, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Price Growth', value: data.expected_price_growth, icon: Percent, color: 'text-purple-600 bg-purple-50' },
    { label: 'Confidence', value: `${data.market_confidence || 0}%`, icon: Gauge, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <span className="text-lg">📊</span> Market Overview
        </CardTitle>
        {data.area_summary && (
          <p className="text-sm text-muted-foreground">{data.area_summary}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                {item.badge ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
                    {item.value}
                  </span>
                ) : (
                  <span className="text-base font-bold">{item.value}</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}