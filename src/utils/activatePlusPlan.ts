import { supabase } from '@/integrations/supabase/client';

/**
 * Activa el plan Plus para el psicólogo actual
 */
export const activatePlusPlan = async () => {
  try {
    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('No se pudo obtener el usuario actual');
    }

    console.log('=== ACTIVATING PLUS PLAN ===');
    console.log('User ID:', user.id);

    // Obtener el perfil del psicólogo
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', user.id)
      .single();

    if (!profile || profile.user_type !== 'psychologist') {
      throw new Error('El usuario no es un psicólogo');
    }

    // Actualizar el plan_type a 'plus'
    const { error: updateError } = await supabase
      .from('psychologists')
      .update({ plan_type: 'plus' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating plan:', updateError);
      throw updateError;
    }

    console.log('✅ Plan Plus activado correctamente');

    // Disparar evento para refrescar las capacidades
    window.dispatchEvent(new CustomEvent('planUpdated'));
    window.dispatchEvent(new CustomEvent('forceRefreshCapabilities'));

    return { success: true, message: 'Plan Plus activado correctamente' };
  } catch (error) {
    console.error('Error activating Plus plan:', error);
    throw error;
  }
};

