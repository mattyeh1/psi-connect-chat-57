import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRealtimeChannel } from './useRealtimeChannel';

interface PaymentReceipt {
  id: string;
  psychologist_id: string;
  patient_id?: string;
  original_file_url: string;
  receipt_date?: string;
  amount?: number;
  receipt_type?: string;
  payment_method?: string;
  receipt_number?: string;
  patient_cuit?: string;
  extraction_status: string;
  validation_status: string;
  auto_approved?: boolean;
  validated_at?: string;
  validated_by?: string;
  validation_notes?: string;
  extracted_data?: any;
  include_in_report: boolean;
  created_at: string;
  updated_at: string;
}

export const usePaymentReceipts = (psychologistId?: string) => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isDisabled } = useRealtimeChannel({
    channelName: `payment-receipts-${psychologistId}`,
    enabled: !!psychologistId && !error,
    table: 'payment_receipts',
    filter: `psychologist_id=eq.${psychologistId}`,
    onUpdate: (payload) => {
      console.log('Payment receipt real-time update:', payload);
      fetchReceipts();
    }
  });

  const fetchReceipts = async () => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment receipts:', error);
        throw error;
      }

      setReceipts(data || []);
      setError(null);
      
    } catch (err) {
      console.error('Error in fetchReceipts:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast({
        title: "Error",
        description: "Error al cargar los comprobantes de pago",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadReceipt = async (file: File, patientId?: string) => {
    if (!psychologistId) {
      throw new Error('Psychologist ID is required');
    }

    try {
      console.log('Uploading receipt file:', file.name);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${psychologistId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(uploadData.path);

      // Create payment receipt record
      const { data: receiptData, error: receiptError } = await supabase
        .from('payment_receipts')
        .insert({
          psychologist_id: psychologistId,
          patient_id: patientId,
          original_file_url: urlData.publicUrl,
          extraction_status: 'pending',
          validation_status: 'pending',
          include_in_report: true
        })
        .select()
        .single();

      if (receiptError) {
        console.error('Error creating receipt record:', receiptError);
        throw receiptError;
      }

      console.log('Receipt record created:', receiptData.id);

      // Trigger OCR processing
      const { error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
        body: { 
          fileUrl: urlData.publicUrl, 
          receiptId: receiptData.id 
        }
      });

      if (ocrError) {
        console.error('Error triggering OCR:', ocrError);
        // Don't throw here, let the receipt be processed manually
      }

      toast({
        title: "Comprobante subido",
        description: "El comprobante se ha subido y está siendo procesado"
      });

      fetchReceipts();
      return receiptData;

    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Error",
        description: "Error al subir el comprobante",
        variant: "destructive"
      });
      throw error;
    }
  };

  const validateReceipt = async (receiptId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      console.log('Validating receipt:', { receiptId, status, notes });

      const { error } = await supabase
        .from('payment_receipts')
        .update({
          validation_status: status,
          validated_at: new Date().toISOString(),
          validated_by: psychologistId,
          validation_notes: notes
        })
        .eq('id', receiptId);

      if (error) {
        console.error('Error validating receipt:', error);
        throw error;
      }

      toast({
        title: "Comprobante validado",
        description: `El comprobante ha sido ${status === 'approved' ? 'aprobado' : 'rechazado'}`
      });

      fetchReceipts();

    } catch (error) {
      console.error('Error validating receipt:', error);
      toast({
        title: "Error",
        description: "Error al validar el comprobante",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateReceiptInclusion = async (receiptId: string, includeInReport: boolean) => {
    try {
      console.log('Updating receipt inclusion:', { receiptId, includeInReport });

      const { error } = await supabase
        .from('payment_receipts')
        .update({
          include_in_report: includeInReport
        })
        .eq('id', receiptId);

      if (error) {
        console.error('Error updating receipt inclusion:', error);
        throw error;
      }

      toast({
        title: "Comprobante actualizado",
        description: `El comprobante ha sido ${includeInReport ? 'incluido en' : 'excluido del'} reporte`
      });

      fetchReceipts();

    } catch (error) {
      console.error('Error updating receipt inclusion:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el comprobante",
        variant: "destructive"
      });
      throw error;
    }
  };

  const retryOCRProcessing = async (receiptId: string) => {
    try {
      console.log('Retrying OCR processing for receipt:', receiptId);

      const receipt = receipts.find(r => r.id === receiptId);
      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // Update status to pending
      const { error: updateError } = await supabase
        .from('payment_receipts')
        .update({
          extraction_status: 'pending'
        })
        .eq('id', receiptId);

      if (updateError) {
        throw updateError;
      }

      // Trigger OCR processing again
      const { error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
        body: { 
          fileUrl: receipt.original_file_url, 
          receiptId: receiptId 
        }
      });

      if (ocrError) {
        console.error('Error triggering OCR retry:', ocrError);
        throw ocrError;
      }

      toast({
        title: "Procesando comprobante",
        description: "El comprobante está siendo procesado nuevamente"
      });

      fetchReceipts();

    } catch (error) {
      console.error('Error retrying OCR processing:', error);
      toast({
        title: "Error",
        description: "Error al procesar el comprobante",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (psychologistId) {
      fetchReceipts();
      
      // Si realtime está deshabilitado, configurar polling
      if (isDisabled) {
        const interval = setInterval(() => {
          fetchReceipts();
        }, 60000); // Polling cada minuto para receipts

        return () => clearInterval(interval);
      }
    }
  }, [psychologistId, isDisabled]);

  return {
    receipts,
    loading,
    error,
    uploadReceipt,
    validateReceipt,
    updateReceiptInclusion,
    retryOCRProcessing,
    refetch: fetchReceipts
  };
};
