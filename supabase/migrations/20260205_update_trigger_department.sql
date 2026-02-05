-- Update the handle_new_user trigger function to include department
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
