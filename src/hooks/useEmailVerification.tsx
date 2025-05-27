
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
        
        // Decodificar el token de verificación
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
          
          // Limpiar URL incluso en error
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('verify');
          window.history.replaceState({}, '', newUrl.toString());
          return;
        }

        // Verificar que el token no sea muy antiguo (24 horas)
        const tokenAge = Date.now() - verificationData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        
        if (tokenAge > maxAge) {
          console.error('Verification token expired');
          toast({
            title: "Enlace expirado",
            description: "El enlace de verificación ha expirado. Solicita uno nuevo.",
            variant: "destructive"
          });
          
          // Limpiar URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('verify');
          window.history.replaceState({}, '', newUrl.toString());
          return;
        }

        // Intentar obtener sesión actual primero
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          // Si no hay sesión activa, mostrar mensaje para que inicie sesión
          toast({
            title: "Verificación pendiente",
            description: "Por favor inicia sesión para completar la verificación de tu email",
            variant: "default"
          });
          
          // Limpiar parámetro verify de la URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('verify');
          window.history.replaceState({}, '', newUrl.toString());
          return;
        }

        // Verificar que el usuario de la sesión coincida con el del token
        if (sessionData.session.user.id !== verificationData.userId) {
          console.error('Token user ID does not match session user ID');
          toast({
            title: "Error de verificación", 
            description: "El enlace de verificación no corresponde al usuario actual",
            variant: "destructive"
          });
          
          // Limpiar URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('verify');
          window.history.replaceState({}, '', newUrl.toString());
          return;
        }

        // Actualizar los metadatos del usuario para marcar el email como verificado
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
            description: `¡Hola ${verificationData.firstName || ''}! Tu cuenta ha sido verificada exitosamente`,
          });
        }

        // Limpiar el parámetro verify de la URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('verify');
        window.history.replaceState({}, '', newUrl.toString());

      } catch (error) {
        console.error('Error processing email verification:', error);
        toast({
          title: "Error de verificación",
          description: "Ocurrió un error al verificar tu email. Intenta iniciar sesión normalmente.",
          variant: "destructive"
        });
        
        // Limpiar URL incluso en error
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('verify');
        window.history.replaceState({}, '', newUrl.toString());
      }
    };

    handleEmailVerification();
  }, [searchParams]);
};
