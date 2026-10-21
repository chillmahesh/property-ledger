import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function CircularProgress({ value, label, gradient }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((value || 0) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/30" />
          <motion.circle
            cx="48" cy="48" r={radius} fill="none" strokeWidth="7" strokeLinecap="round"
            stroke={`url(#grad-${label.replace(/\s/g, '')})`}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{value || 0}</span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground text-center font-medium leading-tight">{label}</span>
    </div>
  );
}

export default function PropertyScore({ scores }) {
  if (!scores) return null;

  const items = [
    { label: 'Pricing Score', value: scores.pricing_score, gradient: ['#3b82f6', '#6366f1'] },
    { label: 'Market Position', value: scores.market_position, gradient: ['#8b5cf6', '#a855f7'] },
    { label: 'Demand Score', value: scores.demand_score, gradient: ['#10b981', '#059669'] },
    { label: 'Occupancy Score', value: scores.occupancy_score, gradient: ['#f59e0b', '#d97706'] },
    { label: 'Growth Potential', value: scores.growth_potential, gradient: ['#ec4899', '#f43f5e'] },
    { label: 'Overall AI Score', value: scores.overall_score, gradient: ['#6366f1', '#8b5cf6'] },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <span className="text-lg">🎯</span> Property AI Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <CircularProgress {...item} />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}