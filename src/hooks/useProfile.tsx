
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
  const [profile, setProfile] = useState<Profile | null>(profileCache.profile);
  const [psychologist, setPsychologist] = useState<Psychologist | null>(profileCache.psychologist);
  const [patient, setPatient] = useState<Patient | null>(profileCache.patient);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearCache = () => {
    console.log('=== CLEARING PROFILE CACHE ===');
    profileCache = {
      profile: null,
      psychologist: null,
      patient: null,
      userId: null,
      lastFetch: 0
    };
  };

  const fetchProfile = async (forceRefresh = false) => {
    if (!user) {
      console.log('=== NO USER IN FETCH PROFILE ===');
      setLoading(false);
      return;
    }

    console.log('=== FETCH PROFILE START ===');
    console.log('User ID:', user.id);
    console.log('Force refresh:', forceRefresh);

    // Verificar cache solo si no es force refresh
    const cacheAge = Date.now() - profileCache.lastFetch;
    const isSameUser = profileCache.userId === user.id;
    
    if (!forceRefresh && isSameUser && cacheAge < 30000 && profileCache.profile) {
      console.log('=== USING CACHED PROFILE ===');
      setProfile(profileCache.profile);
      setPsychologist(profileCache.psychologist);
      setPatient(profileCache.patient);
      setLoading(false);
      return;
    }

    try {
      console.log('=== FETCHING FRESH PROFILE ===');
      setLoading(true);
      setError(null);
      
      // Fetch profile - USANDO MAYBLESINGLE PARA EVITAR ERRORES
      console.log('Fetching base profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('=== PROFILE ERROR ===', profileError);
        throw new Error('Error al cargar el perfil base');
      }
      
      if (!profileData) {
        console.warn('=== NO PROFILE FOUND, CREATING ONE ===');
        // Intentar crear el perfil base si no existe
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            user_type: user.user_metadata?.user_type || 'patient'
          })
          .select()
          .single();
          
        if (createError) {
          console.error('=== ERROR CREATING PROFILE ===', createError);
          throw new Error('No se pudo crear el perfil');
        }
        
        console.log('=== PROFILE CREATED ===', newProfile);
        const typedProfile: Profile = {
          ...newProfile,
          user_type: newProfile.user_type as 'psychologist' | 'patient' | 'admin'
        };
        
        // Actualizar estados y cache inmediatamente
        setProfile(typedProfile);
        profileCache.profile = typedProfile;
        profileCache.userId = user.id;
        profileCache.lastFetch = Date.now();
        setLoading(false);
        return;
      }
      
      console.log('=== PROFILE FOUND ===', profileData);
      
      const typedProfile: Profile = {
        ...profileData,
        user_type: profileData.user_type as 'psychologist' | 'patient' | 'admin'
      };

      let psychData = null;
      let patientData = null;

      // Fetch specific role data
      if (typedProfile.user_type === 'psychologist') {
        console.log('=== FETCHING PSYCHOLOGIST DATA ===');
        const { data: psychResult, error: psychError } = await supabase
          .from('psychologists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (psychError) {
          console.error('=== PSYCHOLOGIST ERROR ===', psychError);
          setError('Error al cargar datos del psicólogo');
        } else if (psychResult) {
          console.log('=== PSYCHOLOGIST DATA FOUND ===', psychResult);
          psychData = psychResult;
        } else {
          console.warn('=== NO PSYCHOLOGIST DATA, NEEDS SETUP ===');
          psychData = null;
        }
      } else if (typedProfile.user_type === 'patient') {
        console.log('=== FETCHING PATIENT DATA ===');
        const { data: patientResult, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (patientError) {
          console.error('=== PATIENT ERROR ===', patientError);
          setError('Error al cargar datos del paciente');
        } else if (patientResult) {
          console.log('=== PATIENT DATA FOUND ===', patientResult);
          patientData = patientResult;
        } else {
          console.warn('=== NO PATIENT DATA, NEEDS SETUP ===');
          patientData = null;
        }
      }

      // Actualizar estados inmediatamente
      setProfile(typedProfile);
      setPsychologist(psychData);
      setPatient(patientData);

      // Actualizar cache
      profileCache = {
        profile: typedProfile,
        psychologist: psychData,
        patient: patientData,
        userId: user.id,
        lastFetch: Date.now()
      };

      console.log('=== PROFILE DATA FETCHED AND CACHED SUCCESSFULLY ===');
      console.log('Profile complete:', {
        hasProfile: !!typedProfile,
        hasPsychData: !!psychData,
        hasPatientData: !!patientData,
        psychHasNames: psychData ? !!(psychData.first_name && psychData.last_name) : false,
        patientHasNames: patientData ? !!(patientData.first_name && patientData.last_name) : false
      });

    } catch (error) {
      console.error('=== ERROR IN FETCH PROFILE ===', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== USEPROFILE EFFECT TRIGGERED ===', { 
      userId: user?.id, 
      cachedUserId: profileCache.userId
    });

    if (!user) {
      console.log('=== NO USER, CLEARING STATE ===');
      setProfile(null);
      setPsychologist(null);
      setPatient(null);
      setLoading(false);
      setError(null);
      clearCache();
      return;
    }

    // Si el usuario cambió, limpiar cache
    if (profileCache.userId !== user.id) {
      console.log('=== USER CHANGED, CLEARING CACHE ===');
      clearCache();
      profileCache.userId = user.id;
    }

    fetchProfile();
  }, [user?.id]);

  // Escuchar eventos de actualización de plan
  useEffect(() => {
    const handlePlanUpdate = (event: CustomEvent) => {
      const { psychologistId } = event.detail;
      if (psychologist?.id === psychologistId) {
        console.log('=== PLAN UPDATE EVENT, REFRESHING ===');
        fetchProfile(true);
      }
    };

    const handleAdminPlanUpdate = (event: CustomEvent) => {
      const { psychologistId } = event.detail;
      if (psychologist?.id === psychologistId) {
        console.log('=== ADMIN PLAN UPDATE EVENT, REFRESHING ===');
        fetchProfile(true);
      }
    };

    window.addEventListener('planUpdated', handlePlanUpdate as EventListener);
    window.addEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
    
    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate as EventListener);
      window.removeEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
    };
  }, [psychologist?.id]);

  const createPsychologistProfile = async (data: Omit<Psychologist, 'id' | 'professional_code'>) => {
    if (!user) {
      console.error('=== NO USER FOR PSYCHOLOGIST CREATION ===');
      return { error: 'No user logged in' };
    }

    try {
      setLoading(true);
      console.log('=== CREATING PSYCHOLOGIST PROFILE ===');
      console.log('User ID:', user.id);
      console.log('Profile data:', data);
      
      // First, generate professional code
      console.log('=== GENERATING PROFESSIONAL CODE ===');
      const { data: codeData, error: codeError } = await supabase.rpc('generate_professional_code');
      
      if (codeError) {
        console.error('=== CODE GENERATION ERROR ===', codeError);
        return { error: `Error al generar código profesional: ${codeError.message}` };
      }

      console.log('=== PROFESSIONAL CODE GENERATED ===', codeData);

      // Check if psychologist profile already exists
      const { data: existingPsych, error: checkError } = await supabase
        .from('psychologists')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('=== ERROR CHECKING EXISTING PSYCHOLOGIST ===', checkError);
        return { error: `Error al verificar perfil existente: ${checkError.message}` };
      }

      if (existingPsych) {
        console.log('=== PSYCHOLOGIST ALREADY EXISTS ===', existingPsych);
        // Actualizar estados y cache inmediatamente
        setPsychologist(existingPsych);
        profileCache.psychologist = existingPsych;
        return { data: existingPsych, error: null };
      }

      // Create the psychologist profile
      console.log('=== INSERTING NEW PSYCHOLOGIST ===');
      const psychologistData = {
        id: user.id,
        professional_code: codeData,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
        specialization: data.specialization || null,
        license_number: data.license_number || null
      };

      console.log('=== PSYCHOLOGIST DATA TO INSERT ===', psychologistData);

      const { data: result, error: insertError } = await supabase
        .from('psychologists')
        .insert(psychologistData)
        .select()
        .single();

      if (insertError) {
        console.error('=== PSYCHOLOGIST INSERT ERROR ===', insertError);
        return { error: `Error al crear perfil: ${insertError.message}` };
      }

      console.log('=== PSYCHOLOGIST CREATED SUCCESSFULLY ===', result);

      // Actualizar estados y cache inmediatamente
      setPsychologist(result);
      profileCache.psychologist = result;
      profileCache.lastFetch = Date.now(); // Actualizar timestamp del cache
      
      toast({
        title: "Perfil creado",
        description: "Perfil de psicólogo creado exitosamente",
      });
      
      return { data: result, error: null };
    } catch (error: any) {
      console.error('=== EXCEPTION CREATING PSYCHOLOGIST ===', error);
      const errorMessage = error.message || 'Error inesperado al crear el perfil';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createPatientProfile = async (data: Omit<Patient, 'id'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      console.log('=== CREATING PATIENT PROFILE ===');
      console.log('Patient data:', data);
      
      const { data: result, error } = await supabase
        .from('patients')
        .insert({
          id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) {
        console.error('=== PATIENT CREATION ERROR ===', error);
        return { error: 'No se pudo crear el perfil de paciente' };
      }

      console.log('=== PATIENT CREATED SUCCESSFULLY ===', result);

      // Actualizar estados y cache inmediatamente
      setPatient(result);
      profileCache.patient = result;
      profileCache.lastFetch = Date.now(); // Actualizar timestamp del cache
      
      toast({
        title: "Perfil creado",
        description: "Perfil de paciente creado exitosamente",
      });
      
      return { data: result, error: null };
    } catch (error: any) {
      console.error('=== EXCEPTION CREATING PATIENT ===', error);
      const errorMessage = error.message || 'Error inesperado';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('=== REFETCHING PROFILE ===');
    fetchProfile(true);
  };

  const forceRefresh = () => {
    console.log('=== FORCE REFRESH PROFILE ===');
    clearCache();
    if (user) {
      profileCache.userId = user.id;
      fetchProfile(true);
    }
  };

  return {
    profile,
    psychologist,
    patient,
    loading,
    error,
    createPsychologistProfile,
    createPatientProfile,
    refetch,
    clearCache,
    forceRefresh
  };
};
