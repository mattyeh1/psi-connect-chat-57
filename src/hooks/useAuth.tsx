import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userType: 'psychologist' | 'patient', additionalData?: any) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('=== SETTING UP AUTH STATE LISTENER ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // When user confirms email, create their profile automatically
        if (event === 'SIGNED_IN' && session?.user && session.user.user_metadata) {
          console.log('=== SIGNED IN EVENT, HANDLING PROFILE ===');
          setTimeout(async () => {
            await handlePostSignInProfile(session.user);
          }, 100);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== INITIAL SESSION CHECK ===', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePostSignInProfile = async (user: User) => {
    try {
      console.log('=== HANDLING POST SIGN-IN PROFILE ===');
      console.log('User ID:', user.id);
      console.log('User metadata:', user.user_metadata);

      // Check if profile already exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('=== ERROR CHECKING PROFILE ===', profileCheckError);
        return;
      }

      if (existingProfile) {
        console.log('=== PROFILE EXISTS ===', existingProfile);
        
        const userType = existingProfile.user_type || user.user_metadata.user_type;
        
        if (userType === 'psychologist') {
          const { data: existingPsych } = await supabase
            .from('psychologists')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (!existingPsych && user.user_metadata.first_name) {
            console.log('=== CREATING PSYCHOLOGIST FROM METADATA ===');
            const { data: codeData } = await supabase.rpc('generate_professional_code');
            
            if (codeData) {
              const { error: psychError } = await supabase.from('psychologists').insert({
                id: user.id,
                first_name: user.user_metadata.first_name,
                last_name: user.user_metadata.last_name,
                professional_code: codeData,
                phone: user.user_metadata.phone,
                specialization: user.user_metadata.specialization,
                license_number: user.user_metadata.license_number
              });
              
              if (psychError) {
                console.error('=== ERROR CREATING PSYCHOLOGIST ===', psychError);
              } else {
                console.log('=== PSYCHOLOGIST CREATED SUCCESSFULLY ===');
              }
            }
          }
        } else if (userType === 'patient') {
          const { data: existingPatient } = await supabase
            .from('patients')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (!existingPatient && user.user_metadata.first_name && user.user_metadata.professional_code) {
            console.log('=== CREATING PATIENT FROM METADATA ===');
            
            // Validate professional code and get psychologist ID
            const { data: psychologistId, error: validateError } = await supabase.rpc('validate_professional_code', { 
              code: user.user_metadata.professional_code 
            });
            
            if (validateError) {
              console.error('=== ERROR VALIDATING CODE ===', validateError);
              return;
            }
            
            if (psychologistId) {
              console.log('=== CODE VALIDATED, PSYCHOLOGIST ID ===', psychologistId);
              
              const { error: patientError } = await supabase.from('patients').insert({
                id: user.id,
                first_name: user.user_metadata.first_name,
                last_name: user.user_metadata.last_name,
                psychologist_id: psychologistId,
                phone: user.user_metadata.phone,
                age: user.user_metadata.age ? parseInt(user.user_metadata.age.toString()) : null
              });
              
              if (patientError) {
                console.error('=== ERROR CREATING PATIENT ===', patientError);
              } else {
                console.log('=== PATIENT CREATED SUCCESSFULLY ===');
                toast({
                  title: "Registro completado",
                  description: "Tu perfil de paciente ha sido creado exitosamente",
                });
              }
            } else {
              console.error('=== INVALID PROFESSIONAL CODE ===', user.user_metadata.professional_code);
              toast({
                title: "Error",
                description: "Código profesional inválido",
                variant: "destructive"
              });
            }
          }
        }
      } else {
        console.log('=== NO PROFILE EXISTS, CREATING BASE PROFILE ===');
        // Create base profile if it doesn't exist
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            user_type: user.user_metadata.user_type || 'patient'
          });
          
        if (createProfileError) {
          console.error('=== ERROR CREATING BASE PROFILE ===', createProfileError);
        } else {
          console.log('=== BASE PROFILE CREATED ===');
        }
      }
    } catch (error) {
      console.error('=== EXCEPTION IN POST SIGN-IN PROFILE ===', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('=== ATTEMPTING SIGN IN ===', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('=== SIGN IN ERROR ===', error);
      
      if (error.message.includes('Email not confirmed')) {
        toast({
          title: "Email no verificado",
          description: "Tu email aún no ha sido verificado. Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
          variant: "destructive"
        });
      } else if (error.message.includes('Invalid login credentials')) {
        toast({
          title: "Credenciales inválidas",
          description: "El email o la contraseña son incorrectos",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive"
        });
      }
    } else if (data.user) {
      // Verificar si el email está confirmado
      if (!data.user.email_confirmed_at) {
        console.log('=== EMAIL NOT CONFIRMED, SIGNING OUT ===');
        await supabase.auth.signOut();
        toast({
          title: "Email no verificado",
          description: "Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada.",
          variant: "destructive"
        });
        return { data: null, error: { message: "Email not confirmed" } };
      }
      
      console.log('=== SIGN IN SUCCESSFUL ===');
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a ProConnection",
      });
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, userType: 'psychologist' | 'patient', additionalData?: any) => {
    console.log('=== ATTEMPTING SIGN UP ===', email, 'as', userType);
    console.log('Additional data:', additionalData);
    
    try {
      // Crear el usuario primero
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            ...additionalData
          },
          emailRedirectTo: undefined // No redirect automático
        }
      });
      
      if (error) {
        console.error('=== SIGN UP ERROR ===', error);
        toast({
          title: "Error al crear cuenta",
          description: error.message,
          variant: "destructive"
        });
        return { data, error };
      }
      
      console.log('=== USER CREATED SUCCESSFULLY ===', data.user?.id);
      
      if (data.user) {
        // Crear el perfil manualmente si el trigger no funcionó
        try {
          console.log('=== CREATING PROFILE MANUALLY ===');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              user_type: userType
            });
          
          if (profileError) {
            console.log('=== PROFILE CREATION ERROR (MIGHT EXIST) ===', profileError);
          } else {
            console.log('=== PROFILE CREATED SUCCESSFULLY ===');
          }
        } catch (profileCreationError) {
          console.error('=== EXCEPTION CREATING PROFILE ===', profileCreationError);
        }
        
        // Cerrar sesión inmediatamente para evitar auto-login
        await supabase.auth.signOut();
        
        // Enviar SOLO nuestro email personalizado de verificación
        try {
          console.log('=== SENDING CUSTOM VERIFICATION EMAIL ===');
          
          // Crear un token de verificación seguro con información del usuario
          const verificationData = {
            userId: data.user.id,
            email: data.user.email,
            userType: userType,
            firstName: additionalData?.first_name || '',
            timestamp: Date.now()
          };
          
          // Codificar los datos de verificación
          const verificationToken = btoa(JSON.stringify(verificationData));
          
          // Crear URL de verificación con el token
          const redirectUrl = `${window.location.origin}/app?verify=${verificationToken}`;
          
          const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
            body: {
              email: email,
              token: verificationToken,
              action_type: 'signup',
              user_type: userType,
              first_name: additionalData?.first_name || '',
              redirect_to: redirectUrl
            }
          });
          
          if (emailError) {
            console.error('=== ERROR SENDING VERIFICATION EMAIL ===', emailError);
            toast({
              title: "Cuenta creada",
              description: "Tu cuenta fue creada pero hubo un error enviando el email de verificación. Contacta con soporte.",
              variant: "destructive"
            });
          } else {
            console.log('=== VERIFICATION EMAIL SENT SUCCESSFULLY ===');
            toast({
              title: "¡Cuenta creada exitosamente!",
              description: "Te hemos enviado un email de verificación. Por favor revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.",
            });
          }
        } catch (emailError) {
          console.error('=== EXCEPTION SENDING VERIFICATION EMAIL ===', emailError);
          toast({
            title: "Cuenta creada",
            description: "Tu cuenta fue creada pero hubo un error enviando el email de verificación. Contacta con soporte.",
            variant: "destructive"
          });
        }
      }
      
      return { data, error };
    } catch (error: any) {
      console.error('=== EXCEPTION IN SIGN UP ===', error);
      toast({
        title: "Error al crear cuenta",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('=== SIGNING OUT ===');
    
    try {
      // Clear browser storage to prevent auth limbo states
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('=== ERROR DURING SIGN OUT ===', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
