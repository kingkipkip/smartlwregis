-- Fix RLS Policies for Requests
-- Drop existing policies to start fresh and clean
DROP POLICY IF EXISTS "Teachers can see own requests" ON public.requests;
DROP POLICY IF EXISTS "Teachers can insert requests" ON public.requests;
DROP POLICY IF EXISTS "Staff/Head/Admin can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Staff/Head/Admin can update requests" ON public.requests;

-- 1. INSERT: Any authenticated user can insert a request as long as they are the teacher
-- We use 'WITH CHECK' to ensure the teacher_id matches the auth.uid()
CREATE POLICY "Enable insert for authenticated users" ON public.requests
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = teacher_id);

-- 2. SELECT:
-- Teachers see their own
CREATE POLICY "Enable select for users own requests" ON public.requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = teacher_id);

-- Staff, Head, Admin see all
CREATE POLICY "Enable select for staff/head/admin" ON public.requests
    FOR SELECT
    TO authenticated
    USING (
        exists (
            select 1 from profiles
            where id = auth.uid() and role in ('staff', 'head', 'admin')
        )
    );

-- 3. UPDATE: Staff, Head, Admin can update (for status changes)
-- We also allow the teacher to update if it's still pending or rejected (optional refinement)
CREATE POLICY "Enable update for staff/head/admin" ON public.requests
    FOR UPDATE
    TO authenticated
    USING (
        exists (
            select 1 from profiles
            where id = auth.uid() and role in ('staff', 'head', 'admin')
        )
    );

-- 4. DELETE: Admin only (optional)
CREATE POLICY "Enable delete for admins" ON public.requests
    FOR DELETE
    TO authenticated
    USING (
        exists (
            select 1 from profiles
            where id = auth.uid() and role = 'admin'
        )
    );
