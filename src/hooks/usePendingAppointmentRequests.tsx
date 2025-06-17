
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePendingAppointmentRequests = (psychologistId?: string) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    fetchPendingCount();
  }, [psychologistId]);

  const fetchPendingCount = async () => {
    if (!psychologistId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointment_requests')
        .select('id', { count: 'exact', head: true })
        .eq('psychologist_id', psychologistId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending requests count:', error);
        setPendingCount(0);
      } else {
        setPendingCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error in fetchPendingCount:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  return { pendingCount, loading, refetch: fetchPendingCount };
};
