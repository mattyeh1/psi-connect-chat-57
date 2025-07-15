
-- Crear tabla para gestionar el estado de WhatsApp
CREATE TABLE public.whatsapp_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'qr_pending', 'connected', 'error')),
  qr_code TEXT,
  phone_number TEXT,
  device_info JSONB DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para logs de mensajes WhatsApp
CREATE TABLE public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document')),
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  whatsapp_message_id TEXT,
  notification_id UUID REFERENCES public.system_notifications(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para configuración de WhatsApp
CREATE TABLE public.whatsapp_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO public.whatsapp_config (config_key, config_value, description) VALUES
('message_templates', '{
  "appointment_reminder": "🏥 Recordatorio de Cita\n\nHola {{patient_name}},\n\nTe recordamos tu cita con {{psychologist_name}} programada para:\n📅 Fecha: {{date}}\n🕐 Hora: {{time}}\n\n¡Te esperamos!",
  "payment_reminder": "💳 Recordatorio de Pago\n\nHola {{patient_name}},\n\nTienes un pago pendiente de ${{amount}} correspondiente a tu sesión.\n\nGracias por tu atención.",
  "document_ready": "📄 Documento Disponible\n\nHola {{patient_name}},\n\nTu {{document_type}} está listo para ser revisado.\n\nPuedes acceder desde tu portal de paciente.",
  "appointment_confirmation": "✅ Cita Confirmada\n\nHola {{patient_name}},\n\nTu cita ha sido confirmada para el {{date}} a las {{time}}.\n\n¡Nos vemos pronto!"
}', 'Plantillas de mensajes WhatsApp'),
('auto_responses', '{
  "welcome": "¡Hola! Gracias por contactarnos. En breve un profesional te atenderá.",
  "business_hours": "Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00 hs."
}', 'Respuestas automáticas'),
('settings', '{
  "auto_reply_enabled": true,
  "business_hours_enabled": true,
  "webhook_enabled": false,
  "max_retries": 3,
  "retry_delay_minutes": 5
}', 'Configuración general del sistema WhatsApp');

-- Habilitar RLS
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (solo administradores)
CREATE POLICY "Admin only access whatsapp_sessions" ON public.whatsapp_sessions
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admin only access whatsapp_messages" ON public.whatsapp_messages
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admin only access whatsapp_config" ON public.whatsapp_config
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Función para actualizar estado de sesión WhatsApp
CREATE OR REPLACE FUNCTION public.update_whatsapp_session_status(
  session_id_param TEXT,
  new_status TEXT,
  qr_code_param TEXT DEFAULT NULL,
  phone_number_param TEXT DEFAULT NULL,
  device_info_param JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.whatsapp_sessions (session_id, status, qr_code, phone_number, device_info)
  VALUES (session_id_param, new_status, qr_code_param, phone_number_param, device_info_param)
  ON CONFLICT (session_id)
  DO UPDATE SET
    status = new_status,
    qr_code = COALESCE(qr_code_param, whatsapp_sessions.qr_code),
    phone_number = COALESCE(phone_number_param, whatsapp_sessions.phone_number),
    device_info = COALESCE(device_info_param, whatsapp_sessions.device_info),
    last_activity = NOW(),
    updated_at = NOW();
END;
$$;

-- Función para registrar mensaje WhatsApp
CREATE OR REPLACE FUNCTION public.log_whatsapp_message(
  session_id_param UUID,
  from_number_param TEXT,
  to_number_param TEXT,
  message_body_param TEXT,
  direction_param TEXT,
  whatsapp_message_id_param TEXT DEFAULT NULL,
  notification_id_param UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO public.whatsapp_messages (
    session_id, from_number, to_number, message_body, direction, 
    whatsapp_message_id, notification_id
  )
  VALUES (
    session_id_param, from_number_param, to_number_param, message_body_param, 
    direction_param, whatsapp_message_id_param, notification_id_param
  )
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;
