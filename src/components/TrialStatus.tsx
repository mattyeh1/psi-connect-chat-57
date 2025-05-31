
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, AlertTriangle, Crown, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { usePlanCapabilities } from '@/hooks/usePlanCapabilities';
import { PlanBadge } from './PlanBadge';

export const TrialStatus = () => {
  const { psychologist } = useProfile();
  const { isPlusUser, isProUser } = usePlanCapabilities();
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (psychologist) {
      fetchTrialStatus();
    }
  }, [psychologist]);

  const fetchTrialStatus = async () => {
    if (!psychologist) return;

    try {
      // Obtener días restantes del trial
      const { data: daysData, error: daysError } = await supabase.rpc('get_trial_days_remaining', {
        psychologist_id: psychologist.id
      });

      if (daysError) {
        console.error('Error fetching trial days:', daysError);
      } else {
        setTrialDaysRemaining(daysData);
      }

      // Verificar si el trial ha expirado
      const { data: expiredData, error: expiredError } = await supabase.rpc('is_trial_expired', {
        psychologist_id: psychologist.id
      });

      if (expiredError) {
        console.error('Error checking trial expiration:', expiredError);
      } else {
        setIsTrialExpired(expiredData);
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si tiene suscripción activa (Plus o Pro)
  if (psychologist?.subscription_status === 'active' && (isPlusUser() || isProUser())) {
    return (
      <Card className="border-0 shadow-lg border-l-4 border-l-green-500 py-0 my-[31px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            {isProUser() ? <Crown className="w-5 h-5" /> : <Star className="w-5 h-5" />}
            Plan Activo
            <PlanBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            {isProUser() 
              ? '¡Excelente! Tienes acceso a todas las funciones premium de PsiConnect.'
              : '¡Genial! Tu plan Plus está activo. Considera actualizar a Pro para funciones avanzadas.'
            }
          </p>
          {isPlusUser() && (
            <Button 
              variant="outline" 
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <Crown className="w-4 h-4 mr-2" />
              Actualizar a Pro
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Si el trial ha expirado
  if (isTrialExpired) {
    return (
      <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Trial Expirado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-600">
              Tu período de prueba ha terminado. Selecciona un plan para continuar usando PsiConnect.
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg">
              <CreditCard className="w-4 h-4 mr-2" />
              Ver Planes de Suscripción
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si está en trial activo
  if (psychologist?.subscription_status === 'trial' && trialDaysRemaining !== null) {
    const isLastDays = trialDaysRemaining <= 2;
    
    return (
      <Card className={`border-0 shadow-lg border-l-4 ${isLastDays ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isLastDays ? 'text-orange-700' : 'text-blue-700'}`}>
            <Clock className="w-5 h-5" />
            Período de Prueba
            <PlanBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${isLastDays ? 'text-orange-600' : 'text-blue-600'}`}>
                {trialDaysRemaining}
              </div>
              <p className="text-sm text-slate-600">
                {trialDaysRemaining === 1 ? 'día restante' : 'días restantes'}
              </p>
            </div>
            
            {isLastDays && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700 text-center">
                  ¡Tu trial está por vencer! Selecciona un plan para no perder acceso.
                </p>
              </div>
            )}
            
            <Button 
              variant={isLastDays ? "default" : "outline"} 
              className={`w-full ${isLastDays ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg' : ''}`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLastDays ? 'Seleccionar Plan Ahora' : 'Ver Planes de Suscripción'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
