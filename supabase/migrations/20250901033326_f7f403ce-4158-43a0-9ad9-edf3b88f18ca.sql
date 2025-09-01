-- First, let me check if there's a unique constraint that needs to be dropped
-- and handle the review functionality properly

-- Add a unique constraint to prevent duplicate reviews by same user for same activity
-- But first drop existing constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reviews_reviewer_id_activity_id_key'
  ) THEN
    ALTER TABLE reviews DROP CONSTRAINT reviews_reviewer_id_activity_id_key;
  END IF;
END $$;

-- Add the unique constraint properly
ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_activity_id_unique 
UNIQUE (reviewer_id, activity_id);

-- Add RLS policy for NGOs to approve/reject reviews for their activities
CREATE POLICY "NGOs can update reviews for their activities" 
ON reviews 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM activities 
    WHERE activities.id = reviews.activity_id 
    AND activities.author_id = auth.uid()
  )
);

-- Enable realtime for reviews table
ALTER TABLE reviews REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;