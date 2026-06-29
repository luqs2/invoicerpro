// Supabase Edge Function: generate-pdf
// Generates a PDF from an invoice ID and returns a download URL
// Deploy: supabase functions deploy generate-pdf

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { invoice_id } = await req.json()
    const authHeader = req.headers.get('Authorization')!

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, client:clients(*), template:invoice_templates(*)')
      .eq('id', invoice_id)
      .single()

    if (error) throw error

    // NOTE: For full server-side PDF, use puppeteer or an HTML-to-PDF service.
    // The client-side jsPDF + html2canvas approach in usePdf.ts is used by default.
    // This function is a placeholder for when you need server-generated PDFs
    // (e.g. emailing invoices automatically).

    return new Response(
      JSON.stringify({ success: true, invoice }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
