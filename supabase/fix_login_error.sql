-- ==========================================
-- FIX & VERIFY SCHEMA INTEGRITY
-- ==========================================

-- 1. Reload PostgREST Schema Cache (Fixes "querying schema" errors)
NOTIFY pgrst, 'reload schema';

-- 2. Ensure Profile RLS is robust (Avoid recursion)
-- We'll use a more direct check for the role bypass
CREATE OR REPLACE FUNCTION public.has_role(target_roles user_role[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We use a subquery to avoid any potential RLS trigger on the main query context
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(target_roles)
  );
END;
$$;

-- 3. Cleanup manually inserted users that might be broken
-- (Only if you haven't started using them for real data)
-- DELETE FROM auth.users WHERE email IN ('admin@test.com', 'teacher@test.com', 'staff@test.com', 'head@test.com');
-- DELETE FROM public.profiles WHERE email IN ('admin@test.com', 'teacher@test.com', 'staff@test.com', 'head@test.com');

-- 4. Verify the trigger works correctly even if department is null
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email, department)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'guest', 
    new.email,
    CASE 
      WHEN new.raw_user_meta_data->>'department' IS NOT NULL 
      THEN (new.raw_user_meta_data->>'department')::public.department_type 
      ELSE NULL 
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Final Reset for Student Tracking policies (Ensure they are clean)
DROP POLICY IF EXISTS "Public can lookup student by ID" ON public.students;
CREATE POLICY "Public can lookup student by ID" ON public.students
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can view own requests" ON public.requests;
CREATE POLICY "Public can view own requests" ON public.requests
FOR SELECT TO anon, authenticated USING (true);
