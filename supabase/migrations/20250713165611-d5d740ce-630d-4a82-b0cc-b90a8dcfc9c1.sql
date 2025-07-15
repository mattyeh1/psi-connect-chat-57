
-- Añadir la columna profession_type a la tabla psychologists
ALTER TABLE public.psychologists 
ADD COLUMN profession_type TEXT DEFAULT 'psychologist';

-- Actualizar los registros existentes con el tipo de profesión desde user_metadata
UPDATE public.psychologists 
SET profession_type = COALESCE(
  (SELECT raw_user_meta_data->>'professional_type' 
   FROM auth.users 
   WHERE auth.users.id = psychologists.id), 
  'psychologist'
);

-- Hacer que profession_type sea NOT NULL después de actualizar los datos
ALTER TABLE public.psychologists 
ALTER COLUMN profession_type SET NOT NULL;
