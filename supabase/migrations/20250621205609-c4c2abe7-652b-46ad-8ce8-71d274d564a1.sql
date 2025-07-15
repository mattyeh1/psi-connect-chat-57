
-- Crear políticas RLS para la tabla patient_documents

-- Permitir a los pacientes ver sus propios documentos
CREATE POLICY "Patients can view their own documents" ON patient_documents
  FOR SELECT USING (patient_id = auth.uid()::text);

-- Permitir a los psicólogos ver documentos de sus pacientes
CREATE POLICY "Psychologists can view their patients documents" ON patient_documents
  FOR SELECT USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE id = auth.uid()
    )
  );

-- Permitir a los pacientes crear sus propios documentos
CREATE POLICY "Patients can create their own documents" ON patient_documents
  FOR INSERT WITH CHECK (patient_id = auth.uid()::text);

-- Permitir a los psicólogos crear documentos para sus pacientes
CREATE POLICY "Psychologists can create documents for their patients" ON patient_documents
  FOR INSERT WITH CHECK (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE id = auth.uid()
    )
  );

-- Permitir a los pacientes actualizar sus propios documentos
CREATE POLICY "Patients can update their own documents" ON patient_documents
  FOR UPDATE USING (patient_id = auth.uid()::text);

-- Permitir a los psicólogos actualizar documentos de sus pacientes
CREATE POLICY "Psychologists can update their patients documents" ON patient_documents
  FOR UPDATE USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE id = auth.uid()
    )
  );

-- Habilitar RLS en la tabla
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
