
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  user_type: 'psychologist' | 'patient' | 'admin';
  created_at: string;
  updated_at: string;
}

interface Psychologist {
  id: string;
  first_name: string;
  last_name: string;
  professional_code: string;
  license_number?: string;
  specialization?: string;
  phone?: string;
  subscription_status?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_end_date?: string;
  plan_type?: string;
  profession_type?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  psychologist_id: string;
  phone?: string;
  age?: number;
  notes?: string;
}

// Cache global simplificado
let profileCache: {
  profile: Profile | null;
  psychologist: Psychologist | null;
  patient: Patient | null;
  userId: string | null;
  lastFetch: number;
} = {
  profile: null,
  psychologist: null,
  patient: null,
  userId: null,
  lastFetch: 0
};

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setPsychologist(null);
      setPatient(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Verificar cache
      const now = Date.now();
      if (profileCache.userId === user.id && (now - profileCache.lastFetch) < 30000) {
        setProfile(profileCache.profile);
        setPsychologist(profileCache.psychologist);
        setPatient(profileCache.patient);
        setLoading(false);
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Error cargando perfil');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch role-specific data
      if (profileData.user_type === 'psychologist') {
        const { data: psychData, error: psychError } = await supabase
          .from('psychologists')
          .select('*')
          .eq('id', user.id)
          .single();

        if (psychError) {
          console.error('Error fetching psychologist:', psychError);
        } else {
          setPsychologist(psychData);
        }
      } else if (profileData.user_type === 'patient') {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .single();

        if (patientError) {
          console.error('Error fetching patient:', patientError);
        } else {
          setPatient(patientData);
        }
      }

      // Update cache
      profileCache = {
        profile: profileData,
        psychologist: profileData.user_type === 'psychologist' ? profileData : null,
        patient: profileData.user_type === 'patient' ? profileData : null,
        userId: user.id,
        lastFetch: now
      };

      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    profileCache.lastFetch = 0; // Invalidate cache
    fetchProfile();
  };

  return {
    profile,
    psychologist,
    patient,
    loading,
    error,
    forceRefresh
  };
};

