import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Loader2, XCircle } from 'lucide-react';

function getStatusInfo(status) {
  if (['failed', 'error'].includes(status))
    return { icon: XCircle, color: 'text-rose-500', label: 'Failed', spin: false };
  if (['pending', 'running', 'in_progress'].includes(status))
    return { icon: Loader2, color: 'text-amber-500', label: 'Running', spin: true };
  return { icon: CheckCircle, color: 'text-emerald-500', label: 'Done', spin: false };
}

export default function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const proj = toolCall.display_projection || {};
  const { hide_details, details_redacted, label, active_label, error_label } = proj;
  const { icon: Icon, color, label: statusLabel, spin } = getStatusInfo(toolCall.status);

  const hideMode = hide_details && details_redacted;
  const displayLabel = hideMode
    ? (['pending', 'running', 'in_progress'].includes(toolCall.status)
        ? active_label
        : ['failed', 'error'].includes(toolCall.status)
          ? error_label
          : label) || toolCall.name
    : toolCall.name;

  let parsedResults = toolCall.results;
  try {
    if (typeof toolCall.results === 'string') parsedResults = JSON.parse(toolCall.results);
  } catch { /* keep raw */ }

  return (
    <div className="mt-1.5 text-xs">
      <button
        onClick={() => !hideMode && setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
      >
        {!hideMode && (expanded
          ? <ChevronDown className="w-3 h-3" />
          : <ChevronRight className="w-3 h-3" />)}
        <Icon className={`w-3 h-3 ${color} ${spin ? 'animate-spin' : ''}`} />
        <span>{displayLabel}</span>
      </button>
      {expanded && !hideMode && (
        <div className="mt-1 ml-6 space-y-1">
          {toolCall.arguments_string && (
            <div>
              <span className="text-muted-foreground/60">Parameters:</span>
              <pre className="mt-0.5 p-1.5 bg-muted rounded text-[10px] overflow-x-auto max-w-[280px]">
                {toolCall.arguments_string}
              </pre>
            </div>
          )}
          {toolCall.results && (
            <div>
              <span className="text-muted-foreground/60">Result:</span>
              <pre className="mt-0.5 p-1.5 bg-muted rounded text-[10px] overflow-x-auto max-w-[280px]">
                {typeof parsedResults === 'string'
                  ? parsedResults
                  : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}