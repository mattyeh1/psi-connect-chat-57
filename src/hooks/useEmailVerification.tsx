
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useEmailVerification = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailVerification = async () => {
      const verifyToken = searchParams.get('verify');
      
      if (!verifyToken) return;

      try {
        console.log('Processing email verification token:', verifyToken);
        
        // Limpiar URL inmediatamente para evitar re-procesamiento
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('verify');
        window.history.replaceState({}, '', newUrl.toString());
        
        // Decodificar el token de verificación
        let verificationData;
        try {
          verificationData = JSON.parse(atob(verifyToken));
          console.log('Verification data:', verificationData);
        } catch (e) {
          console.error('Error decoding verification token:', e);
          toast({
            title: "Enlace inválido",
            description: "El enlace de verificación no es válido o está corrupto",
            variant: "destructive"
          });
          return;
        }

        // Verificar que el token no sea muy antiguo (24 horas)
        const tokenAge = Date.now() - verificationData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        
        if (tokenAge > maxAge) {
          console.error('Verification token expired');
          toast({
            title: "Enlace expirado",
            description: "El enlace de verificación ha expirado. Solicita uno nuevo registrándote nuevamente.",
            variant: "destructive"
          });
          return;
        }

        // Verificar directamente en la base de datos usando el admin client
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email_confirmed_at')
          .eq('id', verificationData.userId)
          .single();

        if (userError) {
          console.error('Error checking user:', userError);
          // Intentar actualizar los metadatos del usuario directamente
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            verificationData.userId,
            { 
              email_confirm: true,
              user_metadata: {
                email_verified: true,
                verification_completed_at: new Date().toISOString()
              }
            }
          );

          if (updateError) {
            console.error('Error updating user verification:', updateError);
            toast({
              title: "Error de verificación",
              description: "No se pudo completar la verificación. Intenta iniciar sesión normalmente.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "¡Email verificado!",
              description: `¡Hola ${verificationData.firstName || ''}! Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.`,
            });
          }
        } else {
          toast({
            title: "¡Email verificado!",
            description: `¡Hola ${verificationData.firstName || ''}! Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.`,
          });
        }

      } catch (error) {
        console.error('Error processing email verification:', error);
        toast({
          title: "Error de verificación",
          description: "Ocurrió un error al verificar tu email. Intenta iniciar sesión normalmente.",
          variant: "destructive"
        });
      }
    };

    handleEmailVerification();
  }, [searchParams]);
};
