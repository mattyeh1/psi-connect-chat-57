
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

interface PlanCapabilities {
  seo_profile: boolean;
  advanced_reports: boolean;
  early_access: boolean;
  priority_support: boolean;
  visibility_consulting: boolean;
  basic_features: boolean;
}

export const usePlanCapabilities = () => {
  const { psychologist } = useProfile();
  const [capabilities, setCapabilities] = useState<PlanCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCapabilities = async () => {
      if (!psychologist?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('=== FETCHING PLAN CAPABILITIES ===');
        console.log('Psychologist ID:', psychologist.id);
        
        const { data, error } = await supabase.rpc('get_plan_capabilities', {
          psychologist_id: psychologist.id
        });

        if (error) {
          console.error('Error fetching plan capabilities:', error);
          throw error;
        }

        console.log('Plan capabilities:', data);
        
        // Validación segura del JSON con conversión a PlanCapabilities
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const planData = data as Record<string, unknown>;
          const validCapabilities: PlanCapabilities = {
            seo_profile: Boolean(planData.seo_profile),
            advanced_reports: Boolean(planData.advanced_reports),
            early_access: Boolean(planData.early_access),
            priority_support: Boolean(planData.priority_support),
            visibility_consulting: Boolean(planData.visibility_consulting),
            basic_features: Boolean(planData.basic_features)
          };
          setCapabilities(validCapabilities);
        } else {
          setCapabilities({
            seo_profile: false,
            advanced_reports: false,
            early_access: false,
            priority_support: false,
            visibility_consulting: false,
            basic_features: false
          });
        }
      } catch (err) {
        console.error('Error in fetchCapabilities:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCapabilities();
  }, [psychologist?.id]);

  const hasCapability = (capability: keyof PlanCapabilities): boolean => {
    return capabilities?.[capability] ?? false;
  };

  const isPlusUser = () => {
    return capabilities?.basic_features && !capabilities?.seo_profile;
  };

  const isProUser = () => {
    return capabilities?.seo_profile && capabilities?.advanced_reports;
  };

  return {
    capabilities,
    loading,
    error,
    hasCapability,
    isPlusUser,
    isProUser
  };
};
