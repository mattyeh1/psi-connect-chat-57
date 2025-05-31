
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface PatientAppointmentRequestFormProps {
  onRequestCreated: () => void;
}

export const PatientAppointmentRequestForm = ({ onRequestCreated }: PatientAppointmentRequestFormProps) => {
  const { patient } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    type: "",
    notes: ""
  });

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== CREATING APPOINTMENT REQUEST ===');
    console.log('Patient data:', patient);
    console.log('Form data:', formData);
    
    if (!patient?.psychologist_id) {
      console.error('No psychologist_id found for patient:', patient);
      toast({
        title: "Error",
        description: "No se pudo identificar al psicólogo asignado",
        variant: "destructive"
      });
      return;
    }

    if (!formData.preferredDate || !formData.preferredTime || !formData.type) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Asegurar que la fecha se mantenga en formato local sin conversión a UTC
      const requestData = {
        patient_id: patient.id,
        psychologist_id: patient.psychologist_id,
        preferred_date: formData.preferredDate, // Mantener como string de fecha local
        preferred_time: formData.preferredTime,
        type: formData.type,
        status: 'pending',
        notes: formData.notes || null
      };

      console.log('Creating appointment request with data:', requestData);
      console.log('Patient ID:', patient.id);
      console.log('Psychologist ID:', patient.psychologist_id);
      console.log('Selected date (local):', formData.preferredDate);

      const { data: insertedData, error: requestError } = await supabase
        .from('appointment_requests')
        .insert(requestData)
        .select()
        .single();

      if (requestError) {
        console.error('Error creating appointment request:', requestError);
        console.error('Request error details:', {
          code: requestError.code,
          message: requestError.message,
          details: requestError.details,
          hint: requestError.hint
        });
        throw new Error('Error al enviar la solicitud de cita: ' + requestError.message);
      }

      console.log('✅ Appointment request created successfully:', insertedData);

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cita ha sido enviada al psicólogo para su aprobación"
      });

      // Resetear formulario
      setFormData({
        preferredDate: "",
        preferredTime: "",
        type: "",
        notes: ""
      });
      
      onRequestCreated();

    } catch (error) {
      console.error('Error creating appointment request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: "Terapia Individual",
      couple: "Terapia de Pareja",
      family: "Terapia Familiar",
      evaluation: "Evaluación",
      follow_up: "Seguimiento"
    };
    return labels[type] || type;
  };

  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return "";
    
    // Crear fecha directamente del string sin conversión UTC
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!patient?.psychologist_id) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>No tienes un psicólogo asignado. Contacta al administrador.</p>
        <p className="text-sm mt-2">
          Debug: Patient ID: {patient?.id || 'N/A'}, Psychologist ID: {patient?.psychologist_id || 'N/A'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Solicitar Cita</h2>
        <p className="text-sm text-slate-600">Envía una solicitud de cita a tu psicólogo</p>
        <p className="text-xs text-slate-500 mt-1">
          Tu psicólogo: {patient.psychologist_id}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferredDate">Fecha preferida *</Label>
          <input
            id="preferredDate"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
            min={getMinDate()}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {formData.preferredDate && (
            <p className="text-sm text-slate-600">
              Fecha seleccionada: {formatSelectedDate(formData.preferredDate)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredTime">Hora preferida *</Label>
          <Select 
            value={formData.preferredTime} 
            onValueChange={(value) => setFormData({...formData, preferredTime: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una hora" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {time}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de consulta *</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({...formData, type: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">
                {getTypeLabel("individual")}
              </SelectItem>
              <SelectItem value="couple">
                {getTypeLabel("couple")}
              </SelectItem>
              <SelectItem value="family">
                {getTypeLabel("family")}
              </SelectItem>
              <SelectItem value="evaluation">
                {getTypeLabel("evaluation")}
              </SelectItem>
              <SelectItem value="follow_up">
                {getTypeLabel("follow_up")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas adicionales (opcional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Describe brevemente el motivo de la consulta o cualquier información relevante..."
            className="min-h-[80px]"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-emerald-500"
        >
          {loading ? "Enviando solicitud..." : "Enviar Solicitud"}
        </Button>
      </form>
    </div>
  );
};
