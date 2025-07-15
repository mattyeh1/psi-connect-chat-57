
-- Crear tabla para notificaciones del sistema
CREATE TABLE public.system_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('patient', 'psychologist')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('appointment_reminder', 'payment_due', 'document_ready', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_method TEXT NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'whatsapp', 'push')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para configuración de recordatorios
CREATE TABLE public.reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('appointment', 'payment', 'document')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  hours_before INTEGER NOT NULL DEFAULT 24,
  delivery_methods TEXT[] NOT NULL DEFAULT '{"email"}',
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(psychologist_id, reminder_type)
);

-- Crear tabla para confirmaciones de citas
CREATE TABLE public.appointment_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  confirmation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_confirmations ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para system_notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.system_notifications 
  FOR SELECT 
  USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications" 
  ON public.system_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update notifications" 
  ON public.system_notifications 
  FOR UPDATE 
  USING (true);

-- Crear políticas RLS para reminder_settings
CREATE POLICY "Psychologists can manage their reminder settings" 
  ON public.reminder_settings 
  FOR ALL 
  USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can insert their reminder settings" 
  ON public.reminder_settings 
  FOR INSERT 
  WITH CHECK (psychologist_id = auth.uid());

-- Crear políticas RLS para appointment_confirmations
CREATE POLICY "Users can view appointment confirmations" 
  ON public.appointment_confirmations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE id = appointment_id 
      AND (patient_id = auth.uid() OR psychologist_id = auth.uid())
    )
  );

CREATE POLICY "System can manage appointment confirmations" 
  ON public.appointment_confirmations 
  FOR ALL 
  USING (true);

-- Crear función para programar recordatorios automáticos
CREATE OR REPLACE FUNCTION public.schedule_appointment_reminders()
RETURNS TRIGGER AS $$
DECLARE
  reminder_record RECORD;
  reminder_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Solo procesar citas programadas
  IF NEW.status != 'scheduled' THEN
    RETURN NEW;
  END IF;

  -- Buscar configuración de recordatorios para el psicólogo
  FOR reminder_record IN 
    SELECT * FROM public.reminder_settings 
    WHERE psychologist_id = NEW.psychologist_id 
    AND reminder_type = 'appointment' 
    AND enabled = true
  LOOP
    -- Calcular tiempo del recordatorio
    reminder_time := NEW.appointment_date - (reminder_record.hours_before || ' hours')::INTERVAL;
    
    -- Solo programar si el recordatorio es en el futuro
    IF reminder_time > now() THEN
      -- Insertar notificación para el paciente
      INSERT INTO public.system_notifications (
        recipient_id,
        recipient_type,
        notification_type,
        title,
        message,
        scheduled_for,
        delivery_method,
        metadata
      ) VALUES (
        NEW.patient_id,
        'patient',
        'appointment_reminder',
        'Recordatorio de Cita',
        COALESCE(
          reminder_record.custom_message,
          'Tienes una cita programada para el ' || to_char(NEW.appointment_date, 'DD/MM/YYYY') || ' a las ' || to_char(NEW.appointment_date, 'HH24:MI')
        ),
        reminder_time,
        'email',
        jsonb_build_object(
          'appointment_id', NEW.id,
          'appointment_date', NEW.appointment_date,
          'psychologist_id', NEW.psychologist_id
        )
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para programar recordatorios automáticamente
CREATE TRIGGER schedule_appointment_reminders_trigger
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.schedule_appointment_reminders();

-- Crear función para generar token de confirmación
CREATE OR REPLACE FUNCTION public.generate_confirmation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Crear función para crear confirmación de cita
CREATE OR REPLACE FUNCTION public.create_appointment_confirmation(appointment_id UUID)
RETURNS UUID AS $$
DECLARE
  confirmation_id UUID;
  token TEXT;
BEGIN
  -- Generar token único
  token := public.generate_confirmation_token();
  
  -- Insertar confirmación
  INSERT INTO public.appointment_confirmations (
    appointment_id,
    confirmation_token,
    expires_at
  ) VALUES (
    appointment_id,
    token,
    now() + INTERVAL '24 hours'
  ) RETURNING id INTO confirmation_id;
  
  RETURN confirmation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
