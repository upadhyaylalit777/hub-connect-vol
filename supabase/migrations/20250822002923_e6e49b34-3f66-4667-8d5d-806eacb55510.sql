-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('VOLUNTEER', 'NGO', 'ADMIN');

-- Create enum for activity categories
CREATE TYPE activity_category AS ENUM ('ENVIRONMENTAL', 'EDUCATION', 'HEALTH', 'COMMUNITY', 'DISASTER_RELIEF', 'ANIMAL_WELFARE', 'ARTS_CULTURE', 'SOCIAL_SERVICES');

-- Create enum for registration status
CREATE TYPE registration_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'VOLUNTEER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  date DATE,
  time TIME,
  location TEXT,
  image_url TEXT,
  requirements TEXT,
  max_volunteers INTEGER,
  status TEXT DEFAULT 'PUBLISHED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'PENDING',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(volunteer_id, activity_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, activity_id)
);

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('ENVIRONMENTAL', 'Environmental conservation and sustainability'),
  ('EDUCATION', 'Educational support and literacy programs'),
  ('HEALTH', 'Healthcare and wellness initiatives'),
  ('COMMUNITY', 'Community development and support'),
  ('DISASTER_RELIEF', 'Emergency response and disaster relief'),
  ('ANIMAL_WELFARE', 'Animal care and protection'),
  ('ARTS_CULTURE', 'Arts, culture, and creative programs'),
  ('SOCIAL_SERVICES', 'Social services and support programs');

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for categories table (public read)
CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories FOR SELECT 
  USING (true);

-- RLS Policies for activities table
CREATE POLICY "Activities are viewable by everyone" 
  ON public.activities FOR SELECT 
  USING (true);

CREATE POLICY "NGOs can create activities" 
  ON public.activities FOR INSERT 
  WITH CHECK (
    auth.uid() = author_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('NGO', 'ADMIN'))
  );

CREATE POLICY "Authors can update their own activities" 
  ON public.activities FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own activities" 
  ON public.activities FOR DELETE 
  USING (auth.uid() = author_id);

-- RLS Policies for registrations table
CREATE POLICY "Users can view their own registrations" 
  ON public.registrations FOR SELECT 
  USING (auth.uid() = volunteer_id);

CREATE POLICY "Activity authors can view registrations for their activities" 
  ON public.registrations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.activities 
      WHERE id = activity_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Volunteers can create their own registrations" 
  ON public.registrations FOR INSERT 
  WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "Volunteers can delete their own registrations" 
  ON public.registrations FOR DELETE 
  USING (auth.uid() = volunteer_id);

CREATE POLICY "Activity authors can update registration status" 
  ON public.registrations FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.activities 
      WHERE id = activity_id AND author_id = auth.uid()
    )
  );

-- RLS Policies for reviews table
CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own reviews" 
  ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews FOR UPDATE 
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews FOR DELETE 
  USING (auth.uid() = reviewer_id);

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', (NEW.raw_user_meta_data->>'role')::user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_activities
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();