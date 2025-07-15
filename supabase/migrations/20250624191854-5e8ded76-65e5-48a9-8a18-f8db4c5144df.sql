
-- Crear tabla para almacenar sesiones de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_session_storage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  session_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_whatsapp_session_storage_session_id 
ON public.whatsapp_session_storage(session_id);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_whatsapp_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp automáticamente
DROP TRIGGER IF EXISTS update_whatsapp_session_storage_timestamp ON public.whatsapp_session_storage;
CREATE TRIGGER update_whatsapp_session_storage_timestamp
  BEFORE UPDATE ON public.whatsapp_session_storage
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_session_timestamp();
