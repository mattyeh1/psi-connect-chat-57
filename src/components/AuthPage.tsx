import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthPageProps {
  affiliateCode?: string | null;
}

export const AuthPage = ({ affiliateCode }: AuthPageProps) => {
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
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
    userType: "patient",
    firstName: "",
    lastName: "",
    phone: "",
    licenseNumber: "",
    specialization: "",
    professionalCode: ""
  });

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    if (isSignUp && signUpData.userType === 'patient' && !signUpData.professionalCode) {
      toast({
        title: "Error", 
        description: "El código profesional es requerido para pacientes",
        variant: "destructive"
      });
      return;
    }

    try {
      let metadata: any = {
        user_type: signUpData.userType,
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone
      };

      // Add affiliate code to metadata if present
      if (affiliateCode) {
        metadata.affiliate_code = affiliateCode;
      }

      if (signUpData.userType === 'psychologist') {
        metadata = {
          ...metadata,
          license_number: signUpData.licenseNumber,
          specialization: signUpData.specialization
        };
      } else if (signUpData.userType === 'patient') {
        metadata = {
          ...metadata,
          professional_code: signUpData.professionalCode
        };
      }

      const result = await signUp(signUpData.email, signUpData.password, metadata);
      
      if (result?.user) {
        toast({
          title: "Cuenta creada",
          description: "Tu cuenta ha sido creada exitosamente. Revisa tu email para verificar tu cuenta.",
        });
      }
    } catch (error: any) {
      console.error('Error during sign up:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la cuenta",
        variant: "destructive"
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signIn(signInData.email, signInData.password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a PsiConnect",
      });
      navigate("/app");
    } catch (error: any) {
      console.error('Error during sign in:', error);
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center">
          {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={isSignUp ? "register" : "login"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" onClick={() => setIsSignUp(false)}>Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register" onClick={() => setIsSignUp(true)}>Crear Cuenta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                  <Input 
                    id="email" 
                    type="email" 
                    name="email"
                    placeholder="correo@ejemplo.com" 
                    className="pl-9"
                    value={signInData.email}
                    onChange={handleSignInChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="********"
                    className="pl-9"
                    value={signInData.password}
                    onChange={handleSignInChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="María"
                      className="pl-9"
                      value={signUpData.firstName}
                      onChange={handleSignUpChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="González"
                      className="pl-9"
                      value={signUpData.lastName}
                      onChange={handleSignUpChange}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-9"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+56912345678"
                    className="pl-9"
                    value={signUpData.phone}
                    onChange={handleSignUpChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="********"
                    className="pl-9"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="********"
                    className="pl-9"
                    value={signUpData.confirmPassword}
                    onChange={handleSignUpChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Usuario</Label>
                <select
                  id="userType"
                  name="userType"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                  value={signUpData.userType}
                  onChange={handleSignUpChange}
                >
                  <option value="patient">Paciente</option>
                  <option value="psychologist">Psicólogo</option>
                </select>
              </div>
              {signUpData.userType === "psychologist" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Número de Licencia</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                      <Input
                        id="licenseNumber"
                        type="text"
                        name="licenseNumber"
                        placeholder="Ej: 123456"
                        className="pl-9"
                        value={signUpData.licenseNumber}
                        onChange={handleSignUpChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Especialización</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                      <Input
                        id="specialization"
                        type="text"
                        name="specialization"
                        placeholder="Ej: Psicología Clínica"
                        className="pl-9"
                        value={signUpData.specialization}
                        onChange={handleSignUpChange}
                      />
                    </div>
                  </div>
                </>
              )}
              {signUpData.userType === "patient" && (
                <div className="space-y-2">
                  <Label htmlFor="professionalCode">Código Profesional</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                      id="professionalCode"
                      type="text"
                      name="professionalCode"
                      placeholder="Ingresa el código de tu psicólogo"
                      className="pl-9"
                      value={signUpData.professionalCode}
                      onChange={handleSignUpChange}
                    />
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
