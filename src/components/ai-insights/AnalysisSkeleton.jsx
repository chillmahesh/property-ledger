import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Building2, TrendingUp, BarChart3, Target, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LOADING_MESSAGES = [
  { text: 'Analyzing nearby rental market...', icon: Building2 },
  { text: 'Comparing competitors...', icon: TrendingUp },
  { text: 'Generating recommendations...', icon: Sparkles },
  { text: 'Calculating demand score...', icon: Target },
  { text: 'Preparing pricing suggestions...', icon: IndianRupee },
  { text: 'Finalizing market intelligence...', icon: BarChart3 },
];

function SkeletonBlock({ className }) {
  return (
    <div className={`animate-pulse bg-muted/60 rounded-lg ${className}`} />
  );
}

export default function AnalysisSkeleton({ propertyName }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const { text, icon: MsgIcon } = LOADING_MESSAGES[msgIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Progress banner */}
      <Card className="overflow-hidden border-blue-200">
        <CardContent className="p-0">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
          <div className="flex items-center gap-3 p-5">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-semibold">{text}</p>
              <p className="text-xs text-muted-foreground">Analyzing {propertyName}...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-3">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-8 w-24" />
            <SkeletonBlock className="h-3 w-16" />
          </CardContent></Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader><SkeletonBlock className="h-5 w-40" /></CardHeader>
            <CardContent className="space-y-3">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><SkeletonBlock className="h-5 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonBlock key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}