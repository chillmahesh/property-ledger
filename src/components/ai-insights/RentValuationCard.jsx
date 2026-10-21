import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { getStatusColor, formatINR } from '@/lib/ai-insights-schema';

function PricingMeter({ status, position }) {
  const segStatus = status?.toLowerCase() || '';
  const segments = [
    { label: 'Underpriced', active: segStatus.includes('under'), activeColor: 'bg-amber-400', idleColor: 'bg-amber-100' },
    { label: 'Competitive', active: segStatus.includes('compet'), activeColor: 'bg-emerald-400', idleColor: 'bg-emerald-100' },
    { label: 'Overpriced', active: segStatus.includes('over'), activeColor: 'bg-rose-400', idleColor: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-2">
      <div className="relative h-3 rounded-full overflow-hidden flex gap-0.5">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`flex-1 rounded-full transition-all ${seg.active ? seg.activeColor : seg.idleColor}`}
          />
        ))}
        {position != null && position >= 0 && position <= 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-md z-10"
            style={{ left: `${position}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] font-medium">
        {segments.map((seg) => (
          <span key={seg.label} className={seg.active ? 'text-foreground font-bold' : 'text-muted-foreground'}>
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RentValuationCard({ valuation }) {
  const statusColor = getStatusColor(valuation.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Room</p>
              <h3 className="text-lg font-heading font-bold">{valuation.room_number}</h3>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor}`}>
              {valuation.status?.toUpperCase()}
            </span>
          </div>

          {/* Rent comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">Current Rent</p>
              <p className="text-sm font-bold">{formatINR(valuation.current_rent)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40">
              <p className="text-[10px] text-muted-foreground">Market Average</p>
              <p className="text-sm font-bold">{formatINR(valuation.market_average)}</p>
            </div>
          </div>

          {/* Pricing meter */}
          <div>
            <PricingMeter status={valuation.status} position={valuation.pricing_position} />
          </div>

          {/* AI reasoning */}
          {valuation.reasoning && (
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
              {valuation.reasoning}
            </p>
          )}

          {/* Recommended rent + Market avg footer */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Recommended</p>
              <p className="text-sm font-bold">{formatINR(valuation.recommended_rent)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/70 uppercase tracking-wide">Market Avg</p>
              <p className="text-sm font-bold">{formatINR(valuation.market_average)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}