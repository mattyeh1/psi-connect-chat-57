
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
        
        // Decode the verification token
        let verificationData;
        try {
          verificationData = JSON.parse(atob(verifyToken));
          console.log('Verification data:', verificationData);
        } catch (e) {
          console.error('Error decoding verification token:', e);
          toast({
            title: "Error de verificación",
            description: "El enlace de verificación no es válido",
            variant: "destructive"
          });
          return;
        }

        // Verify the user's email
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: verifyToken,
          type: 'email'
        });

        if (error) {
          console.error('Email verification error:', error);
          
          // Try alternative verification method
          const { error: updateError } = await supabase.auth.updateUser({
            email: verificationData.email,
            data: { email_verified: true }
          });

          if (updateError) {
            console.error('Alternative verification failed:', updateError);
            toast({
              title: "Error de verificación",
              description: "No se pudo verificar el email. Intenta iniciar sesión normalmente.",
              variant: "destructive"
            });
          } else {
            console.log('Email verified successfully via alternative method');
            toast({
              title: "¡Email verificado!",
              description: "Tu cuenta ha sido verificada exitosamente",
            });
            
            // Remove the verify parameter from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('verify');
            window.history.replaceState({}, '', newUrl.toString());
          }
        } else {
          console.log('Email verified successfully:', data);
          toast({
            title: "¡Email verificado!",
            description: "Tu cuenta ha sido verificada exitosamente",
          });
          
          // Remove the verify parameter from URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('verify');
          window.history.replaceState({}, '', newUrl.toString());
        }

      } catch (error) {
        console.error('Error processing email verification:', error);
        toast({
          title: "Error de verificación",
          description: "Ocurrió un error al verificar tu email",
          variant: "destructive"
        });
      }
    };

    handleEmailVerification();
  }, [searchParams]);
};
