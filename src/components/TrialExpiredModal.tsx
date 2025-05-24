
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard } from 'lucide-react';

interface TrialExpiredModalProps {
  onUpgrade: () => void;
}

export const TrialExpiredModal = ({ onUpgrade }: TrialExpiredModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Trial Expirado
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Tu período de prueba de 7 días ha terminado. Para continuar usando 
              PsiConnect y acceder a todas las funciones, necesitas activar una suscripción.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">¿Qué incluye la suscripción?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Gestión ilimitada de pacientes</li>
                <li>• Sistema de citas y recordatorios</li>
                <li>• Mensajería segura con pacientes</li>
                <li>• Reportes y estadísticas</li>
                <li>• Soporte técnico prioritario</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg"
              size="lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Activar Suscripción
            </Button>
            
            <p className="text-xs text-center text-slate-500">
              Al activar tu suscripción, podrás continuar usando todas las funciones 
              de PsiConnect sin interrupciones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
