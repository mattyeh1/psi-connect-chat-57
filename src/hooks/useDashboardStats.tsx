
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useRealtimeChannel } from './useRealtimeChannel';

interface DashboardStats {
  todayAppointments: number;
  activePatients: number;
  unreadMessages: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const { psychologist } = useProfile();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activePatients: 0,
    unreadMessages: 0,
    loading: true,
    error: null
  });

  // Usar realtime solo si está habilitado y no hay errores persistentes
  const { isDisabled } = useRealtimeChannel({
    channelName: `dashboard-messages-${psychologist?.id}`,
    enabled: !!psychologist?.id && !stats.error,
    table: 'messages',
    onUpdate: () => {
      if (psychologist?.id) {
        fetchUnreadMessages();
      }
    }
  });

  useEffect(() => {
    if (!psychologist?.id) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    fetchStats();
    
    // Si realtime está deshabilitado, configurar polling como fallback
    if (isDisabled) {
      const interval = setInterval(() => {
        fetchStats();
      }, 30000); // Polling cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [psychologist?.id, isDisabled]);

  const fetchUnreadMessages = async () => {
    if (!psychologist?.id) return;

    try {
      const { data: unreadMessages, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          conversations!inner(
            psychologist_id
          )
        `)
        .eq('conversations.psychologist_id', psychologist.id)
        .neq('sender_id', psychologist.id)
        .is('read_at', null);

      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }

      const unreadCount = unreadMessages?.length || 0;

      setStats(prev => ({
        ...prev,
        unreadMessages: unreadCount
      }));

    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const fetchStats = async () => {
    if (!psychologist?.id) return;

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Usar Promise.allSettled para manejar errores individualmente
      const [appointmentsResult, patientsResult, messagesResult] = await Promise.allSettled([
        supabase
          .from('appointments')
          .select('id')
          .eq('psychologist_id', psychologist.id)
          .gte('appointment_date', startOfDay.toISOString())
          .lt('appointment_date', endOfDay.toISOString())
          .in('status', ['scheduled', 'confirmed', 'accepted']),
        
        supabase
          .from('patients')
          .select('id')
          .eq('psychologist_id', psychologist.id),
        
        supabase
          .from('messages')
          .select(`
            id,
            conversation_id,
            conversations!inner(
              psychologist_id
            )
          `)
          .eq('conversations.psychologist_id', psychologist.id)
          .neq('sender_id', psychologist.id)
          .is('read_at', null)
      ]);

      const todayAppointments = appointmentsResult.status === 'fulfilled' 
        ? (appointmentsResult.value.data?.length || 0) 
        : 0;

      const activePatients = patientsResult.status === 'fulfilled' 
        ? (patientsResult.value.data?.length || 0) 
        : 0;

      const unreadMessages = messagesResult.status === 'fulfilled' 
        ? (messagesResult.value.data?.length || 0) 
        : 0;

      setStats({
        todayAppointments,
        activePatients,
        unreadMessages,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  };

  return stats;
};
