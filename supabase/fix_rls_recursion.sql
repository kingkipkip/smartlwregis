-- Create a function to check user roles without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(target_roles user_role[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role IN (SELECT unnest(target_roles))
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Drop recursive policies
DROP POLICY IF EXISTS "Staff/Head/Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- Re-create policies using the helper function
CREATE POLICY "Staff/Head/Admin can read all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR has_role(ARRAY['staff'::user_role, 'head'::user_role, 'admin'::user_role])
  );

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    has_role(ARRAY['admin'::user_role])
  );
