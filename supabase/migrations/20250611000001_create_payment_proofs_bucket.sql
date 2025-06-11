
-- Crear bucket para comprobantes de pago si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para el bucket payment-proofs
CREATE POLICY "Anyone can view payment proofs" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-proofs');

CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own payment proofs" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own payment proofs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
