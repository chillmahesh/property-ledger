import { Info } from 'lucide-react';

export default function InfoBanner() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
      <div className="shrink-0 p-1.5 rounded-lg bg-indigo-100">
        <Info className="w-4 h-4 text-indigo-600" />
      </div>
      <p className="text-sm text-indigo-950/80 leading-relaxed">
        This module automatically analyzes each property's location, searches for current rental market data
        using <span className="font-semibold">Google Gemini AI</span> with live web search, compares it with
        your property's rent, and provides AI-powered pricing recommendations and market intelligence.
      </p>
    </div>
  );
}