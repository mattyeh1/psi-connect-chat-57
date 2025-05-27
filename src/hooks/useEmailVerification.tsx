
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

        // Since we're using custom verification emails, we'll directly update the user's email_verified status
        // instead of trying to use Supabase's OTP verification which expects a different token format
        console.log('Attempting to verify email for user:', verificationData.userId);
        
        // Try to sign in the user first to get a session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          // If no session, we need to tell the user to login first
          toast({
            title: "Verificación pendiente",
            description: "Por favor inicia sesión para completar la verificación de tu email",
            variant: "default"
          });
          
          // Remove the verify parameter from URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('verify');
          window.history.replaceState({}, '', newUrl.toString());
          return;
        }

        // Check if the token is for the current user
        if (sessionData.session.user.id !== verificationData.userId) {
          toast({
            title: "Error de verificación",
            description: "Este enlace de verificación no corresponde al usuario actual",
            variant: "destructive"
          });
          return;
        }

        // Update the user's metadata to mark email as verified
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            email_verified: true,
            verification_completed_at: new Date().toISOString()
          }
        });

        if (updateError) {
          console.error('Error updating user verification status:', updateError);
          toast({
            title: "Error de verificación",
            description: "No se pudo completar la verificación. Intenta más tarde.",
            variant: "destructive"
          });
        } else {
          console.log('Email verified successfully for user:', verificationData.userId);
          toast({
            title: "¡Email verificado!",
            description: `¡Hola ${verificationData.firstName}! Tu cuenta ha sido verificada exitosamente`,
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
