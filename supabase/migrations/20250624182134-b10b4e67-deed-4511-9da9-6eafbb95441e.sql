
-- 1. Fix the schedule_appointment_reminders trigger to handle 'confirmed' status and use proper delivery methods
CREATE OR REPLACE FUNCTION public.schedule_appointment_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  reminder_record RECORD;
  reminder_time TIMESTAMP WITH TIME ZONE;
  patient_record RECORD;
  delivery_method TEXT;
BEGIN
  -- Solo procesar citas programadas o confirmadas
  IF NEW.status NOT IN ('scheduled', 'confirmed') THEN
    RETURN NEW;
  END IF;

  -- Obtener información del paciente
  SELECT * INTO patient_record FROM public.patients WHERE id = NEW.patient_id;
  
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
      -- Procesar cada método de entrega configurado
      FOREACH delivery_method IN ARRAY reminder_record.delivery_methods
      LOOP
        -- Validar que si es WhatsApp, el paciente tenga teléfono
        IF delivery_method = 'whatsapp' AND (patient_record.phone IS NULL OR patient_record.phone = '') THEN
          CONTINUE; -- Skip WhatsApp if no phone
        END IF;
        
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
            'Estimado/a ' || patient_record.first_name || ', le recordamos su cita programada para el ' || 
            to_char(NEW.appointment_date, 'DD/MM/YYYY') || ' a las ' || to_char(NEW.appointment_date, 'HH24:MI')
          ),
          reminder_time,
          delivery_method,
          jsonb_build_object(
            'appointment_id', NEW.id,
            'appointment_date', NEW.appointment_date,
            'psychologist_id', NEW.psychologist_id,
            'patient_name', patient_record.first_name || ' ' || patient_record.last_name,
            'phone_number', CASE WHEN delivery_method = 'whatsapp' THEN patient_record.phone ELSE NULL END,
            'hours_before', reminder_record.hours_before
          )
        );
      END LOOP;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 2. Create function to manually program missing reminders for existing appointments
CREATE OR REPLACE FUNCTION public.create_missing_appointment_reminders()
RETURNS TABLE(
  appointment_id UUID,
  patient_name TEXT,
  reminders_created INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  apt_record RECORD;
  reminder_record RECORD;
  patient_record RECORD;
  reminder_time TIMESTAMP WITH TIME ZONE;
  delivery_method TEXT;
  reminders_count INTEGER;
BEGIN
  -- Buscar citas futuras sin recordatorios programados
  FOR apt_record IN 
    SELECT DISTINCT a.id, a.appointment_date, a.patient_id, a.psychologist_id, a.status
    FROM public.appointments a
    WHERE a.appointment_date > now()
    AND a.status IN ('scheduled', 'confirmed')
    AND NOT EXISTS (
      SELECT 1 FROM public.system_notifications sn 
      WHERE sn.metadata->>'appointment_id' = a.id::text
      AND sn.notification_type = 'appointment_reminder'
    )
  LOOP
    reminders_count := 0;
    
    -- Obtener información del paciente
    SELECT * INTO patient_record FROM public.patients WHERE id = apt_record.patient_id;
    
    -- Buscar configuración de recordatorios para el psicólogo
    FOR reminder_record IN 
      SELECT * FROM public.reminder_settings 
      WHERE psychologist_id = apt_record.psychologist_id 
      AND reminder_type = 'appointment' 
      AND enabled = true
    LOOP
      -- Calcular tiempo del recordatorio
      reminder_time := apt_record.appointment_date - (reminder_record.hours_before || ' hours')::INTERVAL;
      
      -- Solo programar si el recordatorio es en el futuro
      IF reminder_time > now() THEN
        -- Procesar cada método de entrega configurado
        FOREACH delivery_method IN ARRAY reminder_record.delivery_methods
        LOOP
          -- Validar que si es WhatsApp, el paciente tenga teléfono
          IF delivery_method = 'whatsapp' AND (patient_record.phone IS NULL OR patient_record.phone = '') THEN
            CONTINUE; -- Skip WhatsApp if no phone
          END IF;
          
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
            apt_record.patient_id,
            'patient',
            'appointment_reminder',
            'Recordatorio de Cita',
            COALESCE(
              reminder_record.custom_message,
              'Estimado/a ' || patient_record.first_name || ', le recordamos su cita programada para el ' || 
              to_char(apt_record.appointment_date, 'DD/MM/YYYY') || ' a las ' || to_char(apt_record.appointment_date, 'HH24:MI')
            ),
            reminder_time,
            delivery_method,
            jsonb_build_object(
              'appointment_id', apt_record.id,
              'appointment_date', apt_record.appointment_date,
              'psychologist_id', apt_record.psychologist_id,
              'patient_name', patient_record.first_name || ' ' || patient_record.last_name,
              'phone_number', CASE WHEN delivery_method = 'whatsapp' THEN patient_record.phone ELSE NULL END,
              'hours_before', reminder_record.hours_before
            )
          );
          
          reminders_count := reminders_count + 1;
        END LOOP;
      END IF;
    END LOOP;
    
    -- Devolver resultado para esta cita
    appointment_id := apt_record.id;
    patient_name := patient_record.first_name || ' ' || patient_record.last_name;
    reminders_created := reminders_count;
    status := CASE WHEN reminders_count > 0 THEN 'success' ELSE 'no_reminders_needed' END;
    
    RETURN NEXT;
  END LOOP;
END;
$function$;

-- 3. Add WhatsApp message templates to whatsapp_config if not exists
INSERT INTO public.whatsapp_config (config_key, config_value, description)
VALUES (
  'message_templates',
  '{
    "appointment_reminder": "Estimado/a {{patient_name}}, le recordamos su cita para el {{date}} a las {{time}}. Por favor confirme su asistencia.",
    "payment_due": "Hola {{patient_name}}, tienes un pago pendiente de ${{amount}}.",
    "document_ready": "Hola {{patient_name}}, tu documento {{document_name}} está listo.",
    "payment_confirmed": "Hola {{patient_name}}, hemos confirmado tu pago de ${{amount}}.",
    "appointment_confirmed": "Hola {{patient_name}}, tu cita para el {{date}} a las {{time}} ha sido confirmada."
  }',
  'Plantillas de mensajes WhatsApp para diferentes tipos de notificaciones'
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();
