# InvoicerPro

Web-based invoicing and receipt management system built with **Ionic Vue + Tailwind CSS + Supabase**.

## Tech Stack

| Layer | Tech |
|---|---|
| UI Framework | Ionic Vue 8 |
| Styling | Tailwind CSS 3 |
| State Management | Pinia |
| Backend / Auth | Supabase |
| PDF Export | jsPDF + html2canvas |
| Email Sending | Resend (via Supabase Edge Function) |
| Language | TypeScript |

## Project Structure

```
invoicerpro/
├── src/
│   ├── assets/            # Tailwind CSS entry
│   ├── components/
│   │   ├── invoice/       # InvoiceListItem, InvoicePreview
│   │   ├── client/        # ClientCard
│   │   ├── receipt/
│   │   └── template/      # TemplateCard
│   ├── composables/
│   │   ├── usePdf.ts      # jsPDF + html2canvas export
│   │   ├── useToast.ts    # Ionic toast helper
│   │   └── useFormatters.ts
│   ├── layouts/
│   │   ├── AppLayout.vue  # Tab bar layout
│   │   └── AuthLayout.vue
│   ├── pages/
│   │   ├── auth/          # Login, Register
│   │   ├── dashboard/     # Dashboard with stats
│   │   ├── invoices/      # InvoicesPage, InvoiceBuilderPage
│   │   ├── receipts/      # ReceiptsPage, ReceiptBuilderPage
│   │   ├── clients/       # ClientsPage, ClientDetailPage
│   │   ├── templates/     # TemplatesPage (customiser)
│   │   └── settings/      # SettingsPage
│   ├── router/index.ts    # Vue Router with auth guard
│   ├── services/          # Supabase query wrappers
│   │   ├── supabase.ts
│   │   ├── invoices.ts
│   │   ├── clients.ts
│   │   ├── receipts.ts
│   │   └── templates.ts
│   ├── stores/            # Pinia stores
│   │   ├── auth.ts
│   │   ├── invoices.ts
│   │   ├── clients.ts
│   │   └── templates.ts
│   ├── theme/variables.css  # Ionic CSS variables (dark theme)
│   └── types/index.ts     # All TypeScript interfaces
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── functions/
│       ├── generate-pdf/index.ts
│       └── send-invoice/index.ts   # Uses Resend API
└── public/
```

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd invoicerpro
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste and run `supabase/migrations/001_initial_schema.sql`
3. Copy your Project URL and anon key

### 3. Configure environment

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 4. Run locally

```bash
npm run dev
# or
ionic serve
```

## Supabase Schema Overview

```
auth.users          (managed by Supabase Auth)
  └── profiles      (1:1 — display name, avatar)
  └── business_profiles (1:1 — biz name, logo, invoice prefix, tax defaults)
  └── clients       (1:N — client contacts)
  └── invoice_templates (system + user custom templates)
  └── invoices      (1:N — line_items stored as JSONB)
  └── receipts      (1:N — linked to invoice optionally)
```

**Row Level Security** is enabled on all tables — users only see their own data.

## Features

- ✅ Invoice builder with live preview
- ✅ Line items with auto-calculated totals + tax
- ✅ 6 built-in templates + full customiser (colours, font, radius)
- ✅ Client management
- ✅ Receipt maker
- ✅ PDF export (client-side via jsPDF)
- ✅ Email sending via Supabase Edge Function + Resend
- ✅ Supabase Auth (email/password)
- ✅ Dark theme with Ionic + Tailwind

## Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

supabase login
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxx

# Deploy
supabase functions deploy send-invoice
supabase functions deploy generate-pdf
```

## PDF Export

Client-side export uses `jsPDF` + `html2canvas` — renders the `<InvoicePreview>` component as a canvas and converts to PDF. No server needed.

For server-side PDF (e.g. when emailing automatically), extend the `generate-pdf` Edge Function with a headless browser service like [Browserless](https://browserless.io) or [HTML/CSS to PDF API](https://pdfshift.io).

## Customisation

Template colours, fonts, and border radius are stored in `invoice_templates` table. System templates are read-only; users create their own copies. The `InvoicePreview.vue` component reads CSS variables from the active template and applies them inline.
