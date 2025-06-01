
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedProfileManager } from '@/components/UnifiedProfileManager';
import { Badge } from '@/components/ui/badge';
import { Globe, Settings, Sparkles } from 'lucide-react';

export const SeoProfileManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Gestión de Perfil Público Profesional
            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-300">
              <Sparkles className="w-3 h-3 mr-1" />
              Adaptativo
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tu perfil se adapta automáticamente a las características de tu plan. Los usuarios Plus obtienen perfiles básicos, mientras que los usuarios Pro acceden a funciones premium.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración del Perfil
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <UnifiedProfileManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
