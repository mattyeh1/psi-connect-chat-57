
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, TrendingUp, Globe, Users, Star, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import { PlanGate } from './PlanGate';

const visibilityMetrics = [
  { label: 'Presencia Online', value: 78, status: 'good', recommendation: 'Optimizar perfil en Google My Business' },
  { label: 'SEO Local', value: 65, status: 'moderate', recommendation: 'Mejorar keywords locales' },
  { label: 'Redes Sociales', value: 45, status: 'poor', recommendation: 'Crear contenido regular' },
  { label: 'Reputación Online', value: 92, status: 'excellent', recommendation: 'Mantener calidad del servicio' }
];

const recommendations = [
  {
    id: 1,
    priority: 'high',
    title: 'Optimizar Google My Business',
    description: 'Tu perfil de GMB necesita más fotos y horarios actualizados',
    impact: 'Alto impacto en búsquedas locales',
    timeEstimate: '2-3 horas',
    difficulty: 'Fácil'
  },
  {
    id: 2,
    priority: 'medium',
    title: 'Crear contenido en redes sociales',
    description: 'Publica tips de salud mental semanalmente',
    impact: 'Incrementa engagement y alcance',
    timeEstimate: '1 hora/semana',
    difficulty: 'Moderado'
  },
  {
    id: 3,
    priority: 'medium',
    title: 'Solicitar reseñas de pacientes',
    description: 'Implementar sistema de seguimiento post-sesión',
    impact: 'Mejora credibilidad y ranking',
    timeEstimate: '30 min/setup',
    difficulty: 'Fácil'
  }
];

const competitorAnalysis = [
  { name: 'Dr. María García', score: 85, strengths: ['SEO', 'Reseñas'], weaknesses: ['Redes sociales'] },
  { name: 'Centro Psicológico Norte', score: 78, strengths: ['Contenido', 'Presencia'], weaknesses: ['Reseñas'] },
  { name: 'Lic. Carlos Ruiz', score: 72, strengths: ['Redes sociales'], weaknesses: ['SEO', 'Web'] }
];

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
            Análisis Mensual
          </Badge>
        </div>

        {/* Score general de visibilidad */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Score de Visibilidad Online
              </span>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">72/100</div>
                <div className="text-sm text-slate-600">+8 vs mes anterior</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visibilityMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{metric.label}</span>
                    <span className={`text-sm font-medium ${
                      metric.status === 'excellent' ? 'text-green-600' :
                      metric.status === 'good' ? 'text-blue-600' :
                      metric.status === 'moderate' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {metric.value}%
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                  <p className="text-xs text-slate-600">{metric.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones personalizadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Recomendaciones Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-500' : 
                      rec.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    <h3 className="font-semibold text-slate-800">{rec.title}</h3>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Marcar como Hecho
                  </Button>
                </div>
                
                <p className="text-slate-600 mb-3">{rec.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {rec.impact}
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-3 h-3" />
                    {rec.timeEstimate}
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <Star className="w-3 h-3" />
                    {rec.difficulty}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Análisis de competencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Análisis de Competencia Local
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitorAnalysis.map((competitor, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{competitor.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">Score de visibilidad:</span>
                        <span className="font-medium text-purple-600">{competitor.score}/100</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver Análisis Completo
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">Fortalezas</h5>
                      <div className="flex flex-wrap gap-1">
                        {competitor.strengths.map((strength, i) => (
                          <Badge key={i} variant="outline" className="text-green-600 border-green-200">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-1">Debilidades</h5>
                      <div className="flex flex-wrap gap-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <Badge key={i} variant="outline" className="text-red-600 border-red-200">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Plan de Acción Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Actualizar Google My Business</h4>
                    <p className="text-sm text-slate-600">Subir 3 fotos nuevas del consultorio</p>
                  </div>
                </div>
                <Button size="sm">Hacer Ahora</Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Solicitar reseñas</h4>
                    <p className="text-sm text-slate-600">Enviar seguimiento a 5 pacientes recientes</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Programar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};
