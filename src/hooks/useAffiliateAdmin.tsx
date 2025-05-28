
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface AffiliateStats {
  id: string;
  first_name: string;
  last_name: string;
  professional_code: string;
  total_referrals: number;
  affiliate_earnings: number;
  affiliate_code: string;
  commission_rate: number;
  discount_rate: number;
  active_referrals: number;
  pending_payments: number;
  paid_amount: number;
}

interface AffiliatePayment {
  id: string;
  psychologist_id: string;
  amount: number;
  status: string;
  payment_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  psychologist: {
    first_name: string;
    last_name: string;
    professional_code: string;
  };
}

export const useAffiliateAdmin = () => {
  const { user } = useAuth();
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats[]>([]);
  const [pendingPayments, setPendingPayments] = useState<AffiliatePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAndFetch();
    }
  }, [user]);

  const checkAdminAndFetch = async () => {
    try {
      const { data: adminCheck } = await supabase
        .rpc('is_admin_user', { user_id: user?.id });

      if (adminCheck) {
        setIsAdmin(true);
        await Promise.all([
          fetchAffiliateStats(),
          fetchPendingPayments()
        ]);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_admin_stats')
        .select('*')
        .order('total_referrals', { ascending: false });

      if (error) throw error;
      setAffiliateStats(data || []);
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_payments')
        .select(`
          *,
          psychologist:psychologists(first_name, last_name, professional_code)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingPayments(data || []);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const approvePayment = async (paymentId: string, paymentMethod: string, paymentReference?: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_payments')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString(),
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Pago aprobado",
        description: "El pago de comisión ha sido marcado como pagado",
      });

      await Promise.all([
        fetchAffiliateStats(),
        fetchPendingPayments()
      ]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar el pago",
        variant: "destructive"
      });
    }
  };

  const processSubscriptionCommission = async (psychologistId: string, amount: number) => {
    try {
      const { error } = await supabase
        .rpc('process_affiliate_commission', {
          referred_psychologist_id: psychologistId,
          subscription_amount: amount
        });

      if (error) throw error;

      toast({
        title: "Comisión procesada",
        description: "Se ha calculado y registrado la comisión de afiliado",
      });

      await Promise.all([
        fetchAffiliateStats(),
        fetchPendingPayments()
      ]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la comisión",
        variant: "destructive"
      });
    }
  };

  return {
    affiliateStats,
    pendingPayments,
    loading,
    isAdmin,
    approvePayment,
    processSubscriptionCommission,
    refetch: checkAdminAndFetch
  };
};
