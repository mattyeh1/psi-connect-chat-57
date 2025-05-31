
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, X, ExternalLink, Globe, MapPin, Star, Phone, Lightbulb } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface OnlinePresenceModuleProps {
  onComplete: (score: number) => void;
  currentScore: number;
}

interface DirectoryItem {
  id: string;
  name: string;
  description: string;
  url: string;
  status: 'registered' | 'not_registered' | 'pending';
  importance: 'high' | 'medium' | 'low';
  points: number;
  requirements: string[];
}

export const OnlinePresenceModule = ({ onComplete, currentScore }: OnlinePresenceModuleProps) => {
  const { psychologist } = useProfile();
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const directoryList: DirectoryItem[] = [
      {
        id: 'google_business',
        name: 'Google My Business',
        description: 'Aparecer en Google Maps y búsquedas locales',
        url: 'https://www.google.com/business/',
        status: 'not_registered',
        importance: 'high',
        points: 30,
        requirements: ['Dirección del consultorio', 'Horarios de atención', 'Teléfono', 'Fotos del lugar']
      },
      {
        id: 'doctoralia',
        name: 'Doctoralia',
        description: 'Principal plataforma médica en Argentina',
        url: 'https://www.doctoralia.com.ar/',
        status: 'not_registered',
        importance: 'high',
        points: 25,
        requirements: ['Matrícula profesional', 'CV actualizado', 'Fotos profesionales']
      },
      {
        id: 'turnos_medicos',
        name: 'TurnosMedicos.com.ar',
        description: 'Plataforma de turnos online',
        url: 'https://www.turnosmedicos.com.ar/',
        status: 'not_registered',
        importance: 'medium',
        points: 15,
        requirements: ['Registro profesional', 'Especialidades', 'Obras sociales']
      },
      {
        id: 'medicos_ar',
        name: 'Medicos.com.ar',
        description: 'Directorio médico nacional',
        url: 'https://www.medicos.com.ar/',
        status: 'not_registered',
        importance: 'medium',
        points: 10,
        requirements: ['Datos profesionales', 'Especialización']
      },
      {
        id: 'linkedin',
        name: 'LinkedIn Profesional',
        description: 'Red profesional para networking',
        url: 'https://www.linkedin.com/',
        status: 'not_registered',
        importance: 'medium',
        points: 10,
        requirements: ['Perfil profesional completo', 'Experiencia laboral', 'Recomendaciones']
      },
      {
        id: 'paginas_amarillas',
        name: 'Páginas Amarillas',
        description: 'Directorio comercial tradicional',
        url: 'https://www.paginasamarillas.com.ar/',
        status: 'not_registered',
        importance: 'low',
        points: 5,
        requirements: ['Datos de contacto', 'Categoría profesional']
      },
      {
        id: 'yelp',
        name: 'Yelp',
        description: 'Plataforma de reseñas',
        url: 'https://www.yelp.com/',
        status: 'not_registered',
        importance: 'low',
        points: 5,
        requirements: ['Perfil de negocio', 'Dirección física']
      }
    ];

    setDirectories(directoryList);
  }, []);

  const handleStatusChange = (directoryId: string, newStatus: 'registered' | 'not_registered' | 'pending') => {
    setDirectories(prev => prev.map(dir => 
      dir.id === directoryId ? { ...dir, status: newStatus } : dir
    ));
    
    if (newStatus === 'registered') {
      setCheckedItems(prev => new Set([...prev, directoryId]));
    } else {
      setCheckedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(directoryId);
        return newSet;
      });
    }
  };

  const calculateScore = () => {
    const totalPoints = directories.reduce((acc, dir) => acc + dir.points, 0);
    const earnedPoints = directories.reduce((acc, dir) => {
      if (dir.status === 'registered') return acc + dir.points;
      if (dir.status === 'pending') return acc + (dir.points * 0.5);
      return acc;
    }, 0);
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
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

  const score = calculateScore();
  const registeredCount = directories.filter(dir => dir.status === 'registered').length;
  const pendingCount = directories.filter(dir => dir.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Resumen de presencia online */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Presencia en Directorios Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Presencia online</span>
                <span className={`text-lg font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </span>
              </div>
              <Progress value={score} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-green-600">{registeredCount}</div>
                <div className="text-xs text-slate-600">Registrado</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-xs text-slate-600">En proceso</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-slate-600">{directories.length}</div>
                <div className="text-xs text-slate-600">Total disponibles</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de directorios */}
      <Card>
        <CardHeader>
          <CardTitle>Directorios Médicos y Profesionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {directories.map((directory) => (
              <div 
                key={directory.id}
                className={`p-4 border rounded-lg ${
                  directory.status === 'registered' ? 'border-green-200 bg-green-50' :
                  directory.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                  'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(directory.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{directory.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(directory.importance)}`}>
                          {directory.importance === 'high' ? 'Alta prioridad' : 
                           directory.importance === 'medium' ? 'Media prioridad' : 'Baja prioridad'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{directory.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700">Requisitos:</p>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {directory.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-slate-400 rounded-full" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-500">{directory.points} pts</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(directory.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visitar sitio
                    </Button>
                    
                    {directory.status === 'not_registered' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(directory.id, 'pending')}
                      >
                        Marcar en proceso
                      </Button>
                    )}
                    
                    {directory.status === 'pending' && (
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleStatusChange(directory.id, 'registered')}
                      >
                        Marcar completado
                      </Button>
                    )}
                    
                    {directory.status === 'registered' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(directory.id, 'not_registered')}
                      >
                        Desmarcar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guía paso a paso para Google My Business */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Guía: Google My Business (Prioridad Alta)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-4">
              Google My Business es la presencia más importante. Te permitirá aparecer en Google Maps 
              cuando pacientes busquen "psicólogo cerca de mí".
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium text-sm">Crear cuenta de Google Business</p>
                  <p className="text-xs text-slate-600">Ve a google.com/business y crea tu perfil</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium text-sm">Verificar ubicación</p>
                  <p className="text-xs text-slate-600">Google enviará código por correo postal</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium text-sm">Completar información</p>
                  <p className="text-xs text-slate-600">Horarios, teléfono, sitio web, fotos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <p className="font-medium text-sm">Subir fotos profesionales</p>
                  <p className="text-xs text-slate-600">Consultorio, fachada, sala de espera</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recomendaciones de Presencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {score < 40 && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-700">
                  <strong>Urgente:</strong> Tu presencia online es mínima. Comienza con Google My Business 
                  y Doctoralia para aparecer en búsquedas de pacientes.
                </p>
              </div>
            )}
            
            <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Mantén la información consistente en todos los directorios. 
                Usa el mismo nombre, dirección y teléfono en todas las plataformas.
              </p>
            </div>
            
            <div className="p-3 border border-green-200 rounded-lg bg-green-50">
              <p className="text-sm text-green-700">
                <strong>Gestión de reseñas:</strong> Una vez registrado, pide a pacientes satisfechos 
                que dejen reseñas honestas en Google y Doctoralia.
              </p>
            </div>
            
            {psychologist?.specialization && (
              <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                <p className="text-sm text-purple-700">
                  <strong>Para {psychologist.specialization}:</strong> Asegúrate de mencionar tu 
                  especialización en todas las descripciones de perfil.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botón de completar */}
      <div className="flex justify-end">
        <Button 
          onClick={() => onComplete(score)}
          className="bg-green-500 hover:bg-green-600"
        >
          Completar Presencia Online ({score}% registrado)
        </Button>
      </div>
    </div>
  );
};
