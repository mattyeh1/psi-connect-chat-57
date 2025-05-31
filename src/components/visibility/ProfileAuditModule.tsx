
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, X, Lightbulb, User, Phone, MapPin, FileText } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface ProfileAuditModuleProps {
  onComplete: (score: number) => void;
  currentScore: number;
}

interface AuditItem {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'incomplete' | 'warning';
  points: number;
  fixable: boolean;
}

export const ProfileAuditModule = ({ onComplete, currentScore }: ProfileAuditModuleProps) => {
  const { psychologist } = useProfile();
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    specialization: '',
    license_number: ''
  });

  useEffect(() => {
    if (psychologist) {
      setEditValues({
        first_name: psychologist.first_name || '',
        last_name: psychologist.last_name || '',
        phone: psychologist.phone || '',
        specialization: psychologist.specialization || '',
        license_number: psychologist.license_number || ''
      });

      const items: AuditItem[] = [
        {
          id: 'basic_info',
          title: 'Información básica completa',
          description: 'Nombre y apellido están completados',
          status: (psychologist.first_name && psychologist.last_name) ? 'complete' : 'incomplete',
          points: 20,
          fixable: true
        },
        {
          id: 'phone',
          title: 'Teléfono de contacto',
          description: 'Número de teléfono para que pacientes puedan contactarte',
          status: psychologist.phone ? 'complete' : 'incomplete',
          points: 15,
          fixable: true
        },
        {
          id: 'specialization',
          title: 'Especialización definida',
          description: 'Tu área de especialización está especificada',
          status: psychologist.specialization ? 'complete' : 'incomplete',
          points: 25,
          fixable: true
        },
        {
          id: 'license',
          title: 'Número de matrícula',
          description: 'Número de matrícula profesional para credibilidad',
          status: psychologist.license_number ? 'complete' : 'warning',
          points: 20,
          fixable: true
        },
        {
          id: 'professional_code',
          title: 'Código profesional generado',
          description: 'Sistema ha generado tu código único',
          status: psychologist.professional_code ? 'complete' : 'incomplete',
          points: 10,
          fixable: false
        },
        {
          id: 'specialization_keywords',
          title: 'Palabras clave en especialización',
          description: 'Tu especialización contiene términos específicos para SEO',
          status: (psychologist.specialization && psychologist.specialization.length > 10) ? 'complete' : 'warning',
          points: 10,
          fixable: true
        }
      ];

      setAuditItems(items);
    }
  }, [psychologist]);

  const calculateScore = () => {
    const totalPoints = auditItems.reduce((acc, item) => acc + item.points, 0);
    const earnedPoints = auditItems.reduce((acc, item) => {
      if (item.status === 'complete') return acc + item.points;
      if (item.status === 'warning') return acc + (item.points * 0.5);
      return acc;
    }, 0);
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleSaveChanges = () => {
    console.log('=== SAVING PROFILE CHANGES ===');
    console.log('Edit values:', editValues);
    // Aquí se implementaría la lógica para guardar los cambios
    setIsEditing(false);
    
    // Simular actualización del psychologist object
    setTimeout(() => {
      window.location.reload(); // Para refrescar los datos
    }, 1000);
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

  return (
    <div className="space-y-6">
      {/* Resumen de puntuación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Auditoría de Perfil Profesional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Puntuación del perfil</span>
                <span className={`text-lg font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </span>
              </div>
              <Progress value={score} className="h-3" />
            </div>
            
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{auditItems.filter(item => item.status === 'complete').length} Completos</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>{auditItems.filter(item => item.status === 'warning').length} Advertencias</span>
              </div>
              <div className="flex items-center gap-1">
                <X className="w-4 h-4 text-red-500" />
                <span>{auditItems.filter(item => item.status === 'incomplete').length} Faltantes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de verificación */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditItems.map((item) => (
              <div 
                key={item.id}
                className={`p-4 border rounded-lg ${
                  item.status === 'complete' ? 'border-green-200 bg-green-50' :
                  item.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-500">{item.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor de perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Editar Información del Perfil</span>
            <Button 
              variant={isEditing ? "secondary" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancelar" : "Editar Perfil"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    value={editValues.first_name}
                    onChange={(e) => setEditValues(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={editValues.last_name}
                    onChange={(e) => setEditValues(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={editValues.phone}
                  onChange={(e) => setEditValues(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              
              <div>
                <Label htmlFor="specialization">Especialización</Label>
                <Input
                  id="specialization"
                  value={editValues.specialization}
                  onChange={(e) => setEditValues(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="Ej: Psicología clínica, terapia cognitivo-conductual"
                />
              </div>
              
              <div>
                <Label htmlFor="license_number">Número de Matrícula</Label>
                <Input
                  id="license_number"
                  value={editValues.license_number}
                  onChange={(e) => setEditValues(prev => ({ ...prev, license_number: e.target.value }))}
                  placeholder="Número de matrícula profesional"
                />
              </div>
              
              <Button onClick={handleSaveChanges} className="w-full">
                Guardar Cambios
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{psychologist?.first_name} {psychologist?.last_name}</span>
              </div>
              {psychologist?.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{psychologist.phone}</span>
                </div>
              )}
              {psychologist?.specialization && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="w-4 h-4" />
                  <span>{psychologist.specialization}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {score < 60 && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-700">
                  <strong>Prioridad Alta:</strong> Tu perfil necesita información básica para ser efectivo. 
                  Completa nombre, teléfono y especialización como mínimo.
                </p>
              </div>
            )}
            {score >= 60 && score < 80 && (
              <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="text-sm text-yellow-700">
                  <strong>Casi listo:</strong> Agrega tu número de matrícula y mejora la descripción 
                  de tu especialización con palabras clave específicas.
                </p>
              </div>
            )}
            {score >= 80 && (
              <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                <p className="text-sm text-green-700">
                  <strong>¡Excelente!</strong> Tu perfil está bien optimizado. 
                  Considera expandir tu especialización con más detalles para SEO.
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
          Completar Auditoría ({score}% completado)
        </Button>
      </div>
    </div>
  );
};
