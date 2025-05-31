
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, TrendingUp, Globe, Users, Star, Target, CheckCircle, AlertTriangle, Clock, Search } from 'lucide-react';
import { PlanGate } from './PlanGate';

export const VisibilityConsulting = () => {
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
            Configuración Inicial
          </Badge>
        </div>

        {/* Estado inicial - sin análisis */}
        <Card className="border-2 border-dashed border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Análisis de Visibilidad Pendiente</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">
              Completa tu perfil profesional para recibir un análisis personalizado de tu presencia online.
            </p>
            <Button className="bg-green-500 hover:bg-green-600">
              <Target className="w-4 h-4 mr-2" />
              Comenzar Análisis
            </Button>
          </CardContent>
        </Card>

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

        {/* Recomendaciones generales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Primeros Pasos Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="font-semibold text-slate-800">Configura tu perfil SEO</h3>
                  <Badge variant="secondary">Fundamental</Badge>
                </div>
              </div>
              <p className="text-slate-600 mb-3">
                Optimiza tu perfil con palabras clave relevantes para aparecer en búsquedas de Google.
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
                Registra tu consultorio en Google My Business para aparecer en búsquedas locales.
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

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <h3 className="font-semibold text-slate-800">Estrategia de contenido</h3>
                  <Badge variant="outline">Opcional</Badge>
                </div>
              </div>
              <p className="text-slate-600 mb-3">
                Desarrolla una estrategia de contenido educativo para redes sociales profesionales.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  Construye autoridad profesional
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Clock className="w-3 h-3" />
                  30 min/semana
                </div>
                <div className="flex items-center gap-1 text-purple-600">
                  <Star className="w-3 h-3" />
                  Requiere consistencia
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones disponibles */}
        <Card>
          <CardHeader>
            <CardTitle>Herramientas Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Configurar SEO de Perfil</span>
                </div>
                <p className="text-sm text-slate-600 text-left">
                  Optimiza tu perfil para aparecer en búsquedas
                </p>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Análisis de Competencia</span>
                </div>
                <p className="text-sm text-slate-600 text-left">
                  Analiza otros psicólogos en tu área
                </p>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Guía de Reseñas</span>
                </div>
                <p className="text-sm text-slate-600 text-left">
                  Estrategias para obtener testimonios
                </p>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
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
