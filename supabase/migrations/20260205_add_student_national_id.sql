-- Migration to add national_id to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS national_id TEXT;

-- Update existing records with a placeholder if needed (optional)
-- UPDATE public.students SET national_id = '0000000000000' WHERE national_id IS NULL;
