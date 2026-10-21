import { motion } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { getAlertStyle } from '@/lib/ai-insights-schema';

const ICONS = { info: Info, warning: AlertTriangle, success: CheckCircle, danger: AlertOctagon };

export default function SmartAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-heading font-bold flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Smart Alerts
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {alerts.map((alert, i) => {
          const style = getAlertStyle(alert.type);
          const Icon = ICONS[alert.type] || Info;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}