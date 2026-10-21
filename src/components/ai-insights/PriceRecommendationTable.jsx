import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActionColor, formatINR } from '@/lib/ai-insights-schema';
import { TrendingUp, Minus, TrendingDown } from 'lucide-react';

const ACTION_ICONS = { Increase: TrendingUp, Maintain: Minus, Reduce: TrendingDown };

export default function PriceRecommendationTable({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <span className="text-lg">💰</span> Price Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Room</th>
                <th className="pb-2 font-medium">Current</th>
                <th className="pb-2 font-medium">Recommended</th>
                <th className="pb-2 font-medium">Difference</th>
                <th className="pb-2 font-medium">Monthly Gain</th>
                <th className="pb-2 font-medium">Annual Gain</th>
                <th className="pb-2 font-medium">Confidence</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec, i) => {
                const ActionIcon = ACTION_ICONS[rec.action] || Minus;
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b last:border-0"
                  >
                    <td className="py-2.5 font-semibold">{rec.room_number}</td>
                    <td className="py-2.5">{formatINR(rec.current_rent)}</td>
                    <td className="py-2.5 font-semibold text-primary">{formatINR(rec.recommended_rent)}</td>
                    <td className={`py-2.5 ${rec.difference > 0 ? 'text-emerald-600' : rec.difference < 0 ? 'text-rose-600' : ''}`}>
                      {rec.difference > 0 ? '+' : ''}{formatINR(rec.difference)}
                    </td>
                    <td className="py-2.5 text-emerald-600">{formatINR(rec.potential_monthly_gain)}</td>
                    <td className="py-2.5 text-emerald-600 font-semibold">{formatINR(rec.potential_annual_gain)}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rec.confidence_score || 0}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{rec.confidence_score || 0}%</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getActionColor(rec.action)}`}>
                        <ActionIcon className="w-3 h-3" />
                        {rec.action}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {recommendations.map((rec, i) => {
            const ActionIcon = ACTION_ICONS[rec.action] || Minus;
            return (
              <div key={i} className="p-3 rounded-xl border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{rec.room_number}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionColor(rec.action)}`}>
                    <ActionIcon className="w-3 h-3" />
                    {rec.action}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Current: </span>{formatINR(rec.current_rent)}</div>
                  <div><span className="text-muted-foreground">Recommended: </span><span className="font-bold text-primary">{formatINR(rec.recommended_rent)}</span></div>
                  <div><span className="text-muted-foreground">Monthly: </span><span className="text-emerald-600">{formatINR(rec.potential_monthly_gain)}</span></div>
                  <div><span className="text-muted-foreground">Annual: </span><span className="text-emerald-600 font-semibold">{formatINR(rec.potential_annual_gain)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}