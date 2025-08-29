-- Add completion status to registrations table
ALTER TABLE public.registrations 
ADD COLUMN completed_by_ngo BOOLEAN DEFAULT FALSE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Add review approval system
ALTER TABLE public.reviews 
ADD COLUMN approved_by_ngo BOOLEAN DEFAULT FALSE,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX idx_registrations_completed ON public.registrations(completed_by_ngo);
CREATE INDEX idx_reviews_approved ON public.reviews(approved_by_ngo);

-- Update existing reviews to be approved for backwards compatibility
UPDATE public.reviews SET approved_by_ngo = TRUE, approved_at = NOW();