
import { usePlanCapabilities } from '@/hooks/usePlanCapabilities';
import { BasicPublicProfileManager } from './BasicPublicProfileManager';
import { ExpandedPublicProfileManager } from './ExpandedPublicProfileManager';
import { PlanGate } from './PlanGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Globe } from 'lucide-react';

export const UnifiedProfileManager = () => {
  const { hasCapability, isProUser, isPlusUser, loading } = usePlanCapabilities();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  // Si tiene SEO profile (Plan Pro), mostrar el gestor completo
  if (hasCapability('seo_profile')) {
    return (
      <div className="space-y-6">
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" />
              Gestión de Perfil Premium
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                Plan Pro
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Accede a todas las funciones avanzadas para crear un perfil profesional completo con SEO optimizado.
            </p>
          </CardHeader>
        </Card>
        <ExpandedPublicProfileManager />
      </div>
    );
  }

  // Si tiene basic_profile (Plan Plus), mostrar el gestor básico
  if (hasCapability('basic_profile')) {
    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              Gestión de Perfil Básico
              <Badge className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white">
                Plan Plus
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Crea tu perfil público básico con las características esenciales para atraer pacientes.
            </p>
          </CardHeader>
        </Card>
        <BasicPublicProfileManager />
      </div>
    );
  }

  // Si no tiene ninguna capacidad de perfil, mostrar el gate
  return (
    <PlanGate 
      capability="basic_profile"
      showUpgrade={true}
    >
      <div>Nunca debería llegar aquí</div>
    </PlanGate>
  );
};
