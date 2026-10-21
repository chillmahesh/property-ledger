import { motion } from 'framer-motion';
import { MapPin, DoorOpen, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PropertySelectionCard({ property, rooms, occupiedBeds, totalBeds, onAnalyze }) {
  const propertyRooms = rooms.filter(r => r.property_id === property.id);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const monthlyRevenue = propertyRooms.reduce((s, r) => s + (r.monthly_rent_default || 0) * (r.capacity || 1), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-base truncate">{property.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {property.city ? `${property.city}, ${property.state || ''}` : property.address || 'Location not set'}
                </span>
              </div>
            </div>
          </div>

          {property.address && (
            <p className="text-xs text-muted-foreground line-clamp-2">{property.address}</p>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <DoorOpen className="w-4 h-4 mx-auto text-blue-500 mb-1" />
              <p className="text-xs text-muted-foreground">Rooms</p>
              <p className="text-sm font-bold">{propertyRooms.length}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <TrendingUp className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
              <p className="text-xs text-muted-foreground">Occupancy</p>
              <p className="text-sm font-bold">{occupancyRate}%</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Sparkles className="w-4 h-4 mx-auto text-purple-500 mb-1" />
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-sm font-bold">₹{(monthlyRevenue / 1000).toFixed(0)}k</p>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => onAnalyze(property)}
          >
            <Sparkles className="w-4 h-4" />
            Analyze with AI
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}