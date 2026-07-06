# Email Setup Guide (Google SMTP)

Sends invoices and receipts via email with **PDF attached automatically**, using your Gmail account through a Supabase Edge Function.

## Step 1: Create a Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required for app passwords)
3. Go to https://myaccount.google.com/apppasswords
4. Select **Mail** and **Other (Custom name)** → name it "InvoicerPro"
5. Click **Generate**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

## Step 2: Set Supabase Edge Function Secrets

Go to your Supabase Dashboard → **Edge Functions** → **Secrets** and add:

| Secret | Value |
|--------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your-gmail@gmail.com |
| `SMTP_PASS` | your-16-char-app-password (no spaces) |
| `SMTP_FROM` | Your Business Name \<your-gmail@gmail.com\> |

## Step 3: Deploy the Edge Function

```bash
supabase functions deploy send-email
```

## Step 4: Restart Dev Server

```bash
npm run dev
```

Email sending with PDF attachment will now work from the Invoice Builder and Receipt Builder pages.

## How It Works

1. User clicks "Send Email" in the send dialog
2. Client renders the invoice/receipt preview to PDF (base64)
3. Client calls the `send-email` Supabase Edge Function
4. Edge Function sends email via Google SMTP with the PDF attached
5. Client shows success toast

## Notes

- **PDF is attached automatically** — no manual sharing needed
- **Free** — uses your Gmail account, no third-party email service needed
- **Rate limits** — Gmail allows ~500 emails/day for regular accounts, ~2000/day for Google Workspace
- **WhatsApp** — PDF must be shared separately (download + attach manually)

## Troubleshooting

- **"Authentication unsuccessful"** — App password may be wrong or 2FA not enabled
- **"Relay access denied"** — Check SMTP_HOST and SMTP_PORT are correct
- **PDF not attaching** — Check Edge Function logs in Supabase Dashboard


