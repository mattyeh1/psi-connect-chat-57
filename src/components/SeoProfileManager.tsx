
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Globe, Star } from 'lucide-react';
import { PlanGate } from './PlanGate';

export const SeoProfileManager = () => {
  return (
    <PlanGate capability="seo_profile">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-500" />
            SEO de Perfil Profesional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="seo-title">Título SEO</Label>
              <Input 
                id="seo-title"
                placeholder="Ej: Psicólogo especialista en terapia cognitiva en Buenos Aires"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="seo-description">Descripción SEO</Label>
              <Textarea 
                id="seo-description"
                placeholder="Describe tu especialidad y servicios para aparecer en búsquedas de Google..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="keywords">Palabras Clave</Label>
              <Input 
                id="keywords"
                placeholder="psicólogo, terapia, ansiedad, depresión..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Globe className="w-4 h-4" />
              <span className="font-medium">URL de tu perfil público</span>
            </div>
            <p className="text-sm text-green-600">
              psiconnect.com/perfil/dr-juan-perez
            </p>
          </div>

          <div className="flex gap-3">
            <Button className="bg-purple-500 hover:bg-purple-600">
              Guardar Cambios SEO
            </Button>
            <Button variant="outline">
              <Star className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
          </div>
        </CardContent>
      </Card>
    </PlanGate>
  );
};
