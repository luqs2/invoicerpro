ALTER TABLE public.invoice_templates ADD COLUMN show_line_item_date BOOLEAN DEFAULT false;

ALTER TABLE public.invoice_templates ADD COLUMN show_line_item_vehicle_no BOOLEAN DEFAULT false;

ALTER TABLE public.invoice_templates ADD COLUMN show_line_item_uom BOOLEAN DEFAULT false;
