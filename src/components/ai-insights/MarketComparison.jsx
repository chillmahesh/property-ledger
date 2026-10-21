import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Building2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ComparisonRow({ label, yourValue, marketValue }) {
  const diff = yourValue - marketValue;
  const isHigher = diff > 0;
  return (
    <div className="grid grid-cols-3 items-center gap-2 py-2.5 border-b last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-center">{yourValue}{typeof yourValue === 'number' && label.includes('Occupancy') ? '%' : ''}</span>
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-sm font-semibold">{marketValue}{typeof marketValue === 'number' && label.includes('Occupancy') ? '%' : ''}</span>
        {diff !== 0 && (
          <span className={`text-[10px] flex items-center ${isHigher ? 'text-rose-500' : 'text-emerald-500'}`}>
            {isHigher ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(diff).toFixed(0)}{label.includes('Occupancy') ? '%' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MarketComparison({ data }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <span className="text-lg">⚖️</span> Market Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header row */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
          <span>Metric</span>
          <span className="flex items-center justify-center gap-1"><Building2 className="w-3 h-3" /> Your Property</span>
          <span className="flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> Nearby Market</span>
        </div>

        <ComparisonRow
          label="Occupancy %"
          yourValue={data.your_occupancy ?? 0}
          marketValue={data.market_occupancy ?? 0}
        />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Demand Score</p>
            <p className="text-2xl font-bold text-blue-600">{data.demand_score ?? 0}</p>
            <div className="w-full h-1.5 rounded-full bg-blue-100 overflow-hidden mt-2">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.demand_score || 0}%` }} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Competition Score</p>
            <p className="text-2xl font-bold text-purple-600">{data.competition_score ?? 0}</p>
            <div className="w-full h-1.5 rounded-full bg-purple-100 overflow-hidden mt-2">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data.competition_score || 0}%` }} />
            </div>
          </div>
        </div>

        {data.amenities_comparison && (
          <div className="p-3 rounded-lg bg-muted/40">
            <p className="text-[10px] text-muted-foreground mb-1 font-medium">Amenities Comparison</p>
            <p className="text-xs">{data.amenities_comparison}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {data.your_property_summary && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 mb-1">YOUR PROPERTY</p>
              <p className="text-xs text-muted-foreground">{data.your_property_summary}</p>
            </div>
          )}
          {data.nearby_market_summary && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-[10px] font-bold text-purple-600 mb-1">NEARBY MARKET</p>
              <p className="text-xs text-muted-foreground">{data.nearby_market_summary}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}