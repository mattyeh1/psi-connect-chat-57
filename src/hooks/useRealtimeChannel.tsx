
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeChannelProps {
  channelName: string;
  enabled?: boolean;
  onUpdate?: (payload: any) => void;
  table?: string;
  filter?: string;
  schema?: string;
}

export const useRealtimeChannel = ({
  channelName,
  enabled = true,
  onUpdate,
  table,
  filter,
  schema = 'public'
}: UseRealtimeChannelProps) => {
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const mountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log(`Cleaning up channel: ${channelName}`);
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, [channelName]);

  const setup = useCallback(() => {
    if (!enabled || !table || isSubscribedRef.current || channelRef.current) {
      return;
    }

    console.log(`Setting up realtime channel: ${channelName}`);
    
    try {
      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema,
            table,
            ...(filter && { filter })
          },
          (payload) => {
            if (mountedRef.current && onUpdate) {
              console.log(`Realtime update on ${channelName}:`, payload);
              onUpdate(payload);
            }
          }
        )
        .subscribe((status) => {
          console.log(`Channel ${channelName} status:`, status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            isSubscribedRef.current = false;
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error(`Error setting up channel ${channelName}:`, error);
    }
  }, [channelName, enabled, table, filter, schema, onUpdate]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (enabled) {
      setup();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [enabled, setup, cleanup]);

  return {
    isSubscribed: isSubscribedRef.current,
    cleanup
  };
};
