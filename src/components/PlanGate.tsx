
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, Star } from 'lucide-react';
import { usePlanCapabilities } from '@/hooks/usePlanCapabilities';

interface PlanGateProps {
  capability: 'seo_profile' | 'basic_profile' | 'advanced_reports' | 'early_access' | 'priority_support' | 'visibility_consulting';
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export const PlanGate = ({ 
  capability, 
  children, 
  fallback,
  showUpgrade = true 
}: PlanGateProps) => {
  const { hasCapability, loading, isPlusUser } = usePlanCapabilities();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  if (hasCapability(capability)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const getFeatureName = (cap: string) => {
    const names = {
      basic_profile: 'Perfil Público Básico',
      seo_profile: 'SEO de Perfil Profesional',
      advanced_reports: 'Reportes Avanzados',
      early_access: 'Acceso Anticipado',
      priority_support: 'Soporte Preferencial',
      visibility_consulting: 'Consultoría de Visibilidad'
    };
    return names[cap as keyof typeof names] || 'Función Premium';
  };

  const getRequiredPlan = (cap: string) => {
    if (cap === 'basic_profile') {
      return { name: 'Plus', icon: Star, gradient: 'from-blue-500 to-emerald-500' };
    }
    return { name: 'Pro', icon: Crown, gradient: 'from-purple-500 to-blue-500' };
  };

  const requiredPlan = getRequiredPlan(capability);

  return (
    <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
      <CardHeader className="text-center pb-4">
        <div className={`w-16 h-16 bg-gradient-to-r ${requiredPlan.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <requiredPlan.icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-lg font-semibold text-slate-700">
          {getFeatureName(capability)}
        </CardTitle>
        <Badge variant="outline" className="mx-auto">
          <Zap className="w-3 h-3 mr-1" />
          Solo Plan {requiredPlan.name}
        </Badge>
      </CardHeader>

      <CardContent className="text-center">
        <p className="text-slate-600 mb-4">
          Esta funcionalidad está disponible exclusivamente en el Plan {requiredPlan.name}. 
          {isPlusUser() && capability === 'seo_profile' && ' Actualiza tu plan para acceder a funciones premium.'}
        </p>
        
        <Button 
          className={`bg-gradient-to-r ${requiredPlan.gradient} hover:from-purple-600 hover:to-blue-600`}
          size="sm"
        >
          <Lock className="w-4 h-4 mr-2" />
          {isPlusUser() && capability === 'seo_profile' ? 'Actualizar a Pro' : `Ver Plan ${requiredPlan.name}`}
        </Button>
      </CardContent>
    </Card>
  );
};
