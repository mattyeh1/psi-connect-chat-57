
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthPage } from "@/components/AuthPage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, ArrowRight } from "lucide-react";

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [affiliateInfo, setAffiliateInfo] = useState<{
    code: string;
    discount_rate: number;
    psychologist_name?: string;
  } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);

  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (referralCode) {
      validateAffiliateCode(referralCode);
    }
  }, [referralCode]);

  const validateAffiliateCode = async (code: string) => {
    try {
      setValidatingCode(true);
      
      // Validate the affiliate code and get psychologist info
      const { data: affiliateData, error } = await supabase
        .from('affiliate_codes')
        .select(`
          code,
          discount_rate,
          psychologist_id,
          psychologists (
            first_name,
            last_name
          )
        `)
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error validating affiliate code:', error);
        toast({
          title: "Código de referido inválido",
          description: "El código de referido no es válido o ha expirado",
          variant: "destructive"
        });
        return;
      }

      if (!affiliateData) {
        toast({
          title: "Código de referido no encontrado",
          description: "El código de referido no existe o no está activo",
          variant: "destructive"
        });
        return;
      }

      setAffiliateInfo({
        code: affiliateData.code,
        discount_rate: affiliateData.discount_rate,
        psychologist_name: `${affiliateData.psychologists?.first_name} ${affiliateData.psychologists?.last_name}`
      });

      toast({
        title: "¡Código válido!",
        description: `Obtendrás un ${affiliateData.discount_rate}% de descuento en tu primera suscripción`,
      });

    } catch (error) {
      console.error('Error validating affiliate code:', error);
      toast({
        title: "Error",
        description: "No se pudo validar el código de referido",
        variant: "destructive"
      });
    } finally {
      setValidatingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Únete a PsiConnect
          </h1>
          <p className="text-slate-600">
            Crea tu cuenta y comienza a gestionar tu práctica profesional
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Referral Info Card */}
            {referralCode && (
              <div className="lg:order-1">
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-800">
                      <UserCheck className="w-5 h-5" />
                      Código de Referido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validatingCode ? (
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        Validando código...
                      </div>
                    ) : affiliateInfo ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-mono font-bold text-emerald-700 bg-white p-3 rounded-lg border">
                            {affiliateInfo.code}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {affiliateInfo.discount_rate}% de descuento
                          </Badge>
                        </div>

                        {affiliateInfo.psychologist_name && (
                          <div className="text-center">
                            <p className="text-sm text-slate-600">
                              Referido por:
                            </p>
                            <p className="font-semibold text-slate-800">
                              Dr. {affiliateInfo.psychologist_name}
                            </p>
                          </div>
                        )}

                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-semibold text-slate-800 mb-2">Beneficios incluidos:</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• {affiliateInfo.discount_rate}% de descuento en tu primera suscripción</li>
                            <li>• Acceso completo a todas las funcionalidades</li>
                            <li>• Soporte prioritario durante el primer mes</li>
                            <li>• Configuración guiada de tu perfil profesional</li>
                          </ul>
                        </div>

                        <div className="flex items-center gap-2 text-emerald-700 bg-white p-3 rounded-lg border">
                          <ArrowRight className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Completa tu registro para aplicar el descuento
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-red-600">Código de referido inválido</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Auth Component */}
            <div className={`${referralCode ? 'lg:order-2' : ''}`}>
              <AuthPage affiliateCode={referralCode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
