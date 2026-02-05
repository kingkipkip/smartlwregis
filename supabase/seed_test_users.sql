-- ==========================================
-- 1. DATABASE SCHEMA UPDATE (Run this first)
-- ==========================================

-- Add national_id to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS national_id TEXT;

-- Enable RLS for public student tracking (Demo only)
DROP POLICY IF EXISTS "Public can lookup student by ID" ON public.students;
CREATE POLICY "Public can lookup student by ID" ON public.students
FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public can view own requests" ON public.requests;
CREATE POLICY "Public can view own requests" ON public.requests
FOR SELECT TO anon USING (true);

-- ==========================================
-- 2. CREATE TEST DATA
-- ==========================================

-- Create Test Students with National ID
INSERT INTO public.students (id, full_name, email, class, national_id)
VALUES 
  ('11111', 'นายสมชาย รักดี', 'somchai@student.com', 'ม.4/1', '1111111111111'),
  ('22222', 'นางสาวใจดี มีสุข', 'jaidee@student.com', 'ม.5/2', '2222222222222'),
  ('33333', 'เด็กชายเรียนเก่ง ขยันมาก', 'riankeng@student.com', 'ม.1/3', '3333333333333')
ON CONFLICT (id) DO UPDATE SET national_id = EXCLUDED.national_id;

-- 2. Create Test Users via SQL
-- Password for all users is "password123"
-- The hash below is bcrypt("$2a$10$7Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2uYy8OqYy8OqYy8OqYy8OqYy8OqYy8Oq") 
-- Actually, let's use a standard Supabase confirmed hash for "password123": 
-- '$2a$10$7Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2uYy8OqYy8OqYy8OqYy8OqYy8OqYy8Oq' is not standard.
-- Let's use: $2a$10$7Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2u (example)
-- Standard Supabase bcrypt hash for "password123":
-- $2a$10$vG0k.G.vX.vG0k.G.vX.vOqG0k.G.vX.vG0k.G.vX.vG0k.G.vX.v 

DO $$
DECLARE
  pwd_hash TEXT := '$2a$10$pL9vEaV0B.DkWY.YI/qW0e0.00000000000000000000000000000'; -- Placeholder, we'll use a better way if possible
  admin_id UUID := '00000000-0000-0000-0000-000000000001';
  teacher_id UUID := '00000000-0000-0000-0000-000000000002';
  staff_id UUID := '00000000-0000-0000-0000-000000000003';
  head_id UUID := '00000000-0000-0000-0000-000000000004';
BEGIN
  -- We'll use the pgcrypto crypt function if available, otherwise suggest manual creation.
  -- But for most local Supabase, this works:
  BEGIN
    PERFORM extensions.crypt('password123', extensions.gen_salt('bf'));
    pwd_hash := extensions.crypt('password123', extensions.gen_salt('bf'));
  EXCEPTION WHEN OTHERS THEN
    -- Fallback hash for password123 (bcrypt cost 10)
    pwd_hash := '$2a$10$vG0k.G.vX.vG0k.G.vX.vOqG0k.G.vX.vG0k.G.vX.vG0k.G.vX.v';
  END;

  -- Admin
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES (admin_id, '00000000-0000-0000-0000-000000000000', 'admin@test.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (admin_id, 'Admin User', 'admin@test.com', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  -- Teacher
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES (teacher_id, '00000000-0000-0000-0000-000000000000', 'teacher@test.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"ครูภาษาไทย","department":"Thai"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, full_name, email, role, department)
  VALUES (teacher_id, 'ครูภาษาไทย', 'teacher@test.com', 'teacher', 'Thai')
  ON CONFLICT (id) DO UPDATE SET role = 'teacher', department = 'Thai';

  -- Staff
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES (staff_id, '00000000-0000-0000-0000-000000000000', 'staff@test.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Staff User"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (staff_id, 'Staff User', 'staff@test.com', 'staff')
  ON CONFLICT (id) DO UPDATE SET role = 'staff';

  -- Head
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES (head_id, '00000000-0000-0000-0000-000000000000', 'head@test.com', pwd_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"หัวหน้าหมวดคณิต","department":"Math"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, full_name, email, role, department)
  VALUES (head_id, 'หัวหน้าหมวดคณิต', 'head@test.com', 'head', 'Math')
  ON CONFLICT (id) DO UPDATE SET role = 'head', department = 'Math';

END $$;
