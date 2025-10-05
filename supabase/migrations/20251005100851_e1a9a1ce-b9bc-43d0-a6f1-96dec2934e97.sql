-- Add NGO verification fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN darpan_id text,
ADD COLUMN registration_cert_url text,
ADD COLUMN pan_url text,
ADD COLUMN verification_status text DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
ADD COLUMN verified_at timestamp with time zone,
ADD COLUMN verification_notes text;

-- Create storage bucket for NGO verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('ngo-verification-docs', 'ngo-verification-docs', false);

-- NGOs can upload their own verification documents
CREATE POLICY "NGOs can upload their verification documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ngo-verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'NGO'
  )
);

-- NGOs can view their own verification documents
CREATE POLICY "NGOs can view their own verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ngo-verification-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ngo-verification-docs'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- NGOs can update their own verification documents
CREATE POLICY "NGOs can update their own verification documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ngo-verification-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add index for faster queries on verification status
CREATE INDEX idx_profiles_verification_status ON public.profiles(verification_status);

-- Add RLS policy for NGOs to update their own verification fields
CREATE POLICY "NGOs can update their own verification info"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id AND role = 'NGO')
WITH CHECK (auth.uid() = id AND role = 'NGO');

-- Add RLS policy for admins to update verification status
CREATE POLICY "Admins can update NGO verification status"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));