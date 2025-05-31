
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, TrendingUp, Globe, Users, Star, Target, CheckCircle, AlertTriangle, Clock, Search, ExternalLink } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { useProfile } from '@/hooks/useProfile';

export const VisibilityConsulting = () => {
  const { psychologist } = useProfile();
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleStartAnalysis = () => {
    setAnalysisStarted(true);
    // Simular análisis automático de algunos elementos básicos
    setTimeout(() => {
      setCompletedSteps(['profile-check']);
    }, 1000);
  };

  const handleCompleteStep = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const analysisProgress = (completedSteps.length / 4) * 100;

  return (
    <PlanGate capability="visibility_consulting">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Consultoría de Visibilidad</h2>
            <p className="text-slate-600">Análisis personalizado para aumentar tu presencia online</p>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-700">
            <Target className="w-3 h-3 mr-1" />
            {analysisStarted ? `${Math.round(analysisProgress)}% Completado` : 'Listo para comenzar'}
          </Badge>
        </div>

        {!analysisStarted ? (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Análisis de Visibilidad Pendiente</h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                Vamos a analizar tu presencia online actual y crear un plan personalizado para mejorar tu visibilidad.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleStartAnalysis}
              >
                <Target className="w-4 h-4 mr-2" />
                Comenzar Análisis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Análisis en Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Progreso del análisis</span>
                    <span className="text-sm font-medium text-slate-800">{Math.round(analysisProgress)}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 border rounded-lg ${completedSteps.includes('profile-check') ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {completedSteps.includes('profile-check') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Search className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-medium">Verificación de Perfil</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {completedSteps.includes('profile-check') 
                        ? `Perfil de ${psychologist?.first_name} ${psychologist?.last_name} verificado correctamente.`
                        : 'Analizando completitud del perfil...'
                      }
                    </p>
                  </div>

                  <div className={`p-4 border rounded-lg ${completedSteps.includes('seo-check') ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {completedSteps.includes('seo-check') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Globe className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-medium">Optimización SEO</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {completedSteps.includes('seo-check')
                        ? 'SEO configurado y optimizado.'
                        : 'Verificando configuración SEO...'
                      }
                    </p>
                    {!completedSteps.includes('seo-check') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => handleCompleteStep('seo-check')}
                      >
                        Configurar SEO
                      </Button>
                    )}
                  </div>

                  <div className={`p-4 border rounded-lg ${completedSteps.includes('online-presence') ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {completedSteps.includes('online-presence') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Users className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-medium">Presencia Online</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {completedSteps.includes('online-presence')
                        ? 'Presencia online establecida en directorios.'
                        : 'Verificando presencia en directorios...'
                      }
                    </p>
                    {!completedSteps.includes('online-presence') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => handleCompleteStep('online-presence')}
                      >
                        Crear Presencia
                      </Button>
                    )}
                  </div>

                  <div className={`p-4 border rounded-lg ${completedSteps.includes('social-strategy') ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {completedSteps.includes('social-strategy') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Star className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-medium">Estrategia Social</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {completedSteps.includes('social-strategy')
                        ? 'Estrategia de redes sociales implementada.'
                        : 'Desarrollando estrategia de contenido...'
                      }
                    </p>
                    {!completedSteps.includes('social-strategy') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => handleCompleteStep('social-strategy')}
                      >
                        Crear Estrategia
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Areas de evaluación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Áreas de Evaluación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Presencia Online</h4>
                    <p className="text-sm text-slate-600">Google My Business, directorios médicos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Search className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">SEO Local</h4>
                    <p className="text-sm text-slate-600">Optimización para búsquedas locales</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Redes Sociales</h4>
                    <p className="text-sm text-slate-600">Estrategia de contenido profesional</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Reputación Online</h4>
                    <p className="text-sm text-slate-600">Gestión de reseñas y testimonios</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones personalizadas */}
        {analysisStarted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Recomendaciones Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="font-semibold text-slate-800">Optimiza tu perfil SEO</h3>
                    <Badge variant="secondary">Prioritario</Badge>
                  </div>
                </div>
                <p className="text-slate-600 mb-3">
                  Completa tu perfil con palabras clave relevantes como "{psychologist?.specialization || 'psicólogo'}" para aparecer en búsquedas locales.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    Alto impacto en visibilidad
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-3 h-3" />
                    15-30 minutos
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <Star className="w-3 h-3" />
                    Fácil de implementar
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <h3 className="font-semibold text-slate-800">Crea presencia en Google</h3>
                    <Badge variant="secondary">Importante</Badge>
                  </div>
                </div>
                <p className="text-slate-600 mb-3">
                  Registra tu consultorio en Google My Business para aparecer en búsquedas locales de psicólogos en tu área.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    Esencial para búsquedas locales
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-3 h-3" />
                    1-2 horas
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <Star className="w-3 h-3" />
                    Configuración una sola vez
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Herramientas funcionales */}
        <Card>
          <CardHeader>
            <CardTitle>Herramientas Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => window.open('/app#seo', '_self')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Configurar SEO de Perfil</span>
                </div>
                <p className="text-sm text-slate-600 text-left">
                  Optimiza tu perfil para aparecer en búsquedas
                </p>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => {
                  window.open('https://www.google.com/business/', '_blank');
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Google My Business</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
                <p className="text-sm text-slate-600 text-left">
                  Registra tu consultorio en Google
                </p>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => {
                  alert('Próximamente: Guía completa para obtener reseñas de pacientes de forma ética y profesional.');
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Guía de Reseñas</span>
                </div>
                <p className="text-sm text-slate-600 text-left">
                  Estrategias para obtener testimonios
                </p>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => {
                  alert('Próximamente: Calendario de contenido profesional para redes sociales con plantillas específicas para psicólogos.');
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Plan de Contenido</span>
                </div>
                <p className="text-sm text-slate-600 text-left">
                  Calendario de publicaciones profesionales
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};
