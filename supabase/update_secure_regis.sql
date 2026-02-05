-- Add 'guest' role type
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';

-- Update handle_new_user to default to 'guest'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'guest', new.email); -- Default to guest
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS for Requests to EXCLUDE guest
-- (Existing policies usually check for teacher_id = uid, but 'guest' won't be in teacher_id unless promoted? 
-- Wait, if they are 'guest', they shouldn't insert.
-- Policy "Teachers can insert requests" says (teacher_id = auth.uid()). 
-- But we should also enforce that the user's role IS 'teacher' in the check?
-- Or rely on UI? Safer to enforce in DB.)

DROP POLICY IF EXISTS "Teachers can insert requests" ON requests;

CREATE POLICY "Teachers can insert requests" ON requests
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'teacher'
    )
  );
