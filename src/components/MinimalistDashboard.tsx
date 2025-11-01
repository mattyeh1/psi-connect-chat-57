import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Plus,
  Eye,
  TrendingUp,
  UserCheck,
  CalendarCheck,
  Bell
} from "lucide-react";
import { useUnifiedDashboardStats } from "@/hooks/useUnifiedDashboardStats";
import { useProfile } from "@/hooks/useProfile";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { usePendingAppointmentRequests } from "@/hooks/usePendingAppointmentRequests";
import { useDashboardStats } from "@/hooks/useDashboardStats";

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  onClick: () => void;
  variant?: "default" | "urgent" | "success";
}

const QuickAction = ({ icon, title, description, count, onClick, variant = "default" }: QuickActionProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "urgent":
        return "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 shadow-orange-100";
      case "success":
        return "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 shadow-emerald-100";
      default:
        return "border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 shadow-slate-100";
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-md ${getVariantStyles()}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <div className="text-white">
                {icon}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base mb-1">{title}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {count !== undefined && count > 0 && (
              <Badge variant="secondary" className="text-sm font-semibold px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-md">
                {count}
              </Badge>
            )}
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon, trend, color = "warm", onClick }: StatCardProps) => {
  const getColorStyles = () => {
    switch (color) {
      case "emerald":
        return "text-emerald-600 bg-gradient-to-br from-emerald-100 to-green-100";
      case "amber":
        return "text-amber-600 bg-gradient-to-br from-amber-100 to-orange-100";
      case "stone":
        return "text-slate-600 bg-gradient-to-br from-slate-100 to-gray-100";
      case "warm":
      default:
        return "text-blue-600 bg-gradient-to-br from-blue-100 to-indigo-100";
    }
  };

  return (
    <Card 
      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            {trend && (
              <p className="text-xs text-slate-500 font-medium">{trend}</p>
            )}
          </div>
          <div className={`w-16 h-16 ${getColorStyles()} rounded-2xl flex items-center justify-center shadow-lg`}>
            <div className="text-2xl">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MinimalistDashboardProps {
  onNavigate?: (view: string) => void;
}

export const MinimalistDashboard = ({ onNavigate }: MinimalistDashboardProps) => {
  const { psychologist } = useProfile();
  const unifiedStats = useUnifiedDashboardStats(psychologist?.id);
  const { receipts } = usePaymentReceipts(psychologist?.id);
  const { pendingCount } = usePendingAppointmentRequests(psychologist?.id);
  const { todayAppointments, activePatients } = useDashboardStats();

  // Calculate financial metrics
  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending').length;
  const approvedReceipts = receipts.filter(r => r.validation_status === 'approved').length;
  const monthlyIncome = receipts.filter(r => {
    const receiptDate = new Date(r.receipt_date || r.created_at);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return receiptDate.getMonth() === currentMonth && 
           receiptDate.getFullYear() === currentYear && 
           r.validation_status === 'approved';
  }).reduce((sum, receipt) => sum + (receipt.amount || 0), 0);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getSubscriptionStatus = () => {
    if (!psychologist) return { status: 'Cargando...', color: 'text-stone-600' };
    
    const now = new Date();
    const trialEnd = psychologist.trial_end_date ? new Date(psychologist.trial_end_date) : null;
    
    if (psychologist.subscription_status === 'trial' && trialEnd && trialEnd > now) {
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: `${daysLeft} días de trial`,
        color: 'text-amber-600'
      };
    } else if (psychologist.subscription_status === 'active') {
      return {
        status: 'Suscripción activa',
        color: 'text-emerald-600'
      };
    } else {
      return {
        status: 'Suscripción inactiva',
        color: 'text-red-600'
      };
    }
  };

  const subscriptionInfo = getSubscriptionStatus();

  return (
    <div className="space-y-8 p-6">
      {/* Header mejorado */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            <span className="text-slate-800">{getGreeting()}, </span>
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shine">
                {unifiedStats.psychologistName || 'Profesional'}
              </span>
            </span>
          </h1>
          <p className="text-slate-600 text-lg font-medium">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 font-semibold">
            {(unifiedStats.planType || psychologist?.plan_type || 'Plus').toUpperCase()}
          </Badge>
          <Badge variant="secondary" className={`text-sm px-4 py-2 font-semibold ${subscriptionInfo.color}`}>
            {subscriptionInfo.status}
          </Badge>
        </div>
      </div>

      {/* Acciones rápidas - Tareas de HOY */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-800">Tareas de hoy</h2>
          <Badge variant="secondary" className="text-sm px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-0 font-semibold">
            {todayAppointments + pendingCount} pendientes
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickAction
            icon={<Calendar className="w-6 h-6" />}
            title="Citas de hoy"
            description={`${todayAppointments} programadas`}
            count={todayAppointments}
            onClick={() => onNavigate?.('calendar')}
            variant={todayAppointments > 0 ? "default" : "success"}
          />
          
          <QuickAction
            icon={<CalendarCheck className="w-6 h-6" />}
            title="Solicitudes de cita"
            description="Esperando aprobación"
            count={pendingCount}
            onClick={() => onNavigate?.('appointment-requests')}
            variant={pendingCount > 0 ? "urgent" : "success"}
          />
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-800">Resumen general</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pacientes activos"
            value={activePatients}
            icon={<Users className="w-8 h-8" />}
            color="emerald"
            onClick={() => onNavigate?.('patients')}
          />
          
          <StatCard
            title="Ingresos del mes"
            value={`$${monthlyIncome.toLocaleString()}`}
            icon={<DollarSign className="w-8 h-8" />}
            color="warm"
            trend="Comprobantes aprobados"
            onClick={() => onNavigate?.('accounting')}
          />
          
          <StatCard
            title="Comprobantes pendientes"
            value={pendingReceipts}
            icon={<Clock className="w-8 h-8" />}
            color="amber"
            onClick={() => onNavigate?.('accounting')}
          />
          
          <StatCard
            title="Comprobantes aprobados"
            value={approvedReceipts}
            icon={<CheckCircle className="w-8 h-8" />}
            color="emerald"
            onClick={() => onNavigate?.('accounting')}
          />
        </div>
      </div>

      {/* Acciones secundarias */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión rápida</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAction
            icon={<Plus className="w-6 h-6" />}
            title="Nuevo paciente"
            description="Agregar paciente"
            onClick={() => onNavigate?.('patients')}
          />
          
          <QuickAction
            icon={<Calendar className="w-6 h-6" />}
            title="Programar cita"
            description="Crear nueva cita"
            onClick={() => onNavigate?.('calendar')}
          />
          
          <QuickAction
            icon={<Eye className="w-6 h-6" />}
            title="Ver pacientes"
            description="Lista completa"
            onClick={() => onNavigate?.('patients')}
          />
          
          <QuickAction
            icon={<TrendingUp className="w-6 h-6" />}
            title="Reportes"
            description="Análisis y estadísticas"
            onClick={() => onNavigate?.('reports')}
          />
        </div>
      </div>

      {/* Estado del sistema - Solo si hay información importante */}
      {(pendingReceipts > 0 || pendingCount > 0) && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-orange-800 text-lg font-bold">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              Atención requerida
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {pendingCount > 0 && (
                <div 
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => onNavigate?.('appointment-requests')}
                >
                  <span className="text-orange-700 font-medium">Solicitudes de cita pendientes</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 px-3 py-1 font-semibold">
                    {pendingCount}
                  </Badge>
                </div>
              )}
              {pendingReceipts > 0 && (
                <div 
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => onNavigate?.('accounting')}
                >
                  <span className="text-orange-700 font-medium">Comprobantes pendientes</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 px-3 py-1 font-semibold">
                    {pendingReceipts}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
