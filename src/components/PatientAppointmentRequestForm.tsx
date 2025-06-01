
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, DollarSign, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { usePsychologistRates } from "@/hooks/usePsychologistRates";
import { PaymentProofUploader } from "./PaymentProofUploader";

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
    notes: "",
    paymentProofUrl: "",
    paymentAmount: 0
  });

  // Cargar tarifas del psicólogo
  const { rates, loading: ratesLoading } = usePsychologistRates(patient?.psychologist_id);

  // Verificar disponibilidad de horarios
  const {
    loading: slotsLoading,
    isSlotAvailable,
    getAvailableSlots,
    bookedSlots
  } = useAvailableSlots({
    psychologistId: patient?.psychologist_id || "",
    selectedDate: formData.preferredDate
  });

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Obtener solo los horarios disponibles
  const availableTimeSlots = getAvailableSlots();

  // Obtener tarifa para el tipo de consulta seleccionado
  const selectedRate = rates.find(rate => rate.session_type === formData.type);

  // Actualizar monto cuando se selecciona tipo de consulta
  useEffect(() => {
    if (selectedRate) {
      setFormData(prev => ({ ...prev, paymentAmount: selectedRate.price }));
    }
  }, [selectedRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient?.psychologist_id) {
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

    // Verificar que se haya subido comprobante para tipos que requieren pago
    if (selectedRate && !formData.paymentProofUrl) {
      toast({
        title: "Comprobante requerido",
        description: "Debes subir un comprobante de pago para continuar",
        variant: "destructive"
      });
      return;
    }

    // Verificar disponibilidad antes de enviar
    if (!isSlotAvailable(formData.preferredTime)) {
      toast({
        title: "Horario no disponible",
        description: "Este horario ya no está disponible. Por favor selecciona otro.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        patient_id: patient.id,
        psychologist_id: patient.psychologist_id,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        type: formData.type,
        status: 'pending',
        notes: formData.notes || null,
        payment_proof_url: formData.paymentProofUrl || null,
        payment_amount: formData.paymentAmount || null,
        payment_status: formData.paymentProofUrl ? 'pending' : null
      };

      const { data: insertedData, error: requestError } = await supabase
        .from('appointment_requests')
        .insert(requestData)
        .select()
        .single();

      if (requestError) {
        throw new Error('Error al enviar la solicitud de cita: ' + requestError.message);
      }

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cita ha sido enviada al psicólogo para su aprobación"
      });

      // Resetear formulario
      setFormData({
        preferredDate: "",
        preferredTime: "",
        type: "",
        notes: "",
        paymentProofUrl: "",
        paymentAmount: 0
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
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Solicitar Cita</h2>
        <p className="text-sm text-slate-600">Envía una solicitud de cita a tu psicólogo</p>
      </div>

      {/* Mostrar tarifas disponibles */}
      {!ratesLoading && rates.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <DollarSign className="w-5 h-5" />
              Tarifas por Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-slate-700">
                    {getTypeLabel(rate.session_type)}
                  </span>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                    {rate.price} {rate.currency}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Fecha preferida *</Label>
              <input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => {
                  setFormData({...formData, preferredDate: e.target.value, preferredTime: ""});
                }}
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
                disabled={!formData.preferredDate || slotsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.preferredDate 
                      ? "Primero selecciona una fecha" 
                      : slotsLoading 
                      ? "Cargando horarios..."
                      : availableTimeSlots.length === 0
                      ? "No hay horarios disponibles"
                      : "Selecciona una hora"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    formData.preferredDate && !slotsLoading && (
                      <SelectItem value="" disabled>
                        No hay horarios disponibles
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {formData.preferredDate && bookedSlots.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Horarios ocupados:</p>
                      <p className="text-sm text-amber-700">
                        {bookedSlots.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                  {rates.length > 0 ? (
                    // Mostrar solo los tipos que tienen tarifa configurada
                    rates.map((rate) => (
                      <SelectItem key={rate.session_type} value={rate.session_type}>
                        <div className="flex items-center justify-between w-full">
                          <span>{getTypeLabel(rate.session_type)}</span>
                          <Badge variant="outline" className="ml-2 text-emerald-700">
                            {rate.price} {rate.currency}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback si no hay tarifas configuradas
                    <>
                      <SelectItem value="individual">{getTypeLabel("individual")}</SelectItem>
                      <SelectItem value="couple">{getTypeLabel("couple")}</SelectItem>
                      <SelectItem value="family">{getTypeLabel("family")}</SelectItem>
                      <SelectItem value="evaluation">{getTypeLabel("evaluation")}</SelectItem>
                      <SelectItem value="follow_up">{getTypeLabel("follow_up")}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              {/* Mostrar precio seleccionado */}
              {selectedRate && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Precio de esta consulta: {selectedRate.price} {selectedRate.currency}
                    </span>
                  </div>
                </div>
              )}
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
          </CardContent>
        </Card>

        {/* Sección de comprobante de pago - solo mostrar si hay tarifa */}
        {selectedRate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <CreditCard className="w-5 h-5" />
                Comprobante de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentProofUploader
                psychologistId={patient.psychologist_id}
                patientId={patient.id}
                onUploadComplete={(url) => setFormData({...formData, paymentProofUrl: url})}
                currentProofUrl={formData.paymentProofUrl}
              />
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          disabled={
            loading || 
            !formData.preferredDate || 
            !formData.preferredTime || 
            !formData.type || 
            availableTimeSlots.length === 0 ||
            !isSlotAvailable(formData.preferredTime) ||
            (selectedRate && !formData.paymentProofUrl) // Requerir comprobante si hay tarifa
          }
          className="w-full bg-gradient-to-r from-blue-500 to-emerald-500"
        >
          {loading ? "Enviando solicitud..." : "Enviar Solicitud"}
        </Button>
      </form>
    </div>
  );
};
