
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Star, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  plan_key: string;
  title: string;
  price_display: string;
  price_cents: number;
  period: string;
  features: string[];
  is_recommended: boolean;
  savings_text?: string;
}

interface SubscriptionPlansProps {
  onPlanSelect: (planId: string) => void;
}

export const SubscriptionPlans = ({ onPlanSelect }: SubscriptionPlansProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('=== FETCHING SUBSCRIPTION PLANS ===');
        
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_cents', { ascending: true });

        if (error) {
          console.error('Error fetching plans:', error);
          throw error;
        }

        console.log('Fetched plans:', data);
        setPlans(data || []);
      } catch (error) {
        console.error('Error in fetchPlans:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes. Inténtalo nuevamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan.plan_key);
    setIsLoading(true);

    try {
      await onPlanSelect(plan.plan_key);
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu selección. Inténtalo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-96 bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Elige tu Plan de Suscripción
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Selecciona el plan que mejor se adapte a tus necesidades profesionales. 
          Todos los planes incluyen acceso completo a la plataforma.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative border-2 transition-all duration-200 hover:shadow-lg ${
              plan.is_recommended ? 'border-purple-500 shadow-md scale-105' : 'border-slate-200'
            }`}
          >
            {plan.is_recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  {plan.savings_text || 'Recomendado'}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                {plan.plan_key.includes('pro') ? (
                  <Crown className="w-6 h-6 text-purple-500" />
                ) : (
                  <Star className="w-6 h-6 text-blue-500" />
                )}
                {plan.title}
              </CardTitle>
              <div className="mt-2">
                <span className={`text-4xl font-bold ${
                  plan.is_recommended ? 'text-purple-600' : 'text-blue-600'
                }`}>
                  {plan.price_display}
                </span>
                <span className="text-slate-500 ml-2">/ mes</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan)}
                disabled={isLoading && selectedPlan === plan.plan_key}
                className={`w-full py-3 ${
                  plan.is_recommended 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' 
                    : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600'
                }`}
                size="lg"
              >
                {isLoading && selectedPlan === plan.plan_key ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {isLoading && selectedPlan === plan.plan_key ? 'Procesando...' : 'Suscribirse Ahora'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Pago seguro procesado por MercadoPago. Puedes cambiar de plan en cualquier momento.
        </p>
      </div>
    </div>
  );
};
