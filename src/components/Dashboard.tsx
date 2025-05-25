
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MessageCircle, TrendingUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalPatients: number;
  upcomingAppointments: number;
  unreadMessages: number;
  pendingRequests: number;
}

export const Dashboard = () => {
  const { psychologist } = useProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (psychologist?.id) {
      fetchDashboardData();
    }
  }, [psychologist]);

  const fetchDashboardData = async () => {
    if (!psychologist?.id) return;

    try {
      console.log('Fetching dashboard data for psychologist:', psychologist.id);
      
      // Fetch total patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id', { count: 'exact' })
        .eq('psychologist_id', psychologist.id);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
      } else {
        console.log('Found patients:', patientsData?.length || 0);
      }

      // Fetch upcoming appointments
      const currentDate = new Date();
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('psychologist_id', psychologist.id)
        .gte('appointment_date', currentDate.toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted']);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      }

      // Fetch unread messages count using join
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          conversations!inner(psychologist_id)
        `, { count: 'exact' })
        .eq('conversations.psychologist_id', psychologist.id)
        .neq('sender_id', psychologist.id)
        .is('read_at', null);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      // Fetch pending appointment requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('appointment_requests')
        .select('id', { count: 'exact' })
        .eq('psychologist_id', psychologist.id)
        .eq('status', 'pending');

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
      } else {
        console.log('Found pending requests:', requestsData?.length || 0);
      }

      setStats({
        totalPatients: patientsData?.length || 0,
        upcomingAppointments: appointmentsData?.length || 0,
        unreadMessages: messagesData?.length || 0,
        pendingRequests: requestsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Panel de Control</h2>
          <p className="text-slate-600">Resumen de tu práctica profesional</p>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Panel de Control</h2>
        <p className="text-slate-600">Resumen de tu práctica profesional</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Pacientes</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Próximas Citas</p>
                <p className="text-3xl font-bold text-slate-800">{stats.upcomingAppointments}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Mensajes Sin Leer</p>
                <p className="text-3xl font-bold text-slate-800">{stats.unreadMessages}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold text-slate-800">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-4 text-left bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg hover:from-blue-100 hover:to-emerald-100 transition-all duration-200 border border-blue-100">
                <h3 className="font-semibold text-slate-800 mb-1">Programar Nueva Cita</h3>
                <p className="text-sm text-slate-600">Agenda una nueva sesión con tus pacientes</p>
              </button>
              
              <button className="w-full p-4 text-left bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100">
                <h3 className="font-semibold text-slate-800 mb-1">Revisar Mensajes</h3>
                <p className="text-sm text-slate-600">Responde a los mensajes de tus pacientes</p>
              </button>
              
              <button className="w-full p-4 text-left bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg hover:from-emerald-100 hover:to-blue-100 transition-all duration-200 border border-emerald-100">
                <h3 className="font-semibold text-slate-800 mb-1">Ver Pacientes</h3>
                <p className="text-sm text-slate-600">Administra la información de tus pacientes</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5" />
              Resumen Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Sesiones Completadas</span>
                <span className="text-lg font-bold text-emerald-600">0</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Nuevos Pacientes</span>
                <span className="text-lg font-bold text-blue-600">0</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Mensajes Enviados</span>
                <span className="text-lg font-bold text-purple-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
