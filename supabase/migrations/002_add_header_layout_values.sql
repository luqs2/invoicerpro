alter table public.invoice_templates
  drop constraint if exists invoice_templates_header_layout_check;

alter table public.invoice_templates
  add constraint invoice_templates_header_layout_check
    check (header_layout in ('classic', 'inline', 'centered', 'minimal', 'bold', 'split', 'professional'));
