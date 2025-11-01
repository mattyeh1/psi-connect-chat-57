import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign,
  CalendarCheck,
  Bell
} from "lucide-react";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { usePendingAppointmentRequests } from "@/hooks/usePendingAppointmentRequests";
import { useProfile } from "@/hooks/useProfile";

type ViewType = "dashboard" | "patients" | "calendar" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates" | "accounting" | "documents" | "appointment-requests" | "notifications" | "reminder-settings" | "advanced-reminder-settings" | "notification-dashboard";

interface MobileNavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function MobileNavigation({ currentView, onViewChange }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { psychologist } = useProfile();
  const { receipts } = usePaymentReceipts(psychologist?.id);
  const { pendingCount } = usePendingAppointmentRequests(psychologist?.id);

  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending').length;

  const mainMenuItems = [
    {
      id: "dashboard" as ViewType,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "patients" as ViewType,
      label: "Pacientes",
      icon: Users,
    },
    {
      id: "appointment-requests" as ViewType,
      label: "Solicitudes",
      icon: CalendarCheck,
      badge: pendingCount > 0 ? pendingCount.toString() : undefined
    },
    {
      id: "calendar" as ViewType,
      label: "Calendario",
      icon: Calendar,
    },
    {
      id: "accounting" as ViewType,
      label: "Finanzas",
      icon: DollarSign,
      badge: pendingReceipts > 0 ? pendingReceipts.toString() : undefined
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-white to-slate-50 shadow-xl border-slate-200 hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-white to-slate-50 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10">
                  <img 
                    src="/lovable-uploads/0adde073-8c94-4864-adb4-28526516f9da.png" 
                    alt="ProConnection Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">ProConnection</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-3">
              {mainMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={`w-full justify-start h-14 rounded-xl transition-all duration-200 ${
                    currentView === item.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:shadow-md'
                  }`}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5 mr-4" />
                  <span className="flex-1 text-left font-semibold">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className={`ml-3 px-3 py-1 font-semibold ${
                      currentView === item.id 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200'
                    }`}>
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
