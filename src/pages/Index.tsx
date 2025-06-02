
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { PatientManagement } from "@/components/PatientManagement";
import { Calendar } from "@/components/CalendarView";
import { MessagingHub } from "@/components/MessagingHub";
import { AffiliateSystem } from "@/components/AffiliateSystem";
import { SeoProfileManager } from "@/components/SeoProfileManager";
import { AdvancedReports } from "@/components/AdvancedReports";
import { PrioritySupport } from "@/components/PrioritySupport";
import { EarlyAccess } from "@/components/EarlyAccess";
import { VisibilityConsulting } from "@/components/VisibilityConsulting";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { PatientPortal } from "@/components/PatientPortal";
import { LandingPage } from "@/pages/LandingPage";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PsychologistRatesManager } from "@/components/PsychologistRatesManager";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates";

// Type declaration for window debug property
declare global {
  interface Window {
    debugAppState?: {
      authLoading: boolean;
      profileLoading: boolean;
      user: boolean;
      profile: boolean;
      psychologist: boolean;
      patient: boolean;
      profileError: string | null;
    };
  }
}

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { profile, psychologist, patient, loading: profileLoading, error: profileError, forceRefresh } = useProfile();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const navigate = useNavigate();

  // Manejar verificación de email desde URL
  useEmailVerification();

  // Enhanced logging for debugging
  useEffect(() => {
    console.log('=== INDEX DETAILED STATE DEBUG ===', {
      timestamp: new Date().toISOString(),
      authLoading,
      profileLoading,
      hasUser: !!user,
      userId: user?.id,
      hasProfile: !!profile,
      profileUserType: profile?.user_type,
      hasPsychologist: !!psychologist,
      psychologistId: psychologist?.id,
      psychologistNames: psychologist ? `${psychologist.first_name} ${psychologist.last_name}` : 'N/A',
      hasPatient: !!patient,
      patientId: patient?.id,
      profileError,
      // Detailed loading state analysis
      shouldShowLoading: authLoading,
      shouldShowProfileLoading: !authLoading && user && profileLoading,
      shouldShowLanding: !authLoading && !user,
      shouldShowError: !authLoading && !!profileError,
      shouldShowProfileWait: !authLoading && !profileLoading && user && !profile && !profileError,
      shouldShowApp: !authLoading && !profileLoading && !!profile,
    });

    // Add debug info to window for browser console inspection with proper typing
    if (typeof window !== 'undefined') {
      window.debugAppState = {
        authLoading,
        profileLoading,
        user: !!user,
        profile: !!profile,
        psychologist: !!psychologist,
        patient: !!patient,
        profileError
      };
    }
  }, [user, authLoading, profile, psychologist, patient, profileLoading, profileError]);

  useEffect(() => {
    // Verificar si el trial ha expirado usando la función de Supabase
    const checkTrialStatus = async () => {
      if (psychologist?.id) {
        try {
          console.log('=== CHECKING TRIAL STATUS ===', { psychologistId: psychologist.id });
          
          const { data: isExpired, error } = await supabase.rpc('is_trial_expired', {
            psychologist_id: psychologist.id
          });

          if (error) {
            console.error('Error checking trial status:', error);
            return;
          }

          const hasExpiredStatus = psychologist.subscription_status === 'expired' || 
                                 psychologist.subscription_status === 'cancelled';

          console.log('=== TRIAL STATUS RESULT ===', {
            isExpired,
            hasExpiredStatus,
            subscriptionStatus: psychologist.subscription_status,
            shouldShowModal: isExpired || hasExpiredStatus
          });

          if (isExpired || hasExpiredStatus) {
            console.log('Trial expired, showing modal');
            setShowTrialModal(true);
          }
        } catch (error) {
          console.error('Error in trial status check:', error);
        }
      }
    };

    if (psychologist) {
      checkTrialStatus();
    }
  }, [psychologist]);

  // Debug component to show current state
  const DebugPanel = () => (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Debug State</span>
        <button onClick={() => setDebugMode(false)} className="text-red-400">×</button>
      </div>
      <div className="space-y-1">
        <div>Auth Loading: {authLoading ? '✓' : '✗'}</div>
        <div>Profile Loading: {profileLoading ? '✓' : '✗'}</div>
        <div>Has User: {user ? '✓' : '✗'}</div>
        <div>Has Profile: {profile ? '✓' : '✗'}</div>
        <div>Profile Type: {profile?.user_type || 'N/A'}</div>
        <div>Has Psychologist: {psychologist ? '✓' : '✗'}</div>
        <div>Has Patient: {patient ? '✓' : '✗'}</div>
        <div>Profile Error: {profileError || 'None'}</div>
        <div className="pt-2 border-t border-gray-600">
          <button 
            onClick={forceRefresh}
            className="bg-blue-600 px-2 py-1 rounded text-xs"
          >
            Force Refresh
          </button>
        </div>
      </div>
    </div>
  );

  // SIMPLIFY LOADING STATE - Only show auth loading if truly authenticating
  if (authLoading) {
    console.log('=== SHOWING AUTH LOADING ===');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
          <button 
            onClick={() => setDebugMode(true)}
            className="mt-4 text-xs text-blue-600 underline"
          >
            Mostrar debug
          </button>
        </div>
        {debugMode && <DebugPanel />}
      </div>
    );
  }

  // Si no hay usuario después de auth, mostrar landing
  if (!user) {
    console.log('=== SHOWING LANDING PAGE (NO USER) ===');
    return <LandingPage />;
  }

  // Profile loading only when we have user but loading profile
  if (profileLoading) {
    console.log('=== SHOWING PROFILE LOADING ===');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil del usuario...</p>
          <button 
            onClick={() => setDebugMode(true)}
            className="mt-4 text-xs text-blue-600 underline"
          >
            Mostrar debug
          </button>
        </div>
        {debugMode && <DebugPanel />}
      </div>
    );
  }

  // Si hay error de perfil
  if (profileError) {
    console.log('=== SHOWING PROFILE ERROR ===', profileError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Error al cargar el perfil
            </h2>
            <p className="text-red-600 mb-4">
              {profileError}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={forceRefresh}
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                Reintentar
              </Button>
              <button 
                onClick={() => setDebugMode(true)}
                className="text-xs text-blue-600 underline"
              >
                Mostrar debug
              </button>
            </div>
          </div>
        </div>
        {debugMode && <DebugPanel />}
      </div>
    );
  }

  // Si hay usuario pero no hay perfil después de cargar
  if (!profile) {
    console.log('=== NO PROFILE FOUND - WAITING OR SETUP NEEDED ===');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-yellow-700 mb-2">
              Configurando tu perfil...
            </h2>
            <p className="text-yellow-600 mb-4">
              Tu cuenta está siendo configurada. Este proceso puede tomar unos segundos.
            </p>
            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="space-y-2">
              <Button 
                onClick={() => forceRefresh()}
                className="bg-yellow-600 hover:bg-yellow-700 w-full"
              >
                Recargar perfil
              </Button>
              <button 
                onClick={() => setDebugMode(true)}
                className="text-xs text-blue-600 underline"
              >
                Mostrar debug
              </button>
            </div>
          </div>
        </div>
        {debugMode && <DebugPanel />}
      </div>
    );
  }

  // TENEMOS PROFILE - Renderizar según tipo de usuario
  console.log('=== PROFILE FOUND - RENDERING APP ===', { 
    userType: profile.user_type,
    profileId: profile.id,
    hasPsychologist: !!psychologist,
    hasPatient: !!patient 
  });

  // Patient portal
  if (profile.user_type === 'patient') {
    console.log('=== RENDERING PATIENT PORTAL ===');
    return (
      <>
        <PatientPortal />
        {debugMode && <DebugPanel />}
      </>
    );
  }

  // Admin redirect
  if (profile.user_type === 'admin') {
    console.log('=== REDIRECTING ADMIN TO ADMIN DASHBOARD ===');
    navigate('/admin/dashboard');
    return null;
  }

  // Psychologist dashboard
  if (profile.user_type === 'psychologist') {
    console.log('=== RENDERING PSYCHOLOGIST DASHBOARD ===', {
      psychologistId: psychologist?.id,
      psychologistName: psychologist ? `${psychologist.first_name} ${psychologist.last_name}` : 'Loading psychologist data...'
    });

    const renderCurrentView = () => {
      switch (currentView) {
        case "dashboard":
          return <Dashboard onViewChange={setCurrentView} />;
        case "patients":
          return <PatientManagement />;
        case "calendar":
          return <Calendar />;
        case "messages":
          return <MessagingHub />;
        case "affiliates":
          return <AffiliateSystem />;
        case "seo":
          return <SeoProfileManager />;
        case "reports":
          return <AdvancedReports />;
        case "support":
          return <PrioritySupport />;
        case "early-access":
          return <EarlyAccess />;
        case "visibility":
          return <VisibilityConsulting />;
        case "rates":
          return <PsychologistRatesManager />;
        default:
          return <Dashboard onViewChange={setCurrentView} />;
      }
    };

    return (
      <>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
            <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="ml-auto flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {psychologist?.first_name || 'Cargando...'} {psychologist?.last_name || ''}
                  </span>
                  <button 
                    onClick={() => setDebugMode(!debugMode)}
                    className="text-xs text-blue-600 underline"
                  >
                    Debug
                  </button>
                </div>
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4">
                {renderCurrentView()}
              </div>
            </SidebarInset>
            {showTrialModal && (
              <TrialExpiredModal onUpgrade={() => setShowTrialModal(false)} />
            )}
          </div>
        </SidebarProvider>
        {debugMode && <DebugPanel />}
      </>
    );
  }

  // FALLBACK FINAL - esto indica un problema
  console.error('=== UNEXPECTED FALLBACK REACHED ===', {
    hasUser: !!user,
    hasProfile: !!profile,
    userType: profile?.user_type,
    authLoading,
    profileLoading,
    profileError
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-orange-700 mb-2">
            Estado inesperado detectado
          </h2>
          <p className="text-orange-600 mb-4">
            La aplicación está en un estado no manejado. Tipo de usuario: {profile?.user_type || 'desconocido'}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 w-full"
            >
              Recargar página completa
            </Button>
            <Button 
              onClick={forceRefresh}
              variant="outline"
              className="w-full"
            >
              Refrescar perfil
            </Button>
            <button 
              onClick={() => setDebugMode(true)}
              className="text-xs text-blue-600 underline"
            >
              Mostrar debug
            </button>
          </div>
        </div>
      </div>
      {debugMode && <DebugPanel />}
    </div>
  );
}
