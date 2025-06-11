
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

  let requestBody: any = null;
  let receiptId: string | null = null;

  try {
    requestBody = await req.json()
    console.log('=== OCR PROCESSING REQUEST START ===')
    console.log('Request body received:', JSON.stringify(requestBody, null, 2))

    const { fileUrl, receiptId: reqReceiptId } = requestBody
    receiptId = reqReceiptId

    if (!fileUrl || !receiptId) {
      console.error('❌ Missing required parameters:', { fileUrl: !!fileUrl, receiptId: !!receiptId })
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: fileUrl and receiptId are required',
          received: { hasFileUrl: !!fileUrl, hasReceiptId: !!receiptId },
          success: false
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Processing receipt OCR for:', receiptId)
    console.log('File URL:', fileUrl)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar que el receipt existe
    const { data: existingReceipt, error: fetchError } = await supabaseClient
      .from('payment_receipts')
      .select('id, original_file_url, extraction_status, created_at')
      .eq('id', receiptId)
      .single()

    if (fetchError || !existingReceipt) {
      console.error('❌ Receipt not found:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Receipt not found',
          receiptId: receiptId,
          success: false
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Found receipt:', existingReceipt.id)
    console.log('Current extraction status:', existingReceipt.extraction_status)

    // Si ya está procesado exitosamente, no procesar de nuevo
    if (existingReceipt.extraction_status === 'extracted') {
      console.log('ℹ️ Receipt already processed successfully')
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Receipt already processed',
          receiptId: receiptId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Actualizar estado a "processing"
    const { error: updateError1 } = await supabaseClient
      .from('payment_receipts')
      .update({ 
        extraction_status: 'processing',
        validation_status: 'pending',
        validation_notes: 'Iniciando procesamiento OCR...'
      })
      .eq('id', receiptId)

    if (updateError1) {
      console.error('⚠️ Error updating receipt to processing:', updateError1)
    } else {
      console.log('✅ Receipt status updated to processing')
    }

    // Verificar n8n webhook
    const n8nWebhook = Deno.env.get('N8N_WEBHOOK_URL')
    console.log('N8N_WEBHOOK_URL configured:', !!n8nWebhook)
    
    if (n8nWebhook) {
      console.log('=== CALLING N8N WEBHOOK ===')
      
      // Preparar URL del archivo
      let fileUrlToUse = fileUrl
      
      // Si es de Supabase storage, crear URL firmada
      if (fileUrl.includes('supabase.co/storage/v1/object/public/payment-proofs/')) {
        try {
          const fileName = fileUrl.split('/payment-proofs/')[1]
          console.log('Creating signed URL for file:', fileName)
          
          const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
            .from('payment-proofs')
            .createSignedUrl(fileName, 3600)
          
          if (signedUrlError) {
            console.error('⚠️ Error creating signed URL:', signedUrlError)
          } else if (signedUrlData?.signedUrl) {
            fileUrlToUse = signedUrlData.signedUrl
            console.log('✅ Using signed URL for better access')
          }
        } catch (signedUrlErr) {
          console.error('⚠️ Error handling signed URL creation:', signedUrlErr)
        }
      }
      
      const webhookPayload = {
        receiptId: receiptId,
        fileUrl: fileUrlToUse,
        originalFileUrl: fileUrl,
        timestamp: new Date().toISOString(),
        source: 'edge_function'
      }
      
      console.log('Sending payload to n8n:', JSON.stringify(webhookPayload, null, 2))
      
      try {
        const webhookResponse = await fetch(n8nWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
          signal: AbortSignal.timeout(60000) // 60 segundos
        })
        
        console.log('N8N webhook response status:', webhookResponse.status)
        
        if (webhookResponse.ok) {
          const responseText = await webhookResponse.text()
          console.log('N8N webhook response:', responseText)
          
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            console.log('Response is not JSON, treating as text success');
            responseData = { message: responseText };
          }
          
          // Verificar si la respuesta incluye datos extraídos
          if (responseData.success && responseData.extractedData) {
            console.log('✅ N8N processing completed successfully with extracted data:', responseData.extractedData)
            
            // Obtener mes y año actual para posible inclusión en reportes mensuales
            const extractedDate = responseData.extractedData.date ? new Date(responseData.extractedData.date) : new Date()
            const extractedMonth = extractedDate.getMonth() + 1
            const extractedYear = extractedDate.getFullYear()
            
            console.log(`Receipt date info: ${extractedDate.toISOString()}, Month: ${extractedMonth}, Year: ${extractedYear}`)
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'OCR processing completed successfully via n8n',
                receiptId: receiptId,
                extractedData: responseData.extractedData,
                amount: responseData.extractedData.amount,
                date: responseData.extractedData.date,
                extractedMonth,
                extractedYear,
                confidence: responseData.extractedData.confidence,
                n8nResponse: responseData
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          } else {
            console.log('✅ N8N webhook completed but checking for data...')
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'OCR processing initiated via n8n',
                receiptId: receiptId,
                n8nResponse: responseData
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        } else {
          const errorText = await webhookResponse.text()
          console.error('❌ N8N webhook failed with status:', webhookResponse.status)
          console.error('N8N webhook error response:', errorText)
          throw new Error(`N8N webhook failed: ${webhookResponse.status} - ${errorText}`)
        }
      } catch (webhookError) {
        console.error('❌ Error calling n8n webhook:', webhookError)
        throw webhookError
      }
    } else {
      console.log('ℹ️ N8N_WEBHOOK_URL not configured, this is required for OCR processing')
      throw new Error('N8N webhook not configured')
    }

  } catch (error) {
    console.error('=== ERROR IN PROCESS-RECEIPT-OCR ===')
    console.error('Error details:', error)
    console.error('Error stack:', error.stack)
    
    // Actualizar estado de error en la base de datos
    if (receiptId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseClient
          .from('payment_receipts')
          .update({ 
            extraction_status: 'error',
            validation_status: 'needs_review',
            validation_notes: `Error en procesamiento OCR: ${error.message}. Timestamp: ${new Date().toISOString()}`
          })
          .eq('id', receiptId)
          
        console.log('✅ Updated receipt status to error')
      } catch (updateError) {
        console.error('❌ Error updating receipt status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        receiptId: receiptId,
        success: false,
        timestamp: new Date().toISOString(),
        details: 'Check edge function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
