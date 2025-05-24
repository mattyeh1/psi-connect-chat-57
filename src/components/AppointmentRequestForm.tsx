
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface AppointmentRequestFormData {
  preferred_date: string;
  preferred_time: string;
  type: string;
  notes: string;
}

export const AppointmentRequestForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { patient } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentRequestFormData>({
    defaultValues: {
      preferred_date: "",
      preferred_time: "",
      type: "individual",
      notes: ""
    }
  });

  const onSubmit = async (data: AppointmentRequestFormData) => {
    if (!patient) {
      toast({
        title: "Error",
        description: "No se pudo identificar al paciente",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('appointment_requests')
        .insert({
          patient_id: patient.id,
          psychologist_id: patient.psychologist_id,
          preferred_date: data.preferred_date,
          preferred_time: data.preferred_time,
          type: data.type,
          notes: data.notes
        });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud de cita ha sido enviada exitosamente. Tu psicólogo la revisará pronto.",
      });

      form.reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating appointment request:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots from 8:00 to 19:00
  const timeSlots = [];
  for (let hour = 8; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 bg-transparent"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          Solicitar nueva cita
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Solicitar Nueva Cita
          </SheetTitle>
          <SheetDescription>
            Completa el formulario para solicitar una nueva cita con tu psicólogo.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="preferred_date"
              rules={{ required: "Selecciona una fecha" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Preferida</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      min={minDate}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_time"
              rules={{ required: "Selecciona una hora" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora Preferida</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una hora" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Sesión</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="individual">Terapia Individual</SelectItem>
                      <SelectItem value="couple">Terapia de Pareja</SelectItem>
                      <SelectItem value="family">Terapia Familiar</SelectItem>
                      <SelectItem value="evaluation">Evaluación</SelectItem>
                      <SelectItem value="follow_up">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comparte cualquier información adicional sobre la cita..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg"
              >
                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
