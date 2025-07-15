
-- Add missing fields to patient_documents table
ALTER TABLE public.patient_documents 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS due_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS workflow_step integer DEFAULT 1;

-- Create document_templates table
CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  name text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('assessment', 'consent', 'treatment_plan', 'progress_report')),
  template_content jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create document_notifications table
CREATE TABLE IF NOT EXISTS public.document_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.patient_documents(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('psychologist', 'patient')),
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on new tables
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_templates
CREATE POLICY "Psychologists can view their own templates" 
  ON public.document_templates 
  FOR SELECT 
  USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can create their own templates" 
  ON public.document_templates 
  FOR INSERT 
  WITH CHECK (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can update their own templates" 
  ON public.document_templates 
  FOR UPDATE 
  USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can delete their own templates" 
  ON public.document_templates 
  FOR DELETE 
  USING (psychologist_id = auth.uid());

-- RLS policies for document_notifications
CREATE POLICY "Users can view notifications sent to them" 
  ON public.document_notifications 
  FOR SELECT 
  USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications" 
  ON public.document_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.document_notifications 
  FOR UPDATE 
  USING (recipient_id = auth.uid());

-- Update RLS policies for patient_documents to include priority and due_date
CREATE POLICY "Psychologists can view patient documents they created" 
  ON public.patient_documents 
  FOR SELECT 
  USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can create patient documents" 
  ON public.patient_documents 
  FOR INSERT 
  WITH CHECK (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can update their patient documents" 
  ON public.patient_documents 
  FOR UPDATE 
  USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can delete their patient documents" 
  ON public.patient_documents 
  FOR DELETE 
  USING (psychologist_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_templates_psychologist ON public.document_templates(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_document_notifications_recipient ON public.document_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_priority ON public.patient_documents(priority);
CREATE INDEX IF NOT EXISTS idx_patient_documents_due_date ON public.patient_documents(due_date);
