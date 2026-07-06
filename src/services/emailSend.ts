import { supabase } from './supabase'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  pdfBase64?: string
  pdfFilename?: string
}

export const emailSendService = {
  async send(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        },
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Email send failed')

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Email send failed' }
    }
  },
}
