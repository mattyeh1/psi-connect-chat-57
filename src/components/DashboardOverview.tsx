
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Users, Bell, Activity } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProfile } from "@/hooks/useProfile";

export const DashboardOverview = () => {
  const { psychologist, patient, profile } = useProfile();
  const { todayAppointments, activePatients, unreadMessages, loading: statsLoading } = useDashboardStats();

  if (profile?.user_type === 'psychologist') {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Activity className="w-5 h-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-slate-600">Cargando estado...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Citas programadas hoy</span>
                  </div>
                  <span className="font-semibold text-slate-800">{todayAppointments}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Pacientes activos</span>
                  </div>
                  <span className="font-semibold text-slate-800">{activePatients}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Mensajes sin leer</span>
                  </div>
                  <span className="font-semibold text-slate-800">{unreadMessages}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Patient view - simplified
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Bell className="w-5 h-5" />
          Tu Resumen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2">Bienvenido, {patient?.first_name}</h3>
            <p className="text-slate-600 text-sm">Tu espacio personal de consultas psicológicas</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-700">Próxima cita</span>
              </div>
              <span className="text-sm font-medium text-slate-800">Pendiente</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">Mensajes</span>
              </div>
              <span className="text-sm font-medium text-slate-800">2 nuevos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
