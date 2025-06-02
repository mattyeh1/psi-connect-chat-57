
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

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { profile, psychologist, patient, loading: profileLoading, error: profileError, forceRefresh } = useProfile();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const navigate = useNavigate();

  // Manejar verificación de email desde URL
  useEmailVerification();

  useEffect(() => {
    console.log('=== INDEX EFFECT ===', { 
      authLoading, 
      user: !!user, 
      profile: !!profile,
      psychologist: !!psychologist,
      patient: !!patient,
      profileLoading,
      profileError 
    });

    // Verificar si el trial ha expirado usando la función de Supabase
    const checkTrialStatus = async () => {
      if (psychologist?.id) {
        try {
          const { data: isExpired, error } = await supabase.rpc('is_trial_expired', {
            psychologist_id: psychologist.id
          });

          if (error) {
            console.error('Error checking trial status:', error);
            return;
          }

          const hasExpiredStatus = psychologist.subscription_status === 'expired' || 
                                 psychologist.subscription_status === 'cancelled';

          if (isExpired || hasExpiredStatus) {
            console.log('Trial expired, showing modal:', { isExpired, hasExpiredStatus, subscription_status: psychologist.subscription_status });
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
  }, [user, authLoading, navigate, psychologist, profile, profileError]);

  // Mostrar loading mientras se cargan auth y profile
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar la landing page
  if (!user) {
    return <LandingPage />;
  }

  // Si hay error de perfil
  if (profileError) {
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
            <Button 
              onClick={forceRefresh}
              className="bg-red-600 hover:bg-red-700"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si hay usuario pero no hay perfil, esperar un poco más o forzar refresh
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-yellow-700 mb-2">
              Configurando tu perfil...
            </h2>
            <p className="text-yellow-600 mb-4">
              Estamos preparando tu cuenta. Esto debería tomar solo unos segundos.
            </p>
            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Button 
              onClick={() => forceRefresh()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Recargar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // SI HAY PERFIL, IR DIRECTO A LA APP PRINCIPAL
  if (profile) {
    // Patient portal
    if (profile.user_type === 'patient') {
      return <PatientPortal />;
    }

    // Psychologist dashboard - USAR SIDEBAR RESPONSIVO
    if (profile.user_type === 'psychologist') {
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
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
            <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="ml-auto flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {psychologist?.first_name} {psychologist?.last_name}
                  </span>
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
      );
    }
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-blue-700 mb-2">
            Cargando aplicación...
          </h2>
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
