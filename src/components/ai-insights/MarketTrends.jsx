import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';

const CHART_CONFIG = [
  { key: 'rent_trend', title: 'Average Rent Trend', color: '#3b82f6', gradient: 'blue', prefix: '₹' },
  { key: 'demand_trend', title: 'Demand Trend', color: '#8b5cf6', gradient: 'purple', prefix: '' },
  { key: 'occupancy_trend_data', title: 'Occupancy Trend', color: '#10b981', gradient: 'emerald', prefix: '', suffix: '%' },
  { key: 'price_growth', title: 'Price Growth', color: '#f59e0b', gradient: 'amber', prefix: '', suffix: '%' },
];

function TrendChart({ data, config }) {
  const chartData = (data || []).map(d => ({ month: d.month, value: d.value }));

  return (
    <div className="p-3 rounded-xl border bg-card">
      <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
        {config.title}
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`fill-${config.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
            formatter={(v) => `${config.prefix}${v}${config.suffix || ''}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2}
            fill={`url(#fill-${config.key})`}
            dot={{ r: 3, fill: config.color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MarketTrends({ data }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <span className="text-lg">📉</span> Market Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-3">
          {CHART_CONFIG.map((config) => (
            <TrendChart key={config.key} data={data[config.key]} config={config} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}