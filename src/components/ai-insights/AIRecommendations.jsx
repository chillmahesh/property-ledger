import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPriorityColor } from '@/lib/ai-insights-schema';

export default function AIRecommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-purple-50 shrink-0">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-semibold truncate">{rec.title}</h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getPriorityColor(rec.priority)}`}>
                {rec.priority?.toUpperCase()}
              </span>
            </div>

            {rec.reasoning && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{rec.reasoning}</p>
            )}

            <div className="grid grid-cols-2 gap-2 mt-3">
              {rec.expected_impact && (
                <div className="p-2 rounded-lg bg-muted/40">
                  <p className="text-[9px] text-muted-foreground uppercase">Expected Impact</p>
                  <p className="text-xs font-medium">{rec.expected_impact}</p>
                </div>
              )}
              <div className="p-2 rounded-lg bg-muted/40">
                <p className="text-[9px] text-muted-foreground uppercase">Confidence</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rec.confidence || 0}%` }} />
                  </div>
                  <span className="text-xs font-medium">{rec.confidence || 0}%</span>
                </div>
              </div>
            </div>

            {rec.market_data_considered && (
              <div className="mt-2 flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium">Data considered: </span>{rec.market_data_considered}
                </p>
              </div>
            )}

            {rec.alternative_suggestion && (
              <div className="mt-1.5 flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium">Alternative: </span>{rec.alternative_suggestion}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}