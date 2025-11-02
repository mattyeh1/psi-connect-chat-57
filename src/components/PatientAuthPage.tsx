import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Heart, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createTestPatient } from "@/utils/debugPatient";

interface PatientAuthPageProps {
  registrationOnly?: boolean;
}

export const PatientAuthPage = ({ registrationOnly = false }: PatientAuthPageProps) => {
  const { signIn, signUp, loading, user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(registrationOnly);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    professionalCode: "",
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Attempting sign in with:', { email: signInData.email });

    try {
      const result = await signIn(signInData.email, signInData.password);
      
      console.log('Sign in result:', result);
      
      if (result.error) {
        console.error('Sign in failed:', result.error);
        return;
      }
      
      if (result.data?.user && result.data.user.email_confirmed_at) {
        console.log('Sign in successful, user:', result.data.user.id);
        toast({
          title: "¡Bienvenido!",
          description: "Inicio de sesión exitoso",
        });
        // Redirect to dashboard immediately
        navigate("/dashboard", { replace: true });
      } else if (result.data?.user && !result.data.user.email_confirmed_at) {
        console.log('User email not confirmed');
      } else {
        console.error('No user data received');
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Exception during sign in:', error);
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive"
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(signUpData.email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    try {
      const metadata = {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone,
        professional_code: signUpData.professionalCode
      };

      const result = await signUp(signUpData.email, signUpData.password, 'patient', metadata);

      if (result.error) {
        console.error('Sign up failed:', result.error);
        return;
      }

      console.log('Sign up successful, user:', result.data?.user?.id);
      toast({
        title: "¡Cuenta creada!",
        description: "Revisa tu email para confirmar tu cuenta",
      });

    } catch (error: any) {
      console.error('Exception during sign up:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la cuenta",
        variant: "destructive"
      });
    }
  };

  const handleTestPatient = async () => {
    try {
      console.log('=== CREATING TEST PATIENT ===');
      const result = await createTestPatient();
      
      if (result.error) {
        toast({
          title: "Error",
          description: "No se pudo crear el usuario de prueba",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Test patient created:', result);
      
      const loginResult = await signIn(result.email, result.password);
      
      if (loginResult.error) {
        toast({
          title: "Error",
          description: "No se pudo iniciar sesión con el usuario de prueba",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "¡Usuario de prueba creado!",
        description: `Email: ${result.email} | Password: ${result.password}`,
      });
      
      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
      
    } catch (error: any) {
      console.error('Error creating test patient:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear usuario de prueba",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            {isSignUp ? "Registro de Paciente" : "Iniciar Sesión"}
          </CardTitle>
          <p className="text-slate-600 mt-2">
            {isSignUp ? "Crea tu cuenta de paciente" : "Bienvenido de vuelta"}
          </p>
        </CardHeader>
        <CardContent>
          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    id="email" 
                    type="email" 
                    name="email"
                    placeholder="correo@ejemplo.com" 
                    className="pl-9 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                    value={signInData.email}
                    onChange={handleSignInChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="********"
                    className="pl-9 pr-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                    value={signInData.password}
                    onChange={handleSignInChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg" 
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              
              <Button 
                type="button"
                onClick={handleTestPatient}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg mt-2"
                disabled={loading}
              >
                🧪 Probar como Paciente
              </Button>
              
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  ¿Eres un profesional?{" "}
                  <a
                    href="/auth"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Inicia sesión como profesional
                  </a>
                </p>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-600">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Crear cuenta
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 font-medium">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="María"
                      className="pl-9 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                      value={signUpData.firstName}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 font-medium">Apellido</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="González"
                      className="pl-9 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                      value={signUpData.lastName}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">Teléfono</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+54 11 1234-5678"
                    className="pl-9 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                    value={signUpData.phone}
                    onChange={handleSignUpChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    id="email" 
                    type="email" 
                    name="email"
                    placeholder="correo@ejemplo.com" 
                    className="pl-9 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalCode" className="text-slate-700 font-medium">Código de Profesional</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="professionalCode"
                    type="text"
                    name="professionalCode"
                    placeholder="Ingresa el código de tu profesional"
                    className="pl-9 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                    value={signUpData.professionalCode}
                    onChange={handleSignUpChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="********"
                      className="pl-9 pr-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                      value={signUpData.password}
                      onChange={handleSignUpChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirmar</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="********"
                      className="pl-9 pr-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg" 
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-600">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Iniciar sesión
                  </button>
                </p>
              </div>

              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  ¿Eres un profesional?{" "}
                  <a
                    href="/auth"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Inicia sesión como profesional
                  </a>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

