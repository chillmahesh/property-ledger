import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, MapPin, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AnalysisSkeleton from './AnalysisSkeleton';
import SmartAlerts from './SmartAlerts';
import MarketOverview from './MarketOverview';
import RentValuationCard from './RentValuationCard';
import PriceRecommendationTable from './PriceRecommendationTable';
import MarketComparison from './MarketComparison';
import AIRecommendations from './AIRecommendations';
import RevenueImpact from './RevenueImpact';
import PropertyScore from './PropertyScore';
import MarketTrends from './MarketTrends';

export default function AnalysisView({ property, analysis, isLoading, error, lastUpdated, onBack, onRefresh }) {
  if (isLoading) return <AnalysisSkeleton propertyName={property.name} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold">{property.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {property.address ? `${property.address}, ` : ''}
                {property.city ? `${property.city}, ` : ''}{property.state || ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-rose-200">
          <CardContent className="p-6 text-center">
            <div className="inline-flex p-3 rounded-full bg-rose-50 mb-3">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Analysis Failed</h3>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
              Retry Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {analysis.smart_alerts && <SmartAlerts alerts={analysis.smart_alerts} />}
          {analysis.market_overview && <MarketOverview data={analysis.market_overview} />}
          {analysis.revenue_impact && <RevenueImpact data={analysis.revenue_impact} />}
          {analysis.property_scores && <PropertyScore scores={analysis.property_scores} />}

          {analysis.room_valuations?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-heading font-bold flex items-center gap-2">
                <span className="text-lg">🏠</span> Rent Valuation Analysis
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {analysis.room_valuations.map((v, i) => (
                  <RentValuationCard key={i} valuation={v} />
                ))}
              </div>
            </div>
          )}

          {analysis.price_recommendations && (
            <PriceRecommendationTable recommendations={analysis.price_recommendations} />
          )}
          {analysis.market_comparison && <MarketComparison data={analysis.market_comparison} />}
          {analysis.market_trends && <MarketTrends data={analysis.market_trends} />}
          {analysis.ai_recommendations && <AIRecommendations recommendations={analysis.ai_recommendations} />}
        </motion.div>
      )}
    </div>
  );
}