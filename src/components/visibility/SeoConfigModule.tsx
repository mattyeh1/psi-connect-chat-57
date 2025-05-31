
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, X, Search, Globe, Target, Lightbulb } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface SeoConfigModuleProps {
  onComplete: (score: number) => void;
  currentScore: number;
}

interface SeoItem {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'incomplete' | 'warning';
  points: number;
  current: string;
  recommended: string;
}

export const SeoConfigModule = ({ onComplete, currentScore }: SeoConfigModuleProps) => {
  const { psychologist } = useProfile();
  const [seoItems, setSeoItems] = useState<SeoItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [seoConfig, setSeoConfig] = useState({
    title: '',
    description: '',
    keywords: '',
    localSeo: ''
  });

  useEffect(() => {
    if (psychologist) {
      const firstName = psychologist.first_name || '';
      const lastName = psychologist.last_name || '';
      const specialization = psychologist.specialization || 'psicólogo';
      
      const defaultTitle = `${firstName} ${lastName} - ${specialization}`;
      const defaultDescription = `${firstName} ${lastName}, ${specialization} profesional. Consulta psicológica personalizada.`;
      const defaultKeywords = `${specialization}, psicólogo, terapia, consulta psicológica, ${firstName} ${lastName}`;
      
      setSeoConfig({
        title: defaultTitle,
        description: defaultDescription,
        keywords: defaultKeywords,
        localSeo: 'Buenos Aires, Argentina'
      });

      const items: SeoItem[] = [
        {
          id: 'title',
          title: 'Título SEO optimizado',
          description: 'Título descriptivo con nombre y especialización',
          status: firstName && lastName && specialization ? 'complete' : 'incomplete',
          points: 25,
          current: defaultTitle,
          recommended: `${firstName} ${lastName} - ${specialization} en [Tu Ciudad]`
        },
        {
          id: 'description',
          title: 'Meta descripción',
          description: 'Descripción atractiva de 120-160 caracteres',
          status: defaultDescription.length >= 120 && defaultDescription.length <= 160 ? 'complete' : 'warning',
          points: 20,
          current: defaultDescription,
          recommended: 'Descripción detallada de servicios, especialización y ubicación'
        },
        {
          id: 'keywords',
          title: 'Palabras clave relevantes',
          description: 'Términos que usan pacientes para buscarte',
          status: defaultKeywords.split(',').length >= 5 ? 'complete' : 'warning',
          points: 20,
          current: defaultKeywords,
          recommended: 'Al menos 5-7 palabras clave específicas de tu especialización'
        },
        {
          id: 'local_seo',
          title: 'SEO Local configurado',
          description: 'Ubicación geográfica para búsquedas locales',
          status: 'warning',
          points: 15,
          current: 'No configurado',
          recommended: 'Ciudad, barrio y zona de atención específica'
        },
        {
          id: 'structured_data',
          title: 'Datos estructurados',
          description: 'Marcado Schema.org para mejor indexación',
          status: 'incomplete',
          points: 10,
          current: 'No implementado',
          recommended: 'Schema de Profesional Médico y Organización Local'
        },
        {
          id: 'url_optimization',
          title: 'URL amigable',
          description: 'URL personalizada con tu nombre profesional',
          status: 'complete',
          points: 10,
          current: psychologist.professional_code || '',
          recommended: 'URL que incluya tu nombre y especialización'
        }
      ];

      setSeoItems(items);
    }
  }, [psychologist]);

  const calculateScore = () => {
    const totalPoints = seoItems.reduce((acc, item) => acc + item.points, 0);
    const earnedPoints = seoItems.reduce((acc, item) => {
      if (item.status === 'complete') return acc + item.points;
      if (item.status === 'warning') return acc + (item.points * 0.6);
      return acc;
    }, 0);
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleSaveConfig = () => {
    console.log('=== SAVING SEO CONFIG ===');
    console.log('SEO configuration:', seoConfig);
    
    // Actualizar estados basado en la configuración
    setSeoItems(prev => prev.map(item => {
      switch (item.id) {
        case 'title':
          return { ...item, status: seoConfig.title.length > 10 ? 'complete' : 'incomplete', current: seoConfig.title };
        case 'description':
          return { 
            ...item, 
            status: seoConfig.description.length >= 120 && seoConfig.description.length <= 160 ? 'complete' : 'warning',
            current: seoConfig.description 
          };
        case 'keywords':
          return { 
            ...item, 
            status: seoConfig.keywords.split(',').length >= 5 ? 'complete' : 'warning',
            current: seoConfig.keywords 
          };
        case 'local_seo':
          return { ...item, status: seoConfig.localSeo.length > 5 ? 'complete' : 'warning', current: seoConfig.localSeo };
        default:
          return item;
      }
    }));
    
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <X className="w-5 h-5 text-red-500" />;
    }
  };

  const score = calculateScore();

  const keywordSuggestions = [
    'psicólogo clínico',
    'terapia cognitivo conductual',
    'ansiedad y depresión',
    'terapia de pareja',
    'psicología infantil',
    'terapia familiar',
    'consulta psicológica online',
    'tratamiento psicológico',
    'salud mental',
    'bienestar emocional'
  ];

  return (
    <div className="space-y-6">
      {/* Resumen de puntuación SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Configuración SEO Profesional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Optimización SEO</span>
                <span className={`text-lg font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </span>
              </div>
              <Progress value={score} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-green-600">{seoItems.filter(item => item.status === 'complete').length}</div>
                <div className="text-xs text-slate-600">Optimizados</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{seoItems.filter(item => item.status === 'warning').length}</div>
                <div className="text-xs text-slate-600">Parciales</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-red-600">{seoItems.filter(item => item.status === 'incomplete').length}</div>
                <div className="text-xs text-slate-600">Pendientes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurador SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Configuración SEO</span>
            <Button 
              variant={isEditing ? "secondary" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancelar" : "Editar SEO"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Título SEO (recomendado: 50-60 caracteres)</Label>
                <Input
                  id="title"
                  value={seoConfig.title}
                  onChange={(e) => setSeoConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Dr. Juan Pérez - Psicólogo Clínico en Buenos Aires"
                />
                <div className="text-xs text-slate-500 mt-1">
                  {seoConfig.title.length}/60 caracteres
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Meta Descripción (120-160 caracteres)</Label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md text-sm"
                  rows={3}
                  value={seoConfig.description}
                  onChange={(e) => setSeoConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Psicólogo clínico especializado en terapia cognitivo-conductual. Atención presencial y online. Tratamiento para ansiedad, depresión y trastornos del estado de ánimo."
                />
                <div className="text-xs text-slate-500 mt-1">
                  {seoConfig.description.length}/160 caracteres
                </div>
              </div>
              
              <div>
                <Label htmlFor="keywords">Palabras Clave (separadas por comas)</Label>
                <Input
                  id="keywords"
                  value={seoConfig.keywords}
                  onChange={(e) => setSeoConfig(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="psicólogo clínico, terapia cognitivo conductual, ansiedad, depresión"
                />
                <div className="text-xs text-slate-500 mt-1">
                  {seoConfig.keywords.split(',').filter(k => k.trim()).length} palabras clave
                </div>
              </div>
              
              <div>
                <Label htmlFor="localSeo">Ubicación para SEO Local</Label>
                <Input
                  id="localSeo"
                  value={seoConfig.localSeo}
                  onChange={(e) => setSeoConfig(prev => ({ ...prev, localSeo: e.target.value }))}
                  placeholder="Palermo, Buenos Aires, Argentina"
                />
              </div>
              
              <Button onClick={handleSaveConfig} className="w-full">
                Guardar Configuración SEO
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <strong className="text-sm">Título actual:</strong>
                <p className="text-sm text-slate-600">{seoConfig.title}</p>
              </div>
              <div>
                <strong className="text-sm">Descripción:</strong>
                <p className="text-sm text-slate-600">{seoConfig.description}</p>
              </div>
              <div>
                <strong className="text-sm">Palabras clave:</strong>
                <p className="text-sm text-slate-600">{seoConfig.keywords}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis SEO Detallado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoItems.map((item) => (
              <div 
                key={item.id}
                className={`p-4 border rounded-lg ${
                  item.status === 'complete' ? 'border-green-200 bg-green-50' :
                  item.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-500">{item.points} pts</span>
                </div>
                <div className="ml-8 space-y-1">
                  <div>
                    <span className="text-xs font-medium text-slate-500">Actual:</span>
                    <p className="text-xs text-slate-700">{item.current}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500">Recomendado:</span>
                    <p className="text-xs text-slate-600">{item.recommended}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sugerencias de palabras clave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Sugerencias de Palabras Clave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {keywordSuggestions.map((keyword, index) => (
              <button
                key={index}
                className="p-2 text-left border rounded-lg hover:bg-slate-50 text-sm"
                onClick={() => {
                  const current = seoConfig.keywords;
                  const newKeywords = current ? `${current}, ${keyword}` : keyword;
                  setSeoConfig(prev => ({ ...prev, keywords: newKeywords }));
                }}
              >
                {keyword}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recomendaciones SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {score < 60 && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-700">
                  <strong>Crítico:</strong> Tu SEO necesita optimización urgente. Configura título, 
                  descripción y palabras clave básicas para ser encontrado online.
                </p>
              </div>
            )}
            <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Incluye tu ubicación en el título SEO. Los pacientes 
                buscan "psicólogo en [ciudad]" muy frecuentemente.
              </p>
            </div>
            <div className="p-3 border border-green-200 rounded-lg bg-green-50">
              <p className="text-sm text-green-700">
                <strong>Próximo paso:</strong> Una vez configurado el SEO básico, 
                considera crear contenido de blog sobre tu especialización.
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
          Completar Configuración SEO ({score}% optimizado)
        </Button>
      </div>
    </div>
  );
};
