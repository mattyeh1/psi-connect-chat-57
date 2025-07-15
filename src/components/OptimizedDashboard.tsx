
import { useState, useEffect } from "react";
import { Calendar, Users, DollarSign, FileText, Settings } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { useOptimizedProfile } from "@/hooks/useOptimizedProfile";
import { useOptimizedPatients } from "@/hooks/useOptimizedPatients";

// Import existing components from the codebase
import { PatientManagement } from "./PatientManagement";
import { DocumentsSection } from "./DocumentsSection";

interface TabConfig {
  value: string;
  label: string;
  icon: any;
  component: React.ReactNode;
}

export const OptimizedDashboard = () => {
  const { profile, psychologist, loading: profileLoading } = useOptimizedProfile();
  const { patients, loading: patientsLoading } = useOptimizedPatients();

  const [activeTab, setActiveTab] = useState("patients");

  useEffect(() => {
    document.title = psychologist?.first_name
      ? `Psicologo: ${psychologist?.first_name} ${psychologist?.last_name}`
      : "Dashboard";
  }, [psychologist]);

  if (profileLoading) {
    return (
      <Card className="w-[380px] animate-pulse">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[80%]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-[60%]" />
        </CardContent>
      </Card>
    );
  }

  const tabConfig = [
    {
      value: "patients",
      label: "Pacientes",
      icon: Users,
      component: <PatientManagement />,
    },
    {
      value: "documents",
      label: "Documentos",
      icon: FileText,
      component: <DocumentsSection />,
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">
          {psychologist?.first_name} {psychologist?.last_name}
        </h2>
        <p className="text-slate-600">
          ¡Bienvenido a tu panel de control, {psychologist?.first_name}! Aquí puedes
          gestionar tus pacientes y documentos.
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full space-y-4">
        <TabsList>
          {tabConfig.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              onClick={() => setActiveTab(tab.value)}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabConfig.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
