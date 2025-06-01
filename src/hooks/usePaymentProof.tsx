
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const usePaymentProof = () => {
  const [uploading, setUploading] = useState(false);

  const uploadPaymentProof = async (
    file: File, 
    psychologistId: string, 
    patientId: string
  ): Promise<string | null> => {
    setUploading(true);
    
    try {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG.');
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      // Convertir archivo a base64 para almacenamiento local
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `payment_proof_${psychologistId}_${patientId}_${timestamp}.${extension}`;

      // Guardar en localStorage
      const paymentProofs = JSON.parse(localStorage.getItem('paymentProofs') || '{}');
      paymentProofs[fileName] = {
        data: base64,
        originalName: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      localStorage.setItem('paymentProofs', JSON.stringify(paymentProofs));

      // Crear URL local para el archivo
      const localUrl = `/payment-proofs/${fileName}`;

      toast({
        title: "Comprobante subido",
        description: "El comprobante de pago se ha subido exitosamente"
      });

      return localUrl;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getPaymentProofUrl = (fileName: string) => {
    // Para archivos locales, devolver la URL directa
    return `/payment-proofs/${fileName}`;
  };

  const getPaymentProofData = (fileName: string) => {
    try {
      const paymentProofs = JSON.parse(localStorage.getItem('paymentProofs') || '{}');
      return paymentProofs[fileName.replace('/payment-proofs/', '')] || null;
    } catch {
      return null;
    }
  };

  return {
    uploadPaymentProof,
    uploading,
    getPaymentProofUrl,
    getPaymentProofData
  };
};
