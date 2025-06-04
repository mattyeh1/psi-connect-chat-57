
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  age?: number;
}

export const useOptimizedPatients = (psychologistId?: string) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (psychologistId) {
      fetchPatients();
    } else {
      setPatients([]);
      setLoading(false);
    }
  }, [psychologistId]);

  const fetchPatients = async () => {
    if (!psychologistId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching patients for psychologist:', psychologistId);

      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, age')
        .eq('psychologist_id', psychologistId)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
        throw new Error('Error loading patients');
      }

      console.log('Patients loaded:', data?.length || 0);
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { patients, loading, error, refetch: fetchPatients };
};
