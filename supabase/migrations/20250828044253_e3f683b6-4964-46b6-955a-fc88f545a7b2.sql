-- Insert categories
INSERT INTO public.categories (name, description) VALUES
('Environmental', 'Activities focused on environmental conservation and sustainability'),
('Education', 'Educational programs and teaching opportunities'),
('Healthcare', 'Health-related volunteer activities and medical camps'),
('Community Development', 'Community building and social development programs');

-- Enable realtime for activities table
ALTER TABLE activities REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE activities;

-- Enable realtime for registrations table  
ALTER TABLE registrations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE registrations;

-- Enable realtime for categories table  
ALTER TABLE categories REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE categories;