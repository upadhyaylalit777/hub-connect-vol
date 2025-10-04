-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create volunteer_details table to store detailed volunteer information
CREATE TABLE public.volunteer_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth date NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  motivation_skills text NOT NULL,
  emergency_contact_name text NOT NULL,
  emergency_contact_phone text NOT NULL,
  government_id_url text NOT NULL,
  policy_consent boolean NOT NULL DEFAULT false,
  background_check_consent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteer_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own details"
  ON public.volunteer_details
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own details"
  ON public.volunteer_details
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own details"
  ON public.volunteer_details
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "NGOs can view volunteer details for their activity registrations"
  ON public.volunteer_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM registrations r
      JOIN activities a ON r.activity_id = a.id
      WHERE r.volunteer_id = volunteer_details.user_id
        AND a.author_id = auth.uid()
    )
  );

-- Create storage bucket for government IDs
INSERT INTO storage.buckets (id, name, public)
VALUES ('government-ids', 'government-ids', false);

-- Storage policies for government IDs
CREATE POLICY "Users can upload their own government ID"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'government-ids' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own government ID"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'government-ids' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "NGOs can view government IDs of volunteers registered for their activities"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'government-ids'
    AND EXISTS (
      SELECT 1
      FROM registrations r
      JOIN activities a ON r.activity_id = a.id
      WHERE r.volunteer_id::text = (storage.foldername(name))[1]
        AND a.author_id = auth.uid()
    )
  );

-- Update trigger for volunteer_details
CREATE TRIGGER update_volunteer_details_updated_at
  BEFORE UPDATE ON public.volunteer_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();