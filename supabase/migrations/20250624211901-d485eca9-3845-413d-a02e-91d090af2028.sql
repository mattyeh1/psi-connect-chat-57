
-- Mejorar la tabla whatsapp_messages con campos adicionales
ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS message_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_media BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS media_type TEXT,
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'read', 'failed'));

-- Crear tabla para contactos frecuentes
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para estadísticas del bot
CREATE TABLE IF NOT EXISTS public.whatsapp_bot_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  unique_contacts INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  uptime_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_number ON public.whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_to_number ON public.whatsapp_messages(to_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction ON public.whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone ON public.whatsapp_contacts(phone_number);

-- Función para actualizar estadísticas diarias
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.whatsapp_bot_stats (date, messages_sent, messages_received)
  VALUES (CURRENT_DATE, 
    CASE WHEN NEW.direction = 'outgoing' THEN 1 ELSE 0 END,
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    messages_sent = whatsapp_bot_stats.messages_sent + 
      CASE WHEN NEW.direction = 'outgoing' THEN 1 ELSE 0 END,
    messages_received = whatsapp_bot_stats.messages_received + 
      CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas automáticamente
DROP TRIGGER IF EXISTS update_stats_on_message ON public.whatsapp_messages;
CREATE TRIGGER update_stats_on_message
  AFTER INSERT ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION update_daily_stats();

-- Función para actualizar contactos
CREATE OR REPLACE FUNCTION update_contact_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contacto para el remitente (solo en mensajes entrantes)
  IF NEW.direction = 'incoming' THEN
    INSERT INTO public.whatsapp_contacts (phone_number, contact_name, last_message_at, message_count)
    VALUES (NEW.from_number, NEW.metadata->>'userName', NEW.created_at, 1)
    ON CONFLICT (phone_number) 
    DO UPDATE SET
      contact_name = COALESCE(NEW.metadata->>'userName', whatsapp_contacts.contact_name),
      last_message_at = NEW.created_at,
      message_count = whatsapp_contacts.message_count + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contactos automáticamente
DROP TRIGGER IF EXISTS update_contact_on_message ON public.whatsapp_messages;
CREATE TRIGGER update_contact_on_message
  AFTER INSERT ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION update_contact_info();

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_bot_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin
CREATE POLICY "Admin access whatsapp_contacts" ON public.whatsapp_contacts
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admin access whatsapp_bot_stats" ON public.whatsapp_bot_stats
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
