
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedStats {
  // Profile info
  psychologistName: string;
  planType: string;
  subscriptionStatus: string;
  
  // Dashboard stats
  todayAppointments: number;
  activePatients: number;
  unreadMessages: number;
  
  // Loading states
  profileLoading: boolean;
  statsLoading: boolean;
  error: string | null;
}

export const useUnifiedDashboardStats = (psychologistId?: string) => {
  const [stats, setStats] = useState<UnifiedStats>({
    psychologistName: '',
    planType: '',
    subscriptionStatus: '',
    todayAppointments: 0,
    activePatients: 0,
    unreadMessages: 0,
    profileLoading: true,
    statsLoading: true,
    error: null
  });

  useEffect(() => {
    if (!psychologistId) {
      setStats(prev => ({ 
        ...prev, 
        profileLoading: false, 
        statsLoading: false 
      }));
      return;
    }

    fetchUnifiedStats();
  }, [psychologistId]);

  const fetchUnifiedStats = async () => {
    if (!psychologistId) return;

    try {
      console.log('Fetching unified stats for psychologist:', psychologistId);
      
      // First, get psychologist basic info (fast query)
      const { data: psychData, error: psychError } = await supabase
        .from('psychologists')
        .select('first_name, last_name, plan_type, subscription_status')
        .eq('id', psychologistId)
        .single();

      if (psychError) {
        console.error('Error fetching psychologist info:', psychError);
      } else {
        setStats(prev => ({
          ...prev,
          psychologistName: `${psychData.first_name} ${psychData.last_name}`,
          planType: psychData.plan_type || 'plus',
          subscriptionStatus: psychData.subscription_status || 'trial',
          profileLoading: false
        }));
      }

      // Then fetch stats in the background (can be slower)
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Parallel queries for stats
      const [appointmentsResult, patientsResult, conversationsResult] = await Promise.allSettled([
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('psychologist_id', psychologistId)
          .gte('appointment_date', startOfDay.toISOString())
          .lt('appointment_date', endOfDay.toISOString())
          .in('status', ['scheduled', 'confirmed', 'accepted']),
        
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('psychologist_id', psychologistId),
        
        supabase
          .from('conversations')
          .select('id')
          .eq('psychologist_id', psychologistId)
      ]);

      let todayAppointments = 0;
      let activePatients = 0;
      let unreadMessages = 0;

      if (appointmentsResult.status === 'fulfilled' && !appointmentsResult.value.error) {
        todayAppointments = appointmentsResult.value.count || 0;
      }

      if (patientsResult.status === 'fulfilled' && !patientsResult.value.error) {
        activePatients = patientsResult.value.count || 0;
      }

      if (conversationsResult.status === 'fulfilled' && !conversationsResult.value.error) {
        const conversations = conversationsResult.value.data || [];
        if (conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id);
          
          const { data: unreadMessagesData } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .neq('sender_id', psychologistId)
            .is('read_at', null);

          unreadMessages = unreadMessagesData?.count || 0;
        }
      }

      setStats(prev => ({
        ...prev,
        todayAppointments,
        activePatients,
        unreadMessages,
        statsLoading: false,
        error: null
      }));

      console.log('Unified stats loaded successfully');

    } catch (error) {
      console.error('Error fetching unified stats:', error);
      setStats(prev => ({
        ...prev,
        statsLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  return { ...stats, refetch: fetchUnifiedStats };
};
