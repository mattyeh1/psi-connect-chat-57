
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseAvailableSlotsProps {
  psychologistId: string;
  selectedDate: string;
}

export const useAvailableSlots = ({ psychologistId, selectedDate }: UseAvailableSlotsProps) => {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  useEffect(() => {
    if (psychologistId && selectedDate) {
      fetchBookedSlots();
    }
  }, [psychologistId, selectedDate]);

  const fetchBookedSlots = async () => {
    try {
      setLoading(true);
      console.log('Fetching booked slots for:', { psychologistId, selectedDate });

      // Create date range for the selected date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('psychologist_id', psychologistId)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted']);

      if (error) {
        console.error('Error fetching booked slots:', error);
        return;
      }

      const bookedTimes = (data || []).map(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      });

      console.log('Booked slots:', bookedTimes);
      setBookedSlots(bookedTimes);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSlotAvailable = (time: string) => {
    return !bookedSlots.includes(time);
  };

  const getAvailableSlots = () => {
    return timeSlots.filter(slot => isSlotAvailable(slot));
  };

  return {
    timeSlots,
    bookedSlots,
    loading,
    isSlotAvailable,
    getAvailableSlots,
    refreshAvailability: fetchBookedSlots
  };
};
