export const AI_INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    market_overview: {
      type: 'object',
      properties: {
        average_market_rent: { type: 'number' },
        lowest_rent: { type: 'number' },
        highest_rent: { type: 'number' },
        demand_level: { type: 'string', enum: ['Low', 'Medium', 'High', 'Very High'] },
        competition_level: { type: 'string', enum: ['Low', 'Medium', 'High', 'Very High'] },
        occupancy_trend: { type: 'string', enum: ['Declining', 'Stable', 'Growing'] },
        expected_price_growth: { type: 'string' },
        market_confidence: { type: 'number' },
        area_summary: { type: 'string' },
      },
    },
    room_valuations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          room_number: { type: 'string' },
          current_rent: { type: 'number' },
          market_average: { type: 'number' },
          recommended_rent: { type: 'number' },
          status: { type: 'string', enum: ['Competitive', 'Underpriced', 'Overpriced', 'Premium Opportunity'] },
          reasoning: { type: 'string' },
          pricing_position: { type: 'number' },
        },
      },
    },
    price_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          room_number: { type: 'string' },
          current_rent: { type: 'number' },
          recommended_rent: { type: 'number' },
          difference: { type: 'number' },
          potential_monthly_gain: { type: 'number' },
          potential_annual_gain: { type: 'number' },
          confidence_score: { type: 'number' },
          action: { type: 'string', enum: ['Increase', 'Maintain', 'Reduce'] },
        },
      },
    },
    market_comparison: {
      type: 'object',
      properties: {
        your_occupancy: { type: 'number' },
        market_occupancy: { type: 'number' },
        amenities_comparison: { type: 'string' },
        demand_score: { type: 'number' },
        competition_score: { type: 'number' },
        your_property_summary: { type: 'string' },
        nearby_market_summary: { type: 'string' },
      },
    },
    ai_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          confidence: { type: 'number' },
          expected_impact: { type: 'string' },
          reasoning: { type: 'string' },
          market_data_considered: { type: 'string' },
          alternative_suggestion: { type: 'string' },
        },
      },
    },
    revenue_impact: {
      type: 'object',
      properties: {
        current_monthly_revenue: { type: 'number' },
        potential_monthly_revenue: { type: 'number' },
        potential_annual_revenue: { type: 'number' },
        revenue_increase_percent: { type: 'number' },
      },
    },
    market_trends: {
      type: 'object',
      properties: {
        rent_trend: {
          type: 'array',
          items: {
            type: 'object',
            properties: { month: { type: 'string' }, value: { type: 'number' } },
          },
        },
        demand_trend: {
          type: 'array',
          items: {
            type: 'object',
            properties: { month: { type: 'string' }, value: { type: 'number' } },
          },
        },
        occupancy_trend_data: {
          type: 'array',
          items: {
            type: 'object',
            properties: { month: { type: 'string' }, value: { type: 'number' } },
          },
        },
        price_growth: {
          type: 'array',
          items: {
            type: 'object',
            properties: { month: { type: 'string' }, value: { type: 'number' } },
          },
        },
      },
    },
    property_scores: {
      type: 'object',
      properties: {
        pricing_score: { type: 'number' },
        market_position: { type: 'number' },
        demand_score: { type: 'number' },
        occupancy_score: { type: 'number' },
        growth_potential: { type: 'number' },
        overall_score: { type: 'number' },
      },
    },
    smart_alerts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          type: { type: 'string', enum: ['info', 'warning', 'success', 'danger'] },
          description: { type: 'string' },
        },
      },
    },
  },
};

export function buildAnalysisPrompt(property, rooms) {
  const roomsText = rooms.length > 0
    ? rooms.map(r => `- Room ${r.room_number}: Capacity ${r.capacity} beds, Default monthly rent ₹${r.monthly_rent_default || 'N/A'}`).join('\n')
    : '- No rooms registered yet. Analyze based on the property location and typical PG rates.';

  return `You are an expert real estate market analyst AI specializing in Indian rental markets, PG (Paying Guest) accommodations, and co-living spaces.

Analyze the following property's rental pricing against the current local market using web search:

PROPERTY DETAILS:
- Name: ${property.name}
- Address: ${property.address || 'Not provided'}
- City: ${property.city || 'Not provided'}
- State: ${property.state || 'Not provided'}
- PIN Code: ${property.pincode || 'Not provided'}
- Description: ${property.description || 'Not provided'}

ROOMS AND CURRENT RENT:
${roomsText}

INSTRUCTIONS:
1. Search the web for current rental rates, PG prices, hostel fees, and co-living costs in ${property.city || 'the property location'}, ${property.state || ''} near "${property.address || 'the property address'}".
2. For each room listed, compare the current rent with market rates for similar room types (single sharing, double sharing, triple sharing) in that specific area.
3. Analyze local demand factors: student population, working professional hubs, IT parks, colleges, metro connectivity, and seasonal trends.
4. Provide comprehensive market intelligence covering all sections in the JSON schema.

All monetary values MUST be in INR (₹). All confidence/score values MUST be 0-100. Market trends should cover the last 6 months using month abbreviations (e.g., "Feb", "Mar", "Apr", "May", "Jun", "Jul"). Be specific to the locality/sector/area of the property.`;
}

const DEMAND_COLORS = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-blue-100 text-blue-700 border-blue-200',
  High: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Very High': 'bg-purple-100 text-purple-700 border-purple-200',
};

const STATUS_COLORS = {
  Competitive: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Underpriced: 'bg-amber-100 text-amber-700 border-amber-200',
  Overpriced: 'bg-rose-100 text-rose-700 border-rose-200',
  'Premium Opportunity': 'bg-purple-100 text-purple-700 border-purple-200',
};

const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  High: 'bg-rose-100 text-rose-700 border-rose-200',
};

const ACTION_COLORS = {
  Increase: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
  Maintain: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  Reduce: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
};

const ALERT_STYLES = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', label: 'Info' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', label: 'Warning' },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', label: 'Good' },
  danger: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-600', label: 'Alert' },
};

export function getDemandColor(level) { return DEMAND_COLORS[level] || DEMAND_COLORS.Medium; }
export function getStatusColor(status) { return STATUS_COLORS[status] || STATUS_COLORS.Competitive; }
export function getPriorityColor(priority) { return PRIORITY_COLORS[priority] || PRIORITY_COLORS.Medium; }
export function getActionColor(action) { return ACTION_COLORS[action] || ACTION_COLORS.Maintain; }
export function getAlertStyle(type) { return ALERT_STYLES[type] || ALERT_STYLES.info; }

export function formatINR(value) {
  if (value == null || isNaN(value)) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}