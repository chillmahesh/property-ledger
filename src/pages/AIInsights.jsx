import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { RefreshCw, Sparkles, Building2, Plus, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InfoBanner from '@/components/ai-insights/InfoBanner';
import PropertySelectionCard from '@/components/ai-insights/PropertySelectionCard';
import AnalysisView from '@/components/ai-insights/AnalysisView';
import { buildAnalysisPrompt, AI_INSIGHTS_SCHEMA } from '@/lib/ai-insights-schema';

export default function AIInsights() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list(),
  });

  const { data: beds = [] } = useQuery({
    queryKey: ['beds'],
    queryFn: () => base44.entities.Bed.list(),
  });

  const { data: analysis, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-insights', selectedProperty?.id],
    queryFn: async () => {
      const property = selectedProperty;
      const propertyRooms = rooms.filter(r => r.property_id === property.id);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: buildAnalysisPrompt(property, propertyRooms),
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: AI_INSIGHTS_SCHEMA,
      });

      setLastUpdated(new Date());
      return result;
    },
    enabled: !!selectedProperty,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const handleAnalyze = (property) => {
    setSelectedProperty(property);
  };

  const handleBack = () => {
    setSelectedProperty(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Analysis view
  if (selectedProperty) {
    return (
      <AnalysisView
        property={selectedProperty}
        analysis={analysis}
        isLoading={isLoading}
        error={error ? 'Unable to generate AI analysis. Please check your connection and try again.' : null}
        lastUpdated={lastUpdated}
        onBack={handleBack}
        onRefresh={handleRefresh}
      />
    );
  }

  // Property selection view
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-heading font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI Market Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live rental market intelligence powered by Google Gemini AI
          </p>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
            Last updated {lastUpdated.toLocaleString()}
          </div>
        )}
      </div>

      <InfoBanner />

      {/* Empty state */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">No properties available for AI analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a property to start receiving AI-powered market insights and pricing recommendations.
            </p>
            <Button asChild>
              <Link to="/properties">
                <Plus className="w-4 h-4" />
                Add Property
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold">Select a Property to Analyze</h2>
            <span className="text-xs text-muted-foreground">{properties.length} properties</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => {
              const propBeds = beds.filter(b => {
                const propRooms = rooms.filter(r => r.property_id === property.id);
                return propRooms.some(r => r.id === b.room_id);
              });
              const occupiedBeds = propBeds.filter(b => b.status === 'Occupied').length;
              return (
                <PropertySelectionCard
                  key={property.id}
                  property={property}
                  rooms={rooms}
                  occupiedBeds={occupiedBeds}
                  totalBeds={propBeds.length}
                  onAnalyze={handleAnalyze}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}