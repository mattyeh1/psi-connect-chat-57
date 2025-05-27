
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

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

  useEffect(() => {
    if (!psychologist?.id) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    fetchStats();
  }, [psychologist?.id]);

  const fetchStats = async () => {
    if (!psychologist?.id) return;

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Get today's start and end
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Fetch today's appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('psychologist_id', psychologist.id)
        .gte('appointment_date', startOfDay.toISOString())
        .lt('appointment_date', endOfDay.toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted']);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      // Fetch active patients count
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id')
        .eq('psychologist_id', psychologist.id);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        throw patientsError;
      }

      // Fetch unread messages
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id')
        .eq('psychologist_id', psychologist.id);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }

      let unreadCount = 0;
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        
        const { data: unreadMessages, error: messagesError } = await supabase
          .from('messages')
          .select('id')
          .in('conversation_id', conversationIds)
          .neq('sender_id', psychologist.id)
          .is('read_at', null);

        if (messagesError) {
          console.error('Error fetching unread messages:', messagesError);
        } else {
          unreadCount = unreadMessages?.length || 0;
        }
      }

      setStats({
        todayAppointments: appointments?.length || 0,
        activePatients: patients?.length || 0,
        unreadMessages: unreadCount,
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
