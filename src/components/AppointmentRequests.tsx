import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Check, X, FileText, RefreshCw, Video, ChevronRight, Receipt, ExternalLink, Eye } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Patient {
  first_name: string;
  last_name: string;
  phone?: string;
}

interface AppointmentRequest {
  id: string;
  patient_id: string;
  preferred_date: string;
  preferred_time: string;
  type: string;
  notes?: string;
  status: string;
  created_at: string;
  patient?: Patient | null;
  payment_proof_url?: string;
  payment_status?: string;
  payment_amount?: number;
}

interface AppointmentRequestsProps {
  onRequestProcessed?: () => void;
  maxDisplayItems?: number;
  isDashboardView?: boolean;
}

export const AppointmentRequests = ({ 
  onRequestProcessed, 
  maxDisplayItems = 3, 
  isDashboardView = false 
}: AppointmentRequestsProps) => {
  const { psychologist } = useProfile();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  console.log('AppointmentRequests: Component mounted/updated, psychologist:', psychologist?.id);

  useEffect(() => {
    if (psychologist?.id) {
      console.log('AppointmentRequests: Setting up for psychologist:', psychologist.id);
      fetchRequests();
    } else {
      console.log('AppointmentRequests: No psychologist ID available');
      setLoading(false);
    }
  }, [psychologist?.id]);

  const fetchRequests = async () => {
    if (!psychologist?.id) {
      console.log('AppointmentRequests: No psychologist ID, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('AppointmentRequests: === FETCHING APPOINTMENT REQUESTS ===');
      console.log('AppointmentRequests: Psychologist ID:', psychologist.id);
      
      setLoading(true);

      // First fetch appointment requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .order('created_at', { ascending: false });

      console.log('AppointmentRequests: Raw requests data:', requestsData);
      console.log('AppointmentRequests: Requests error:', requestsError);

      if (requestsError) {
        console.error('AppointmentRequests: Error fetching appointment requests:', requestsError);
        toast({
          title: "Error",
          description: "No se pudieron cargar las solicitudes de citas",
          variant: "destructive"
        });
        setRequests([]);
        return;
      }

      if (!requestsData || requestsData.length === 0) {
        console.log('AppointmentRequests: No requests found');
        setRequests([]);
        return;
      }

      // Then fetch patient data for each request
      const requestsWithPatients = await Promise.all(
        requestsData.map(async (request) => {
          try {
            const { data: patientData, error: patientError } = await supabase
              .from('patients')
              .select('first_name, last_name, phone')
              .eq('id', request.patient_id)
              .single();

            if (patientError) {
              console.error('AppointmentRequests: Error fetching patient data for', request.patient_id, ':', patientError);
              return {
                ...request,
                patient: null
              };
            }

            return {
              ...request,
              patient: patientData
            };
          } catch (error) {
            console.error('AppointmentRequests: Exception fetching patient data:', error);
            return {
              ...request,
              patient: null
            };
          }
        })
      );

      console.log('AppointmentRequests: Processed requests with patients:', requestsWithPatients);
      console.log('AppointmentRequests: Setting requests state with', requestsWithPatients.length, 'items');
      
      setRequests(requestsWithPatients);

    } catch (error) {
      console.error('AppointmentRequests: Exception fetching appointment requests:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar las solicitudes",
        variant: "destructive"
      });
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    console.log('AppointmentRequests: Manual refresh triggered');
    setRefreshing(true);
    await fetchRequests();
  };

  const createJitsiMeeting = async (appointmentId: string, patientName: string, psychologistName: string, appointmentDate: string) => {
    try {
      console.log('=== CREATING JITSI MEETING ===');
      console.log('Appointment ID:', appointmentId);
      console.log('Patient:', patientName);
      console.log('Psychologist:', psychologistName);
      console.log('Date:', appointmentDate);

      const { data, error } = await supabase.functions.invoke('create-jitsi-meeting', {
        body: {
          appointmentId,
          patientName,
          psychologistName,
          appointmentDate
        }
      });

      if (error) {
        console.error('Error calling create-jitsi-meeting function:', error);
        throw new Error(`Error al crear reunión: ${error.message}`);
      }

      console.log('Jitsi meeting created successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception creating Jitsi meeting:', error);
      throw error;
    }
  };

  const handlePaymentVerification = async (requestId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('appointment_requests')
        .update({ 
          payment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: status === 'verified' ? 'Comprobante verificado' : 'Comprobante rechazado',
        description: `El comprobante de pago ha sido ${status === 'verified' ? 'verificado' : 'rechazado'} exitosamente.`,
      });

      await fetchRequests();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del comprobante",
        variant: "destructive"
      });
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    console.log(`AppointmentRequests: ${action === 'approved' ? 'Approving' : 'Rejecting'} request:`, requestId);
    
    if (!requestId) {
      toast({
        title: "Error",
        description: "ID de solicitud inválido",
        variant: "destructive"
      });
      return;
    }

    setProcessingId(requestId);
    
    try {
      if (action === 'approved') {
        // Find the request to get details for creating the appointment
        const request = requests.find(r => r.id === requestId);
        if (!request) {
          throw new Error('Solicitud no encontrada');
        }

        console.log('AppointmentRequests: Creating appointment for request:', request);

        // Create appointment date by combining date and time
        const [year, month, day] = request.preferred_date.split('-');
        const [hours, minutes] = request.preferred_time.split(':');
        
        const appointmentDate = new Date();
        appointmentDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        console.log('AppointmentRequests: Creating appointment with data:', {
          patient_id: request.patient_id,
          psychologist_id: psychologist.id,
          appointment_date: appointmentDate.toISOString(),
          type: request.type,
          notes: request.notes,
          status: 'confirmed'
        });

        // Create the actual appointment
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            patient_id: request.patient_id,
            psychologist_id: psychologist.id,
            appointment_date: appointmentDate.toISOString(),
            type: request.type,
            status: 'confirmed',
            notes: request.notes || null,
            duration_minutes: 60
          })
          .select()
          .single();

        if (appointmentError) {
          console.error('AppointmentRequests: Error creating appointment:', appointmentError);
          throw new Error(`No se pudo crear la cita: ${appointmentError.message}`);
        }

        console.log('AppointmentRequests: Appointment created successfully:', appointmentData);

        // Create Jitsi meeting for the appointment
        try {
          const patientName = request.patient 
            ? `${request.patient.first_name} ${request.patient.last_name}`
            : 'Paciente';
          const psychologistName = `${psychologist.first_name} ${psychologist.last_name}`;
          
          await createJitsiMeeting(
            appointmentData.id,
            patientName,
            psychologistName,
            appointmentDate.toISOString()
          );

          console.log('Jitsi meeting created and linked to appointment');
        } catch (jitsiError) {
          console.error('Error creating Jitsi meeting:', jitsiError);
          // Don't fail the entire process if Jitsi creation fails
          toast({
            title: "Advertencia",
            description: "Cita creada pero no se pudo generar la reunión virtual. Puedes crearla manualmente desde el calendario.",
            variant: "default"
          });
        }
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from('appointment_requests')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('AppointmentRequests: Error updating request:', updateError);
        throw new Error('No se pudo actualizar la solicitud');
      }

      console.log('AppointmentRequests: Request status updated successfully');

      const actionLabel = action === 'approved' ? 'aprobada y programada' : 'rechazada';
      toast({
        title: `Solicitud ${actionLabel}`,
        description: action === 'approved' 
          ? 'La cita ha sido creada exitosamente con reunión virtual incluida.'
          : 'La solicitud de cita ha sido rechazada.',
      });

      // Refresh the requests list and notify parent component
      await fetchRequests();
      onRequestProcessed?.();
      
    } catch (error) {
      console.error('AppointmentRequests: Error processing request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: "Terapia Individual",
      couple: "Terapia de Pareja",
      family: "Terapia Familiar",
      evaluation: "Evaluación",
      follow_up: "Seguimiento"
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    try {
      // Si es una fecha en formato YYYY-MM-DD, crear la fecha directamente sin UTC
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Para fechas con timestamp completo
      return new Date(dateString).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatCreatedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  console.log('AppointmentRequests: Rendering component. Loading:', loading, 'Requests count:', requests.length);

  // Filter requests to show only pending ones and limit based on view
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const displayLimit = isDashboardView ? 3 : maxDisplayItems;
  const displayedRequests = pendingRequests.slice(0, displayLimit);
  const hasMoreRequests = pendingRequests.length > displayLimit;

  if (loading) {
    console.log('AppointmentRequests: Rendering loading state');
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando solicitudes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('AppointmentRequests: Rendering main content with', displayedRequests.length, 'requests');

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <CardTitle className="text-slate-800">
              Solicitudes de Citas
            </CardTitle>
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayedRequests.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay solicitudes de citas pendientes</p>
            <p className="text-sm">Las nuevas solicitudes aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedRequests.map((request) => (
              <div key={request.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {request.patient 
                            ? `${request.patient.first_name} ${request.patient.last_name}` 
                            : 'Paciente Desconocido'
                          }
                        </h4>
                        <p className="text-sm text-slate-600">
                          Solicitud enviada el {formatCreatedDate(request.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(request.preferred_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{request.preferred_time}</span>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center gap-3">
                      <Badge variant="outline" className="text-blue-700 border-blue-200">
                        {getTypeLabel(request.type)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Video className="w-4 h-4" />
                        <span>Incluye reunión virtual</span>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Notas del paciente:</p>
                            <p className="text-sm text-slate-600">{request.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Proof Section */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Receipt className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-700 mb-2">Comprobante de Pago:</p>
                          
                          {request.payment_proof_url ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={
                                      request.payment_status === 'verified' ? 'default' : 
                                      request.payment_status === 'rejected' ? 'destructive' : 
                                      'secondary'
                                    }
                                  >
                                    {request.payment_status === 'verified' ? 'Verificado' : 
                                     request.payment_status === 'rejected' ? 'Rechazado' : 
                                     'Pendiente de revisión'}
                                  </Badge>
                                  {request.payment_amount && (
                                    <span className="text-sm text-slate-600">
                                      Monto: ${request.payment_amount}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(request.payment_proof_url, '_blank')}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Ver comprobante
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                                
                                {request.payment_status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handlePaymentVerification(request.id, 'verified')}
                                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Verificar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handlePaymentVerification(request.id, 'rejected')}
                                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Rechazar
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-600">
                              <p>No se ha subido comprobante de pago</p>
                              <p className="text-xs text-slate-500 mt-1">
                                El paciente debe subir el comprobante antes de aprobar la cita
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestAction(request.id, 'rejected')}
                        disabled={processingId === request.id}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'approved')}
                        disabled={processingId === request.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {processingId === request.id ? "Procesando..." : "Aprobar"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {hasMoreRequests && isDashboardView && (
              <div className="text-center py-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">
                  Mostrando {displayedRequests.length} de {pendingRequests.length} solicitudes pendientes
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <span>Ver todas las solicitudes</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
