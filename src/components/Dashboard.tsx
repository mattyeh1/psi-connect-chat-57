
import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Calendar } from './CalendarView';
import { PatientManagement } from './PatientManagement';
import { MessagingHub } from './MessagingHub';
import { DocumentsSection } from './DocumentsSection';
import { SubscriptionPlans } from './SubscriptionPlans';
import { ProfileSetup } from './ProfileSetup';
import { SettingsModal } from './SettingsModal';
import { Sidebar } from './Sidebar';
import { AffiliateSystem } from './AffiliateSystem';

const Dashboard = () => {
  const { profile, psychologist } = useProfile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  if (!profile) {
    return <div>Loading...</div>;
  }

  if (profile.user_type === 'admin') {
    return <div>Admin Dashboard (Not implemented)</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Bienvenido a tu panel de control profesional
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Pacientes Activos</h3>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Citas Esta Semana</h3>
                <p className="text-3xl font-bold text-green-600">8</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Mensajes Nuevos</h3>
                <p className="text-3xl font-bold text-orange-600">3</p>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return <Calendar />;
      case 'patients':
        return <PatientManagement onNavigateToMessages={() => setActiveTab('messaging')} />;
      case 'messaging':
        return <MessagingHub />;
      case 'documents':
        return <DocumentsSection />;
      case 'subscription':
        return <SubscriptionPlans onPlanSelect={() => {}} />;
      case 'affiliates':
        return <AffiliateSystem />;
      case 'profile':
        return <ProfileSetup userType="psychologist" onComplete={() => {}} />;
      case 'settings':
        return <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />;
      default:
        return <div>Página no encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="pl-64">
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
