
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Users, Database, Settings, Activity } from 'lucide-react';
import { AdminPanel } from '@/components/AdminPanel';

export const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header de Administración */}
      <header className="bg-white shadow-lg border-b border-purple-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PsiConnect Admin
                </h1>
                <p className="text-gray-600 text-sm">Sistema de Administración Central</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  Administrador del Sistema
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-purple-200 hover:bg-purple-50"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación secundaria */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-purple-600 border-b-2 border-purple-600 pb-3">
              <Users className="w-4 h-4" />
              <span className="font-medium">Gestión de Usuarios</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 pb-3">
              <Database className="w-4 h-4" />
              <span>Base de Datos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 pb-3">
              <Activity className="w-4 h-4" />
              <span>Estadísticas</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 pb-3">
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="p-6">
        <AdminPanel />
      </main>
    </div>
  );
};
