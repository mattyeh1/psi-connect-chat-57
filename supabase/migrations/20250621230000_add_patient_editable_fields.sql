
-- Add patient editable fields to patient_documents table
ALTER TABLE public.patient_documents 
ADD COLUMN IF NOT EXISTS patient_can_edit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS patient_edited_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS patient_edit_deadline timestamp with time zone;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_can_edit ON public.patient_documents(patient_can_edit);
CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_edited ON public.patient_documents(patient_edited_at);

-- Update RLS policies to allow patients to edit their own editable documents
CREATE POLICY "Patients can update their own editable documents" ON public.patient_documents
  FOR UPDATE 
  USING (
    patient_id = auth.uid()::text 
    AND patient_can_edit = true 
    AND patient_edited_at IS NULL
  );
