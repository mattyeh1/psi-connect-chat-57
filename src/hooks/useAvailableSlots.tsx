
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

  // Función para validar si es un UUID válido
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  useEffect(() => {
    // Validar que tenemos los datos necesarios y que el UUID es válido
    if (psychologistId && psychologistId.trim() !== '' && selectedDate && isValidUUID(psychologistId)) {
      fetchBookedSlots();
    } else {
      console.log('Invalid psychologistId or selectedDate:', { 
        psychologistId, 
        selectedDate, 
        isValidUUID: psychologistId ? isValidUUID(psychologistId) : false 
      });
      setBookedSlots([]);
      setLoading(false);
    }
  }, [psychologistId, selectedDate]);

  const fetchBookedSlots = async () => {
    // Validación adicional antes de hacer la consulta
    if (!psychologistId || psychologistId.trim() === '' || !selectedDate || !isValidUUID(psychologistId)) {
      console.log('Invalid parameters for fetchBookedSlots:', { 
        psychologistId, 
        selectedDate,
        isValidUUID: psychologistId ? isValidUUID(psychologistId) : false
      });
      setBookedSlots([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching booked slots for:', { psychologistId, selectedDate });

      // Create date range for the selected date in local timezone
      const selectedDay = new Date(selectedDate + 'T00:00:00');
      const startOfDay = new Date(selectedDay);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDay);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('Date range for query:', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      });

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('psychologist_id', psychologistId)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted']);

      if (error) {
        console.error('Error fetching booked slots:', error);
        setBookedSlots([]);
        return;
      }

      const bookedTimes = (data || []).map(apt => {
        const aptDate = new Date(apt.appointment_date);
        const timeString = aptDate.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        console.log('Booked appointment:', {
          original: apt.appointment_date,
          parsed: aptDate.toISOString(),
          timeString
        });
        return timeString;
      });

      console.log('Final booked slots:', bookedTimes);
      setBookedSlots(bookedTimes);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const isSlotAvailable = (time: string) => {
    const isBooked = bookedSlots.includes(time);
    console.log(`Checking slot ${time}: booked=${isBooked}`);
    return !isBooked;
  };

  const getAvailableSlots = () => {
    const available = timeSlots.filter(slot => isSlotAvailable(slot));
    console.log('Available slots:', available);
    console.log('Booked slots:', bookedSlots);
    return available;
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
