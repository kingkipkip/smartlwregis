-- Add email column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update trigger to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'teacher', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for Admin to update profiles
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE
  USING (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Ensure Admins can select all profiles (Already exists but good to verify)
-- CREATE POLICY "Staff/Head/Admin can read all profiles" ... (Existing)
