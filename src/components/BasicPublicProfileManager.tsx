
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useExpandedPublicProfiles } from '@/hooks/useExpandedPublicProfiles';
import { useSpecialties } from '@/hooks/useSpecialties';
import { useForm } from 'react-hook-form';
import { Loader2, Eye, Save, User, Sparkles } from 'lucide-react';

interface BasicFormData {
  custom_url: string;
  is_active: boolean;
  about_description: string;
  years_experience: number | undefined;
  profession_type: string;
}

const professionTypes = [
  { value: 'psychologist', label: 'Psicólogo/a' },
  { value: 'doctor', label: 'Médico/a' },
  { value: 'physiotherapist', label: 'Fisioterapeuta' },
  { value: 'kinesiologist', label: 'Kinesiólogo/a' },
  { value: 'occupational_therapist', label: 'Terapeuta Ocupacional' },
  { value: 'massage_therapist', label: 'Masajista Terapéutico' },
  { value: 'osteopath', label: 'Osteópata' },
  { value: 'nutritionist', label: 'Nutricionista' },
  { value: 'coach', label: 'Coach' },
];

export const BasicPublicProfileManager = () => {
  const { createOrUpdateExpandedProfile, getMyExpandedProfile, loading: profileLoading } = useExpandedPublicProfiles();
  const { specialties, loadSpecialties, saveProfileSpecialties, getProfileSpecialties, loading: specialtiesLoading } = useSpecialties();
  
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const { register, handleSubmit, watch, setValue, reset } = useForm<BasicFormData>({
    defaultValues: {
      custom_url: '',
      is_active: true,
      profession_type: 'psychologist',
      years_experience: undefined,
      about_description: ''
    }
  });

  const watchedProfessionType = watch('profession_type');
  const watchedCustomUrl = watch('custom_url');
  const watchedDescription = watch('about_description');

  useEffect(() => {
    if (watchedProfessionType) {
      loadSpecialties(watchedProfessionType);
      setSelectedSpecialties([]); // Reset specialties when profession changes
    }
  }, [watchedProfessionType]);

  useEffect(() => {
    if (watchedCustomUrl) {
      setPreviewUrl(`${window.location.origin}/perfil/${watchedCustomUrl}`);
    }
  }, [watchedCustomUrl]);

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    const profile = await getMyExpandedProfile();
    if (profile) {
      setCurrentProfileId(profile.id);
      reset({
        custom_url: profile.custom_url,
        is_active: profile.is_active,
        about_description: profile.about_description || '',
        years_experience: profile.years_experience || undefined,
        profession_type: profile.profession_type || 'psychologist'
      });

      // Load specialties for this profile
      if (profile.id) {
        const profileSpecialties = await getProfileSpecialties(profile.id);
        // Limitar a máximo 3 especialidades para plan básico
        setSelectedSpecialties(profileSpecialties.slice(0, 3).map((s: any) => s.id));
      }
    }
  };

  const onSubmit = async (formData: BasicFormData) => {
    try {
      // Truncar descripción a 200 caracteres para plan básico
      const truncatedDescription = formData.about_description?.substring(0, 200) || '';
      
      const result = await createOrUpdateExpandedProfile({
        ...formData,
        about_description: truncatedDescription,
        specialties: selectedSpecialties.slice(0, 3) // Máximo 3 especialidades
      });

      if (result && selectedSpecialties.length > 0) {
        await saveProfileSpecialties(result.id, selectedSpecialties.slice(0, 3));
      }

      setCurrentProfileId(result.id);
    } catch (error) {
      console.error('Error saving basic profile:', error);
    }
  };

  const toggleSpecialty = (specialtyId: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialtyId)) {
        return prev.filter(id => id !== specialtyId);
      } else if (prev.length < 3) { // Máximo 3 especialidades
        return [...prev, specialtyId];
      }
      return prev; // No agregar si ya hay 3
    });
  };

  const getSpecialtiesByCategory = () => {
    const categorized: Record<string, typeof specialties> = {};
    specialties.forEach(specialty => {
      const category = specialty.category || 'Otras';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(specialty);
    });
    return categorized;
  };

  const isLoading = profileLoading || specialtiesLoading;
  const remainingChars = 200 - (watchedDescription?.length || 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Perfil Público Básico
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              Plan Plus
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Crea tu perfil público básico con información esencial para atraer pacientes.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profession_type">Tipo de Profesión</Label>
                  <Select value={watch('profession_type')} onValueChange={(value) => setValue('profession_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu profesión" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="years_experience">Años de Experiencia</Label>
                  <Input
                    {...register('years_experience', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="Ej: 5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="custom_url">URL Personalizada</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 border rounded-l-md bg-muted text-muted-foreground">
                    {window.location.origin}/perfil/
                  </span>
                  <Input
                    {...register('custom_url', { required: true })}
                    placeholder="mi-nombre-profesional"
                    className="rounded-l-none"
                  />
                </div>
                {previewUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {previewUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Descripción Profesional</h3>
              
              <div>
                <Label htmlFor="about_description">
                  Acerca de mí
                  <span className="text-sm text-muted-foreground ml-2">
                    ({remainingChars} caracteres restantes)
                  </span>
                </Label>
                <Textarea
                  {...register('about_description')}
                  placeholder="Describe brevemente tu experiencia y enfoque profesional..."
                  rows={3}
                  maxLength={200}
                  className={remainingChars < 0 ? 'border-red-300' : ''}
                />
                {remainingChars < 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    La descripción debe tener máximo 200 caracteres
                  </p>
                )}
              </div>
            </div>

            {/* Especialidades Básicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Especialidades</h3>
                <Badge variant="outline" className="text-xs">
                  Máximo 3
                </Badge>
              </div>
              
              {specialtiesLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando especialidades...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(getSpecialtiesByCategory()).map(([category, categorySpecialties]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-slate-700">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categorySpecialties.map(specialty => (
                          <div key={specialty.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={specialty.id}
                              checked={selectedSpecialties.includes(specialty.id)}
                              onCheckedChange={() => toggleSpecialty(specialty.id)}
                              disabled={!selectedSpecialties.includes(specialty.id) && selectedSpecialties.length >= 3}
                            />
                            <label
                              htmlFor={specialty.id}
                              className={`text-sm font-medium leading-none cursor-pointer ${
                                !selectedSpecialties.includes(specialty.id) && selectedSpecialties.length >= 3
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              {specialty.icon} {specialty.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSpecialties.length > 0 && (
                <div className="space-y-2">
                  <Label>Especialidades seleccionadas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpecialties.map(specialtyId => {
                      const specialty = specialties.find(s => s.id === specialtyId);
                      return specialty ? (
                        <Badge key={specialtyId} variant="secondary">
                          {specialty.icon} {specialty.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {selectedSpecialties.length >= 3 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">¿Quieres agregar más especialidades?</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Actualiza al Plan Pro para especialidades ilimitadas y funciones avanzadas.
                  </p>
                </div>
              )}
            </div>

            {/* Activación */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(value) => setValue('is_active', value)}
              />
              <Label>Perfil público activo</Label>
            </div>

            <Button type="submit" disabled={isLoading || remainingChars < 0} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Perfil Básico
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
