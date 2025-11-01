// Utilidad para debuggear usuarios paciente
import { supabase } from '@/integrations/supabase/client';

export const createTestPatient = async () => {
  try {
    // Crear usuario de prueba con tipo 'patient'
    const testEmail = `patient_test_${Date.now()}@proconnection.com`;
    const testPassword = 'test123456';
    
    console.log('=== CREATING TEST PATIENT ===');
    console.log('Email:', testEmail);
    
    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          user_type: 'patient',
          first_name: 'Test',
          last_name: 'Patient'
        }
      }
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return { error: authError };
    }
    
    console.log('Auth user created:', authData.user?.id);
    
    // El perfil se crea automáticamente en useOptimizedProfile
    // cuando el usuario se loguea
    
    return {
      success: true,
      email: testEmail,
      password: testPassword,
      userId: authData.user?.id
    };
    
  } catch (error) {
    console.error('Error in createTestPatient:', error);
    return { error };
  }
};

export const checkPatientProfile = async (userId: string) => {
  try {
    console.log('=== CHECKING PATIENT PROFILE ===');
    console.log('User ID:', userId);
    
    // Verificar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      return { error: profileError };
    }
    
    console.log('Profile found:', profile);
    
    // Verificar datos de paciente
    if (profile.user_type === 'patient') {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (patientError) {
        console.log('No patient data found (this is normal for new patients)');
      } else {
        console.log('Patient data:', patient);
      }
    }
    
    return { profile };
    
  } catch (error) {
    console.error('Error in checkPatientProfile:', error);
    return { error };
  }
};
