
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';
import { usePlanCapabilities } from '@/hooks/usePlanCapabilities';

export const PlanBadge = () => {
  const { isPlusUser, isProUser, loading } = usePlanCapabilities();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-20 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (isProUser()) {
    return (
      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
        <Crown className="w-3 h-3 mr-1" />
        Pro
      </Badge>
    );
  }

  if (isPlusUser()) {
    return (
      <Badge className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white">
        <Star className="w-3 h-3 mr-1" />
        Plus
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      Trial
    </Badge>
  );
};
