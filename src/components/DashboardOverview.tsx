
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Users, FileText, Clock, Bell } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProfile } from "@/hooks/useProfile";
import { MeetingLinksCard } from "./MeetingLinksCard";
import { TrialStatus } from "./TrialStatus";
import { ProfessionalCodeDisplay } from "./ProfessionalCodeDisplay";

export const DashboardOverview = () => {
  const { psychologist, patient, profile } = useProfile();
  const { todayAppointments, activePatients, unreadMessages, loading: statsLoading } = useDashboardStats();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (profile?.user_type === 'psychologist') {
    return (
      <div className="space-y-6">
        {/* Trial Status for Psychologists */}
        {psychologist && <TrialStatus />}
        
        {/* Professional Code Display */}
        {psychologist && psychologist.professional_code && (
          <ProfessionalCodeDisplay code={psychologist.professional_code} />
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Bienvenido, {psychologist?.first_name}
          </h1>
          <p className="text-slate-600">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  todayAppointments
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments === 0 ? 'No hay citas programadas' : 'Citas programadas hoy'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  activePatients
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {activePatients === 0 ? 'No hay pacientes registrados' : 'Pacientes en seguimiento'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes Nuevos</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  unreadMessages
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {unreadMessages === 0 ? 'No hay mensajes pendientes' : 'Mensajes sin leer'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Meeting Links */}
        <MeetingLinksCard />

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-slate-600">Cargando actividad...</span>
                </div>
              ) : (
                <>
                  {todayAppointments > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Citas programadas para hoy</p>
                        <p className="text-xs text-slate-600">{todayAppointments} cita(s) pendiente(s)</p>
                      </div>
                    </div>
                  )}
                  {unreadMessages > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Mensajes pendientes</p>
                        <p className="text-xs text-slate-600">{unreadMessages} mensaje(s) sin leer</p>
                      </div>
                    </div>
                  )}
                  {activePatients > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Pacientes activos</p>
                        <p className="text-xs text-slate-600">{activePatients} paciente(s) en seguimiento</p>
                      </div>
                    </div>
                  )}
                  {todayAppointments === 0 && unreadMessages === 0 && activePatients === 0 && (
                    <div className="text-center p-8 text-slate-500">
                      <p>No hay actividad reciente</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Patient view
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Bienvenido, {patient?.first_name}
        </h1>
        <p className="text-slate-600">
          {formatDate(currentTime)} • {formatTime(currentTime)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Hoy 3:00 PM</div>
            <p className="text-xs text-muted-foreground">
              Con tu psicólogo
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">2 nuevos</div>
            <p className="text-xs text-muted-foreground">
              De tu psicólogo
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">3 documentos</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para revisar
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
