
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

export const AdminRedirect = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (user && isAdmin) {
        // Usuario ya autenticado como admin, ir al dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        // No es admin o no está autenticado, ir al login
        navigate('/admin/login', { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  // Mostrar loading mientras se verifica el estado
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando acceso...</p>
      </div>
    </div>
  );
};
