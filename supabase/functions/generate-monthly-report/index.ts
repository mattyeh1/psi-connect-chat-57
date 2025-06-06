
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
    const { psychologist_id, month, year } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Generating monthly report for psychologist ${psychologist_id}, period: ${month}/${year}`)

    // Obtener comprobantes aprobados del mes
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: receipts, error: receiptsError } = await supabaseClient
      .from('payment_receipts')
      .select('*')
      .eq('psychologist_id', psychologist_id)
      .eq('validation_status', 'approved')
      .eq('include_in_report', true)
      .gte('receipt_date', startDate)
      .lte('receipt_date', endDate)

    if (receiptsError) {
      throw receiptsError
    }

    // Calcular totales
    const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0)
    const totalReceipts = receipts.length

    // Agrupar por método de pago
    const amountByPaymentMethod = receipts.reduce((acc, receipt) => {
      const method = receipt.payment_method || 'no_especificado'
      acc[method] = (acc[method] || 0) + (receipt.amount || 0)
      return acc
    }, {})

    // Calcular acumulado anual
    const { data: annualData } = await supabaseClient
      .rpc('calculate_annual_accumulated', {
        psychologist_id_param: psychologist_id,
        year_param: year
      })

    const annualAccumulated = annualData || 0

    // Crear o actualizar el reporte
    const { data: report, error: reportError } = await supabaseClient
      .from('accounting_reports')
      .upsert({
        psychologist_id,
        report_month: month,
        report_year: year,
        total_amount: totalAmount,
        total_receipts: totalReceipts,
        amount_by_payment_method: amountByPaymentMethod,
        annual_accumulated: annualAccumulated,
        status: 'generated',
        generation_date: new Date().toISOString()
      })
      .select()
      .single()

    if (reportError) {
      throw reportError
    }

    // Generar archivo PDF (aquí se integraría con una librería de PDF)
    const reportData = {
      period: `${month}/${year}`,
      receipts,
      totals: {
        amount: totalAmount,
        receipts: totalReceipts,
        byPaymentMethod: amountByPaymentMethod,
        annualAccumulated
      }
    }

    // En un entorno real, aquí se generaría el PDF y se subiría a storage
    console.log('Report data:', reportData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        message: 'Monthly report generated successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-monthly-report:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
