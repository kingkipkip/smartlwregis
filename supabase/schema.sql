-- Create custom types
CREATE TYPE user_role AS ENUM ('teacher', 'staff', 'head', 'admin', 'guest');
CREATE TYPE request_status AS ENUM ('pending', 'processing', 'waiting_approval', 'rejected', 'completed');
CREATE TYPE grade_type AS ENUM ('4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส', 'ขส', 'ผ', 'มผ');
CREATE TYPE semester_type AS ENUM ('1', '2', 'Summer');
CREATE TYPE department_type AS ENUM (
  'Thai', 
  'Math', 
  'Science', 
  'Social', 
  'Health', 
  'Art', 
  'Career', 
  'Foreign', 
  'Activity'
);

-- Profiles table (Extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT, -- Added email
  role user_role NOT NULL DEFAULT 'teacher',
  department department_type,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requests table
CREATE TABLE requests (
  id TEXT PRIMARY KEY, -- Format: REQ-YY-XXX
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Student Info (Snapshot)
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  
  -- Subject Info
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  department department_type NOT NULL,
  semester semester_type NOT NULL,
  academic_year TEXT NOT NULL, -- "2567"
  
  -- Grade Info
  grade_old grade_type NOT NULL,
  grade_new grade_type NOT NULL,
  
  reason TEXT NOT NULL CHECK (char_length(reason) <= 200),
  
  status request_status NOT NULL DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request Logs / History
CREATE TABLE request_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL, -- e.g., "Submitted", "Approved", "Rejected", "Requested Change"
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

-- Profiles:
-- Everyone can read their own profile.
-- Staff, Head, Admin can read all profiles (to see who requested).
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to avoid RLS recursion
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

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Staff/Head/Admin can read all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR has_role(ARRAY['staff'::user_role, 'head'::user_role, 'admin'::user_role])
  );

-- Admin can update profiles (Role Management)
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE
  USING (
    has_role(ARRAY['admin'::user_role])
  );

-- Requests:
-- Teacher: Can insert. Can select own.
-- Staff/Head: Can select all. Can update status.
-- Student: Can select if matches student_id + dob (handled via separate public function or specialized query, strictly speaking they don't have DB users).
-- For now, let's stick to Authed users (Teachers/Staff). Student tracking will likely use a secure RPC or public readonly view with tight filters.

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can see own requests" ON requests
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert requests" ON requests
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

-- Staff, Head, Admin can see all requests
CREATE POLICY "Staff/Head/Admin can view all requests" ON requests
  FOR SELECT USING (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('staff', 'head', 'admin')
    )
  );

-- Staff, Head, Admin can update requests
CREATE POLICY "Staff/Head/Admin can update requests" ON requests
  FOR UPDATE USING (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('staff', 'head', 'admin')
    )
  );

-- Request Logs:
-- Visible to relevant parties.
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View logs for visible requests" ON request_logs
  FOR SELECT USING (
    exists (
      select 1 from requests
      where requests.id = request_logs.request_id
      -- This relies on the user having select access to the request, 
      -- but RLS inside RLS can be tricky or performance heavy.
      -- Simplified: User is teacher of request OR is staff/head/admin
      and (
        requests.teacher_id = auth.uid() OR
        exists (
            select 1 from profiles
            where id = auth.uid() and role in ('staff', 'head', 'admin')
        )
      )
    )
  );

-- Functions needed
-- Function to handle new user signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email, department)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'guest', 
    new.email,
    (new.raw_user_meta_data->>'department')::public.department_type
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Student Table
CREATE TABLE students (
    id TEXT PRIMARY KEY, -- Student ID (e.g., "12345")
    full_name TEXT NOT NULL,
    email TEXT,
    class TEXT, -- e.g., "ม.4/1"
    department department_type,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 1. All staff (Teacher, Staff, Head, Admin) can VIEW students
CREATE POLICY "Staff can view students" ON students
    FOR SELECT USING (
        has_role(ARRAY['teacher'::user_role, 'staff'::user_role, 'head'::user_role, 'admin'::user_role])
    );

-- 2. Only Head and Admin can MANAGE (Insert/Update/Delete) students
CREATE POLICY "Head and Admin can manage students" ON students
    FOR ALL USING (
        has_role(ARRAY['head'::user_role, 'admin'::user_role])
    );

