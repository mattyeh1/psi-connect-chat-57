
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  AlertCircle,
  DollarSign,
  Settings
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { AppointmentRequests } from "./AppointmentRequests";
import { TrialStatus } from "./TrialStatus";
import { PlanBadge } from "./PlanBadge";
import { useProfile } from "@/hooks/useProfile";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates";

interface DashboardProps {
  onViewChange: (view: ViewType) => void;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const { psychologist } = useProfile();
  const { stats, loading } = useDashboardStats();

  const quickActions = [
    {
      title: "Gestionar Pacientes",
      description: "Ver y organizar pacientes",
      icon: Users,
      action: () => onViewChange("patients"),
      color: "bg-blue-500"
    },
    {
      title: "Ver Calendario",
      description: "Revisar citas programadas",
      icon: Calendar,
      action: () => onViewChange("calendar"),
      color: "bg-emerald-500"
    },
    {
      title: "Mensajes",
      description: "Comunicación con pacientes",
      icon: MessageSquare,
      action: () => onViewChange("messages"),
      color: "bg-purple-500"
    },
    {
      title: "Configurar Tarifas",
      description: "Gestionar precios por consulta",
      icon: DollarSign,
      action: () => onViewChange("rates"),
      color: "bg-emerald-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard Profesional
          </h1>
          <p className="text-slate-600">
            Bienvenido, {psychologist?.first_name} {psychologist?.last_name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PlanBadge />
          <TrialStatus />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pacientes Activos</p>
                <p className="text-3xl font-bold text-slate-800">
                  {loading ? "..." : stats.totalPatients}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Citas este Mes</p>
                <p className="text-3xl font-bold text-slate-800">
                  {loading ? "..." : stats.appointmentsThisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Mensajes No Leídos</p>
                <p className="text-3xl font-bold text-slate-800">
                  {loading ? "..." : stats.unreadMessages}
                </p>
                {stats.unreadMessages > 0 && (
                  <Badge variant="destructive" className="mt-1">
                    Requieren atención
                  </Badge>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tasa de Respuesta</p>
                <p className="text-3xl font-bold text-slate-800">
                  {loading ? "..." : `${stats.responseRate}%`}
                </p>
                <Badge variant="secondary" className="mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Promedio semanal
                </Badge>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Settings className="w-5 h-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left flex flex-col items-start gap-2 hover:bg-slate-50"
                onClick={action.action}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{action.title}</p>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Requests */}
      <AppointmentRequests isDashboardView={true} />

      {/* Upcoming Appointments */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Calendar className="w-5 h-5" />
            Próximas Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.upcomingAppointments?.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingAppointments.slice(0, 3).map((appointment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">
                      {appointment.patient_name || 'Paciente'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(appointment.appointment_date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-200">
                    {appointment.type || 'Consulta'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tienes citas programadas próximamente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
