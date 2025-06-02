import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Calendar, MessageCircle, Phone, RefreshCw } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useConversations } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  age?: number;
  notes?: string;
  created_at: string;
  psychologist_id: string;
}

interface PatientManagementProps {
  onNavigateToMessages?: (patientId?: string) => void;
}

export const PatientManagement = ({ onNavigateToMessages }: PatientManagementProps = {}) => {
  const { psychologist } = useProfile();
  const { createOrGetConversation } = useConversations();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (psychologist?.id) {
      fetchPatients();
    }
  }, [psychologist]);

  const fetchPatients = async () => {
    if (!psychologist?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching patients for psychologist:', psychologist.id);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los pacientes",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched patients:', data?.length || 0);
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los pacientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
  };

  const handleStartConversation = async (patient: Patient) => {
    if (!psychologist?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al psicólogo",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating conversation for patient:', patient.id);
      const conversation = await createOrGetConversation(psychologist.id, patient.id);
      
      if (conversation) {
        toast({
          title: "Conversación iniciada",
          description: `Conversación con ${patient.first_name} ${patient.last_name} lista`,
        });
        
        // Navigate to messages if callback provided
        if (onNavigateToMessages) {
          onNavigateToMessages(patient.id);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la conversación",
        variant: "destructive"
      });
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Gestión de Pacientes</h2>
          <p className="text-sm sm:text-base text-slate-600">Administra la información de tus pacientes</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="text-xs sm:text-sm text-slate-600">
            Total: {patients.length} pacientes
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Search Bar - Mobile Optimized */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
        <Input
          placeholder="Buscar pacientes por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 sm:pl-10 h-10 sm:h-12 border-slate-200 focus:border-blue-500 text-sm sm:text-base"
        />
      </div>

      {/* Patients Grid - Responsive */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                      {patient.first_name?.[0]}{patient.last_name?.[0]}
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg text-slate-800">
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {patient.age ? `${patient.age} años` : 'Edad no especificada'}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Activo
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                  {patient.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="break-all">{patient.phone}</span>
                    </p>
                  )}
                  <p><strong>Registrado:</strong> {new Date(patient.created_at).toLocaleDateString('es-ES')}</p>
                </div>
                
                {patient.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-slate-700 line-clamp-3">{patient.notes}</p>
                  </div>
                )}
                
                {/* Action Buttons - Mobile Stacked */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm min-h-[44px] sm:min-h-[auto]">
                    <Calendar className="w-4 h-4" />
                    Ver Citas
                  </button>
                  <button 
                    onClick={() => handleStartConversation(patient)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs sm:text-sm min-h-[44px] sm:min-h-[auto]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Mensaje
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">
            {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
          </h3>
          <p className="text-sm sm:text-base text-slate-500 mb-6 px-4">
            {searchTerm 
              ? 'Intenta con un término de búsqueda diferente'
              : 'Comparte tu código profesional para que los pacientes se registren en tu consulta'
            }
          </p>
          {!searchTerm && psychologist && (
            <div className="max-w-xs sm:max-w-md mx-auto px-4">
              <div className="text-xl sm:text-2xl font-mono font-bold text-blue-600 bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-200 break-all">
                {psychologist.professional_code}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
