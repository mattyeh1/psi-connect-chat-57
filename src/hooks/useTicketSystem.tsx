
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  psychologist_id: string;
  title: string;
  description: string;
  type: 'technical' | 'feature' | 'billing' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  response_time?: number;
  resolved_at?: string;
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
}

export const useTicketSystem = () => {
  const { psychologist } = useProfile();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!psychologist?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Simular datos de tickets por ahora (implementar tabla real después)
      const mockTickets: SupportTicket[] = [
        {
          id: 'SP-001',
          psychologist_id: psychologist.id,
          title: 'Problema con sincronización de calendario',
          description: 'El calendario no se actualiza correctamente cuando agrego nuevas citas.',
          type: 'technical',
          priority: 'high',
          status: 'resolved',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          response_time: 15,
          resolved_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'SP-002',
          psychologist_id: psychologist.id,
          title: 'Consulta sobre reportes avanzados',
          description: 'Me gustaría saber cómo interpretar las métricas de satisfacción en los reportes.',
          type: 'general',
          priority: 'medium',
          status: 'in_progress',
          created_at: '2024-01-20T14:00:00Z',
          updated_at: '2024-01-20T14:08:00Z',
          response_time: 8
        }
      ];

      setTickets(mockTickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: {
    title: string;
    description: string;
    type: SupportTicket['type'];
    priority: SupportTicket['priority'];
  }) => {
    if (!psychologist?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setSubmitting(true);
      
      // Simular creación de ticket
      const newTicket: SupportTicket = {
        id: `SP-${Date.now()}`,
        psychologist_id: psychologist.id,
        title: ticketData.title,
        description: ticketData.description,
        type: ticketData.type,
        priority: ticketData.priority,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTickets(prev => [newTicket, ...prev]);
      
      toast({
        title: "Ticket creado",
        description: "Tu solicitud ha sido enviada. Te responderemos pronto.",
      });

      return { data: newTicket, error: null };
    } catch (err) {
      console.error('Error creating ticket:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear ticket';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { data: null, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [psychologist?.id]);

  return {
    tickets,
    loading,
    submitting,
    error,
    createTicket,
    refetch: fetchTickets
  };
};
