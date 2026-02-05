-- ==========================================
-- FIX REQUEST LOGS ACCESS & POLICIES
-- ==========================================

-- 1. Fix the recursive has_role function
-- Use the SECURITY DEFINER version that avoids re-checking RLS on profiles indirectly
CREATE OR REPLACE FUNCTION public.has_role(target_roles user_role[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- We check directly if the role is in the array for the current user ID
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(target_roles)
  );
END;
$$;

-- 2. Ensure request_logs has correct policies
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;

-- Allow Insert for Staff/Head/Admin/Teacher (Teacher logs their own submissions)
DROP POLICY IF EXISTS "Anyone authorized can insert logs" ON public.request_logs;
CREATE POLICY "Anyone authorized can insert logs" ON public.request_logs
FOR INSERT WITH CHECK (
    auth.uid() = actor_id -- Must match the current user
);

-- Allow Select for relevant parties (Teacher of the request OR Staff/Head/Admin)
DROP POLICY IF EXISTS "View logs for visible requests" ON public.request_logs;
CREATE POLICY "View logs for visible requests" ON public.request_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.requests
        WHERE requests.id = request_logs.request_id
        AND (
            requests.teacher_id = auth.uid() OR
            public.has_role(ARRAY['staff'::user_role, 'head'::user_role, 'admin'::user_role])
        )
    )
);

-- 3. Reload schema cache just in case
NOTIFY pgrst, 'reload schema';
