// Supabase Edge Function: send-invoice
// Sends invoice email to client via Resend (https://resend.com)
// Deploy: supabase functions deploy send-invoice
// Env vars needed: RESEND_API_KEY

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

    // Fetch invoice with client and business profile
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('id', invoice_id)
      .single()

    if (error) throw error

    const { data: business } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', invoice.user_id)
      .single()

    // Send via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY not configured')

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${business?.name ?? 'InvoicerPro'} <invoices@yourdomain.com>`,
        to: [invoice.client.email],
        subject: `Invoice ${invoice.invoice_number} from ${business?.name ?? 'InvoicerPro'}`,
        html: `
          <h2>Invoice ${invoice.invoice_number}</h2>
          <p>Dear ${invoice.client.name},</p>
          <p>Please find attached your invoice for <strong>${invoice.currency} ${invoice.total.toFixed(2)}</strong>.</p>
          <p>Due date: ${invoice.due_date}</p>
          <p>${invoice.notes ?? ''}</p>
          <br/>
          <p>Best regards,<br/>${business?.name ?? ''}</p>
        `,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.json()
      throw new Error(`Resend error: ${JSON.stringify(err)}`)
    }

    // Update invoice status to 'sent'
    await supabase
      .from('invoices')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', invoice_id)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
