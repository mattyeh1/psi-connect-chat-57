
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, X, Users, Calendar, Target, Lightbulb, FileText, Image, Video } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface SocialStrategyModuleProps {
  onComplete: (score: number) => void;
  currentScore: number;
}

interface SocialPlatform {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'planned';
  importance: 'high' | 'medium' | 'low';
  points: number;
  contentTypes: string[];
}

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  platforms: string[];
  estimated_reach: string;
}

export const SocialStrategyModule = ({ onComplete, currentScore }: SocialStrategyModuleProps) => {
  const { psychologist } = useProfile();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const platformList: SocialPlatform[] = [
      {
        id: 'instagram',
        name: 'Instagram',
        description: 'Plataforma visual ideal para contenido educativo',
        status: 'inactive',
        importance: 'high',
        points: 30,
        contentTypes: ['Posts educativos', 'Stories', 'Reels', 'IGTV']
      },
      {
        id: 'facebook',
        name: 'Facebook',
        description: 'Red social con mayor alcance en Argentina',
        status: 'inactive',
        importance: 'high',
        points: 25,
        contentTypes: ['Artículos', 'Videos', 'Eventos', 'Grupos']
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Red profesional para networking',
        status: 'inactive',
        importance: 'medium',
        points: 20,
        contentTypes: ['Artículos profesionales', 'Posts', 'Networking']
      },
      {
        id: 'youtube',
        name: 'YouTube',
        description: 'Videos educativos sobre salud mental',
        status: 'inactive',
        importance: 'medium',
        points: 15,
        contentTypes: ['Videos educativos', 'Webinars', 'Entrevistas']
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        description: 'Contenido breve para audiencia joven',
        status: 'inactive',
        importance: 'low',
        points: 10,
        contentTypes: ['Videos cortos', 'Tips rápidos', 'Tendencias']
      }
    ];

    const specialization = psychologist?.specialization || 'psicología general';
    
    const contentList: ContentIdea[] = [
      {
        id: 'anxiety_tips',
        title: 'Tips para manejar la ansiedad',
        description: 'Técnicas de respiración y mindfulness',
        category: 'Educativo',
        platforms: ['instagram', 'facebook', 'tiktok'],
        estimated_reach: 'Alto'
      },
      {
        id: 'therapy_myths',
        title: 'Mitos sobre la terapia psicológica',
        description: 'Desmitificar creencias sobre ir al psicólogo',
        category: 'Educativo',
        platforms: ['instagram', 'facebook', 'linkedin'],
        estimated_reach: 'Medio'
      },
      {
        id: 'self_care',
        title: 'Rutinas de autocuidado',
        description: 'Hábitos diarios para el bienestar mental',
        category: 'Bienestar',
        platforms: ['instagram', 'facebook'],
        estimated_reach: 'Alto'
      },
      {
        id: 'specialization_content',
        title: `Contenido sobre ${specialization}`,
        description: `Posts específicos sobre tu especialización`,
        category: 'Especialización',
        platforms: ['instagram', 'facebook', 'linkedin'],
        estimated_reach: 'Medio'
      },
      {
        id: 'office_tour',
        title: 'Tour por el consultorio',
        description: 'Mostrar el espacio terapéutico',
        category: 'Personal',
        platforms: ['instagram', 'facebook'],
        estimated_reach: 'Medio'
      },
      {
        id: 'patient_testimonials',
        title: 'Testimonios de pacientes',
        description: 'Experiencias anónimas (con permiso)',
        category: 'Testimonios',
        platforms: ['facebook', 'linkedin'],
        estimated_reach: 'Alto'
      },
      {
        id: 'mental_health_awareness',
        title: 'Días de concientización',
        description: 'Contenido para fechas especiales de salud mental',
        category: 'Fechas especiales',
        platforms: ['instagram', 'facebook', 'linkedin'],
        estimated_reach: 'Alto'
      },
      {
        id: 'qa_sessions',
        title: 'Sesiones de preguntas y respuestas',
        description: 'Responder consultas frecuentes',
        category: 'Interactivo',
        platforms: ['instagram', 'facebook'],
        estimated_reach: 'Medio'
      }
    ];

    setPlatforms(platformList);
    setContentIdeas(contentList);
  }, [psychologist]);

  const handlePlatformStatusChange = (platformId: string, newStatus: 'active' | 'inactive' | 'planned') => {
    setPlatforms(prev => prev.map(platform => 
      platform.id === platformId ? { ...platform, status: newStatus } : platform
    ));
  };

  const calculateScore = () => {
    const totalPoints = platforms.reduce((acc, platform) => acc + platform.points, 0);
    const earnedPoints = platforms.reduce((acc, platform) => {
      if (platform.status === 'active') return acc + platform.points;
      if (platform.status === 'planned') return acc + (platform.points * 0.3);
      return acc;
    }, 0);
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'planned':
        return <div className="w-5 h-5 border-2 border-yellow-500 rounded-full animate-pulse" />;
      default:
        return <X className="w-5 h-5 text-red-500" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const filteredContent = selectedCategory === 'all' 
    ? contentIdeas 
    : contentIdeas.filter(idea => idea.category === selectedCategory);

  const score = calculateScore();
  const activeCount = platforms.filter(p => p.status === 'active').length;
  const plannedCount = platforms.filter(p => p.status === 'planned').length;

  const categories = ['all', ...Array.from(new Set(contentIdeas.map(idea => idea.category)))];

  return (
    <div className="space-y-6">
      {/* Resumen de estrategia social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Estrategia de Redes Sociales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Presencia en redes sociales</span>
                <span className={`text-lg font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </span>
              </div>
              <Progress value={score} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-green-600">{activeCount}</div>
                <div className="text-xs text-slate-600">Activas</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{plannedCount}</div>
                <div className="text-xs text-slate-600">Planificadas</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-slate-600">{platforms.length}</div>
                <div className="text-xs text-slate-600">Disponibles</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plataformas sociales */}
      <Card>
        <CardHeader>
          <CardTitle>Plataformas Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform) => (
              <div 
                key={platform.id}
                className={`p-4 border rounded-lg ${
                  platform.status === 'active' ? 'border-green-200 bg-green-50' :
                  platform.status === 'planned' ? 'border-yellow-200 bg-yellow-50' :
                  'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(platform.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{platform.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(platform.importance)}`}>
                          {platform.importance === 'high' ? 'Alta prioridad' : 
                           platform.importance === 'medium' ? 'Media prioridad' : 'Baja prioridad'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{platform.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {platform.contentTypes.map((type, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-slate-100 rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-500">{platform.points} pts</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {platform.status === 'inactive' && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePlatformStatusChange(platform.id, 'planned')}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Planificar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handlePlatformStatusChange(platform.id, 'active')}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Activar
                      </Button>
                    </>
                  )}
                  
                  {platform.status === 'planned' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handlePlatformStatusChange(platform.id, 'active')}
                      >
                        Activar ahora
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlatformStatusChange(platform.id, 'inactive')}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  
                  {platform.status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePlatformStatusChange(platform.id, 'inactive')}
                    >
                      Desactivar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ideas de contenido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Ideas de Contenido Profesional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros de categoría */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    selectedCategory === category 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Todas' : category}
                </button>
              ))}
            </div>
            
            {/* Lista de ideas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContent.map((idea) => (
                <div key={idea.id} className="p-4 border rounded-lg hover:bg-slate-50">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{idea.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        idea.estimated_reach === 'Alto' ? 'bg-green-100 text-green-700' :
                        idea.estimated_reach === 'Medio' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {idea.estimated_reach} alcance
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{idea.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {idea.platforms.map((platform) => (
                        <span key={platform} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {platforms.find(p => p.id === platform)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendario de contenido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Planificador de Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Frecuencia recomendada para cada plataforma activa:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.filter(p => p.status === 'active' || p.status === 'planned').map((platform) => (
                <div key={platform.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(platform.status)}
                    <span className="font-medium text-sm">{platform.name}</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {platform.id === 'instagram' && (
                      <>
                        <div>• Posts: 3-4 por semana</div>
                        <div>• Stories: Diario</div>
                        <div>• Reels: 2-3 por semana</div>
                      </>
                    )}
                    {platform.id === 'facebook' && (
                      <>
                        <div>• Posts: 2-3 por semana</div>
                        <div>• Artículos: 1 por semana</div>
                        <div>• Videos: 1-2 por semana</div>
                      </>
                    )}
                    {platform.id === 'linkedin' && (
                      <>
                        <div>• Posts profesionales: 2-3 por semana</div>
                        <div>• Artículos: 1 por semana</div>
                      </>
                    )}
                    {platform.id === 'youtube' && (
                      <>
                        <div>• Videos educativos: 1 por semana</div>
                        <div>• Shorts: 2-3 por semana</div>
                      </>
                    )}
                    {platform.id === 'tiktok' && (
                      <>
                        <div>• Videos cortos: 3-5 por semana</div>
                        <div>• Participar en tendencias</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recomendaciones de Estrategia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {score < 30 && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-700">
                  <strong>Comienza gradualmente:</strong> No actives todas las redes a la vez. 
                  Empieza con Instagram y Facebook, que tienen mayor alcance en Argentina.
                </p>
              </div>
            )}
            
            <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-700">
                <strong>Contenido ético:</strong> Siempre respeta la confidencialidad. 
                Nunca publiques información que pueda identificar pacientes.
              </p>
            </div>
            
            <div className="p-3 border border-green-200 rounded-lg bg-green-50">
              <p className="text-sm text-green-700">
                <strong>Consistencia es clave:</strong> Es mejor publicar poco pero constante 
                que publicar mucho y luego abandonar las redes.
              </p>
            </div>
            
            <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
              <p className="text-sm text-purple-700">
                <strong>Interacción profesional:</strong> Responde comentarios de manera 
                profesional y deriva consultas específicas a consulta privada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de completar */}
      <div className="flex justify-end">
        <Button 
          onClick={() => onComplete(score)}
          className="bg-green-500 hover:bg-green-600"
        >
          Completar Estrategia Social ({score}% implementado)
        </Button>
      </div>
    </div>
  );
};
