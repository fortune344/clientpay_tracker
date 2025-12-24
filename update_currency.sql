-- Add currency column to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';

-- Add check constraint for supported currencies (optional, but good for data integrity)
-- We won't enforce a strict check yet to allow adding more easily, 
-- but ensuring it's 3 chars is compatible with ISO codes.
ALTER TABLE public.payments 
ADD CONSTRAINT currency_length CHECK (char_length(currency) = 3);
