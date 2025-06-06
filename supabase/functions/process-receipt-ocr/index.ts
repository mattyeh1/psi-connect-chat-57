
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, receiptId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Processing receipt OCR for:', receiptId)

    // Simulación de extracción OCR (aquí iría la integración real con Google Vision API o similar)
    const extractedData = await mockOCRExtraction(fileUrl)

    // Actualizar el comprobante con los datos extraídos
    const { error } = await supabaseClient
      .from('payment_receipts')
      .update({
        receipt_date: extractedData.date,
        amount: extractedData.amount,
        receipt_type: extractedData.type,
        receipt_number: extractedData.number,
        patient_cuit: extractedData.cuit,
        payment_method: extractedData.paymentMethod,
        extracted_data: extractedData,
        extraction_status: 'extracted'
      })
      .eq('id', receiptId)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        message: 'OCR processing completed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in process-receipt-ocr:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Función mock para simular extracción OCR
async function mockOCRExtraction(fileUrl: string) {
  // En un entorno real, aquí se haría la llamada a Google Vision API, Tesseract, etc.
  console.log('Processing file:', fileUrl)
  
  // Simulamos datos extraídos
  return {
    date: new Date().toISOString().split('T')[0],
    amount: Math.floor(Math.random() * 10000) + 1000, // Monto aleatorio entre 1000-11000
    type: 'factura_c',
    number: `FC-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    cuit: '20-12345678-9',
    paymentMethod: 'transferencia',
    confidence: 0.95
  }
}
