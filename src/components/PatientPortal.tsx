
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle, FileText, Clock, Plus } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

export const PatientPortal = () => {
  const { patient } = useProfile();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({
    nextAppointment: null as any,
    unreadMessages: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patient) {
      fetchPatientData();
    }
  }, [patient]);

  const fetchPatientData = async () => {
    if (!patient) return;

    try {
      // Fetch upcoming appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true });

      setAppointments(appointmentsData || []);

      // Fetch recent messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setMessages(messagesData || []);

      // Calculate stats
      const nextAppointment = appointmentsData && appointmentsData.length > 0 ? appointmentsData[0] : null;
      const unreadMessages = messagesData ? messagesData.filter(msg => !msg.read_at).length : 0;

      // Fetch total completed sessions
      const { data: completedSessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('patient_id', patient.id)
        .eq('status', 'completed');

      setStats({
        nextAppointment,
        unreadMessages,
        totalSessions: completedSessions?.length || 0
      });

    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) {
    return <div>Cargando...</div>;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Portal del Paciente</h2>
        <p className="text-slate-600">Bienvenida, {patient.first_name} {patient.last_name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Próxima Cita</p>
                {stats.nextAppointment ? (
                  <>
                    <p className="text-2xl font-bold text-slate-800">
                      {new Date(stats.nextAppointment.appointment_date).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(stats.nextAppointment.appointment_date).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-800">--</p>
                    <p className="text-sm text-slate-600">Sin citas programadas</p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Mensajes Nuevos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.unreadMessages}</p>
                <p className="text-sm text-slate-600">Sin leer</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Sesiones Realizadas</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalSessions}</p>
                <p className="text-sm text-slate-600">Total</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5" />
              Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.slice(0, 3).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {new Date(appointment.appointment_date).getDate()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 capitalize">{appointment.type}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(appointment.appointment_date).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {appointment.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === "confirmed" 
                        ? "bg-green-100 text-green-700" 
                        : appointment.status === "scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {appointment.status === "confirmed" ? "Confirmada" : 
                       appointment.status === "scheduled" ? "Programada" : "Pendiente"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes citas programadas</p>
                  <p className="text-sm">Contacta a tu psicólogo para agendar una nueva cita</p>
                </div>
              )}
              <button className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Solicitar nueva cita
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MessageCircle className="w-5 h-5" />
              Mensajes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-slate-800 text-sm">Tu psicólogo</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">
                          {new Date(message.created_at).toLocaleDateString('es-ES')}
                        </p>
                        {!message.read_at && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{message.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes mensajes</p>
                  <p className="text-sm">Aquí aparecerán los mensajes de tu psicólogo</p>
                </div>
              )}
              <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Ver todos los mensajes
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents - Simplified for now since we don't have a documents table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5" />
            Documentos y Formularios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay documentos disponibles</p>
            <p className="text-sm">Los documentos y formularios aparecerán aquí cuando tu psicólogo los comparta</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
