-- Fix security warnings by setting search_path for functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Create function to handle user registration with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', (NEW.raw_user_meta_data->>'role')::user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update timestamps with proper search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_activities ON public.activities;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_activities
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();