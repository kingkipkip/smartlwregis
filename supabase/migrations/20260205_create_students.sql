-- Student Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY, -- Student ID (e.g., "12345")
    full_name TEXT NOT NULL,
    email TEXT,
    class TEXT, -- e.g., "ม.4/1"
    department department_type,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 1. All staff (Teacher, Staff, Head, Admin) can VIEW students
CREATE POLICY "Staff can view students" ON public.students
    FOR SELECT USING (
        has_role(ARRAY['teacher'::user_role, 'staff'::user_role, 'head'::user_role, 'admin'::user_role])
    );

-- 2. Only Head and Admin can MANAGE (Insert/Update/Delete) students
CREATE POLICY "Head and Admin can manage students" ON public.students
    FOR ALL USING (
        has_role(ARRAY['head'::user_role, 'admin'::user_role])
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
