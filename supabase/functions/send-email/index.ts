// Supabase Edge Function: send-email
// Sends email via Google SMTP with optional PDF attachment
// Deploy: supabase functions deploy send-email
// Secrets: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const CRLF = '\r\n'

async function smtpSend(
  host: string,
  port: number,
  user: string,
  pass: string,
  from: string,
  to: string[],
  subject: string,
  htmlBody: string,
  attachment?: { filename: string; content: string; encoding: string },
): Promise<void> {
  const conn = await Deno.connectTls({ hostname: host, port })
  const writer = conn.writable.getWriter()

  async function send(line: string) {
    await writer.write(encoder.encode(line + CRLF))
  }

  async function read(): Promise<string> {
    const buf = new Uint8Array(8192)
    const n = await conn.read(buf)
    return decoder.decode(buf.subarray(0, n ?? 0))
  }

  async function readMulti(): Promise<string> {
    let result = ''
    for (;;) {
      const data = await read()
      result += data
      if (data.length === 0) break
      const lines = result.split(CRLF)
      const last = lines[lines.length - 2] ?? lines[lines.length - 1] ?? ''
      if (last.length >= 4 && last[3] === ' ') break
    }
    return result
  }

  // Greeting
  await read()

  // EHLO
  await send('EHLO invoicerpro')
  await readMulti()

  // AUTH LOGIN
  await send('AUTH LOGIN')
  await readMulti()
  await send(btoa(user))
  await readMulti()
  await send(btoa(pass))
  const authResp = await readMulti()
  if (!authResp.includes('235')) throw new Error('Authentication failed')

  // MAIL FROM — extract bare email from "Name <email>" format
  const bareFrom = from.replace(/^.*<(.+)>.*$/, '$1')
  await send(`MAIL FROM:<${bareFrom}>`)
  await readMulti()

  // RCPT TO
  for (const addr of to) {
    await send(`RCPT TO:<${addr}>`)
    await readMulti()
  }

  // DATA
  await send('DATA')
  await readMulti()

  // MIME message
  const boundary = `----=_Part_${Date.now()}`
  let mime = ''
  mime += `From: ${from}${CRLF}`
  mime += `To: ${to.join(', ')}${CRLF}`
  mime += `Subject: ${subject}${CRLF}`
  mime += `MIME-Version: 1.0${CRLF}`

  if (attachment) {
    mime += `Content-Type: multipart/mixed; boundary="${boundary}"${CRLF}${CRLF}`
    mime += `--${boundary}${CRLF}`
    mime += `Content-Type: text/html; charset="UTF-8"${CRLF}${CRLF}`
    mime += `${htmlBody}${CRLF}${CRLF}`
    mime += `--${boundary}${CRLF}`
    mime += `Content-Type: application/pdf; name="${attachment.filename}"${CRLF}`
    mime += `Content-Disposition: attachment; filename="${attachment.filename}"${CRLF}`
    mime += `Content-Transfer-Encoding: base64${CRLF}${CRLF}`
    mime += `${attachment.content}${CRLF}${CRLF}`
    mime += `--${boundary}--`
  } else {
    mime += `Content-Type: text/html; charset="UTF-8"${CRLF}${CRLF}`
    mime += htmlBody
  }

  for (const line of mime.split(CRLF)) {
    await send(line.startsWith('.') ? `.${line}` : line)
  }

  await send('.')
  await readMulti()

  await send('QUIT')
  await readMulti()

  await writer.releaseLock()
  await conn.close()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { to, subject, html, pdfBase64, pdfFilename } = await req.json()

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html')
    }

    const host = Deno.env.get('SMTP_HOST') ?? 'smtp.gmail.com'
    const port = Number(Deno.env.get('SMTP_PORT') ?? 465)
    const user = Deno.env.get('SMTP_USER')!
    const pass = Deno.env.get('SMTP_PASS')!
    const from = Deno.env.get('SMTP_FROM') ?? user

    if (!user || !pass) throw new Error('SMTP_USER and SMTP_PASS must be set')

    const attachment = pdfBase64
      ? { filename: pdfFilename ?? 'document.pdf', content: pdfBase64, encoding: 'base64' }
      : undefined

    await smtpSend(
      host, port, user, pass, from,
      Array.isArray(to) ? to : [to],
      subject, html, attachment,
    )

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
