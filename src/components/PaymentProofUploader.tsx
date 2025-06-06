
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePaymentProof } from '@/hooks/usePaymentProof';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface PaymentProofUploaderProps {
  psychologistId: string;
  patientId: string;
  onUploadComplete?: () => void;
}

export const PaymentProofUploader: React.FC<PaymentProofUploaderProps> = ({
  psychologistId,
  patientId,
  onUploadComplete
}) => {
  const { uploadPaymentProof, uploading } = usePaymentProof();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Subir archivo usando el hook existente
      const fileUrl = await uploadPaymentProof(file, psychologistId, patientId);
      
      if (fileUrl) {
        // Crear registro en payment_receipts
        const { data, error } = await supabase
          .from('payment_receipts')
          .insert({
            psychologist_id: psychologistId,
            patient_id: patientId,
            original_file_url: fileUrl,
            extraction_status: 'pending',
            validation_status: 'pending'
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Iniciar procesamiento OCR
        const { error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
          body: { 
            fileUrl: fileUrl, 
            receiptId: data.id 
          }
        });

        if (ocrError) {
          console.error('Error iniciando OCR:', ocrError);
          // No lanzamos error aquí porque el archivo ya se subió exitosamente
        }

        toast({
          title: "Comprobante subido exitosamente",
          description: "El comprobante está siendo procesado automáticamente. El profesional lo revisará pronto.",
        });

        onUploadComplete?.();
      }
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toast({
        title: "Error al subir comprobante",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Subir Comprobante de Pago
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-slate-600">Subiendo y procesando comprobante...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-slate-700">
                  Arrastra tu comprobante aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Formatos aceptados: PDF, JPG, PNG (máximo 5MB)
                </p>
              </div>
              
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                disabled={uploading}
              />
              
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">Procesamiento automático</h4>
              <p className="text-sm text-green-700 mt-1">
                Una vez subido, el comprobante será procesado automáticamente para extraer:
                fecha, monto, tipo de factura y método de pago. El profesional revisará 
                y validará los datos antes de incluirlos en los reportes mensuales.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
