
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, MessageCircle, Star, Crown, Zap, Sparkles } from 'lucide-react';

interface Plan {
  id: string;
  plan_key: string;
  title: string;
  price_display: string;
  features: string[];
  is_recommended: boolean;
  is_premium?: boolean;
  savings_text?: string;
}

export const SubscriptionPlans = () => {
  const plans: Plan[] = [
    {
      id: 'starter',
      plan_key: 'starter',
      title: 'Plan Starter',
      price_display: '$60.000',
      is_recommended: false,
      features: [
        'Funcionalidades esenciales',
        'Agenda de citas',
        'Gestión de pacientes',
        'Recordatorios básicos',
        'Pagos básicos',
        'Acceso completo a la plataforma'
      ]
    },
    {
      id: 'plus',
      plan_key: 'plus',
      title: 'Plan Plus',
      price_display: '$80.000',
      is_recommended: true,
      savings_text: '⭐ Más Popular',
      features: [
        'Todo lo del Plan Starter',
        'Automatización de agenda',
        'Automatización de pagos',
        'Reportes AFIP completos',
        'Soporte preferencial',
        'Consultoría inicial',
        'SEO Psicólogo incluido',
        'Integraciones avanzadas'
      ]
    },
    {
      id: 'pro',
      plan_key: 'pro',
      title: 'Plan Pro',
      price_display: '$120.000 - $130.000',
      is_recommended: false,
      is_premium: true,
      features: [
        'Todo lo del Plan Plus',
        'Early access a nuevas funciones',
        'Consultoría mensual incluida',
        'Integración total y personalizada',
        'Acceso preferencial a soporte',
        'Análisis avanzados y reportes',
        'Prioridad en actualizaciones'
      ]
    }
  ];

  const openWhatsApp = (planTitle: string) => {
    const phoneNumber = "5491144133576";
    const message = `Hola! Quiero contratar el ${planTitle} de ProConnection`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="py-4 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
          Elige tu Plan de Suscripción
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-4 sm:px-0">
          Selecciona el plan que mejor se adapte a tus necesidades profesionales. 
          Todos los planes incluyen acceso completo a la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto px-4">
        {plans.map((plan) => {
          const isPlus = plan.plan_key === 'plus';
          const isPro = plan.plan_key === 'pro';
          
          return (
            <Card 
              key={plan.id} 
              className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                isPlus 
                  ? 'border-amber-400 shadow-2xl scale-105 md:scale-110 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 md:-mt-4 md:mb-4' 
                  : isPro
                  ? 'border-purple-300 shadow-lg hover:scale-[1.02]'
                  : 'border-slate-200 shadow-md hover:scale-[1.02]'
              }`}
            >
              {isPlus && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold shadow-lg animate-pulse">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {plan.savings_text || '⭐ Más Popular'}
                  </Badge>
                </div>
              )}

              <CardHeader className={`text-center pb-3 sm:pb-4 p-4 sm:p-6 ${isPlus ? 'pt-8 sm:pt-10' : ''}`}>
                <CardTitle className={`text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-center gap-2 ${
                  isPlus ? 'text-amber-700' : isPro ? 'text-purple-700' : 'text-slate-800'
                }`}>
                  {isPro ? (
                    <Crown className="w-5 sm:w-6 h-5 sm:h-6 text-purple-500" />
                  ) : isPlus ? (
                    <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-amber-500" />
                  ) : (
                    <Star className="w-5 sm:w-6 h-5 sm:h-6 text-blue-500" />
                  )}
                  {plan.title}
                </CardTitle>
                <div className="mt-3 sm:mt-4">
                  <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
                    isPlus 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent' 
                      : isPro 
                      ? 'text-purple-600' 
                      : 'text-blue-600'
                  }`}>
                    {plan.price_display}
                  </span>
                  <span className="text-slate-500 ml-2 text-sm sm:text-base">/ mes</span>
                </div>
                {isPlus && (
                  <div className="mt-2">
                    <p className="text-xs sm:text-sm text-amber-700 font-semibold bg-amber-100/50 rounded-full px-3 py-1 inline-block">
                      💎 Mejor relación precio/valor
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <Check className={`w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 mt-0.5 ${
                        isPlus ? 'text-amber-600' : 'text-green-500'
                      }`} />
                      <span className={`text-sm sm:text-base leading-relaxed ${
                        isPlus ? 'text-slate-700 font-medium' : 'text-slate-600'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => openWhatsApp(plan.title)}
                  className={`w-full py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 ${
                    isPlus
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : isPro
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                      : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600'
                  }`}
                  size="lg"
                >
                  <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Contactar por WhatsApp
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-6 sm:mt-8">
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto px-4 sm:px-0">
          Contacta con nosotros por WhatsApp para coordinar el pago y activación de tu plan.
        </p>
      </div>
    </div>
  );
};
