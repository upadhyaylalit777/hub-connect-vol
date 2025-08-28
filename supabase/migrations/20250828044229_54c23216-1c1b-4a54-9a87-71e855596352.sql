-- Insert categories first
INSERT INTO public.categories (name, description) VALUES
('Environmental', 'Activities focused on environmental conservation and sustainability'),
('Education', 'Educational programs and teaching opportunities'),
('Healthcare', 'Health-related volunteer activities and medical camps'),
('Community Development', 'Community building and social development programs');

-- Insert some NGO profiles
INSERT INTO public.profiles (id, name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Green Earth Foundation', 'NGO'),
('22222222-2222-2222-2222-222222222222', 'Digital Learning Hub', 'NGO'),
('33333333-3333-3333-3333-333333333333', 'Health for All', 'NGO'),
('44444444-4444-4444-4444-444444444444', 'Community Builders', 'NGO');

-- Get category IDs for reference
-- We'll use the categories we just inserted
INSERT INTO public.activities (
  title, 
  description, 
  author_id, 
  category_id, 
  date, 
  time, 
  location, 
  max_volunteers, 
  image_url,
  requirements,
  status
) VALUES
(
  'Tree Plantation Drive',
  'Join us for a community tree plantation drive to help restore the natural ecosystem and create a greener future for our city.',
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM categories WHERE name = 'Environmental' LIMIT 1),
  '2025-08-25',
  '09:00:00',
  'Vetal Tekdi, Pune',
  25,
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=250&fit=crop',
  'Comfortable clothing, water bottle, and enthusiasm',
  'PUBLISHED'
),
(
  'Teaching Kids Digital Skills',
  'Help underprivileged children learn basic computer skills and digital literacy to bridge the technology gap.',
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM categories WHERE name = 'Education' LIMIT 1),
  '2025-08-27',
  '10:00:00',
  'Community Center, Koregaon Park',
  15,
  'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=250&fit=crop',
  'Basic computer knowledge preferred',
  'PUBLISHED'
),
(
  'Health Checkup Camp',
  'Volunteer to assist in organizing free health checkups and awareness programs for underprivileged communities.',
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1),
  '2025-08-30',
  '08:00:00',
  'Shivaji Nagar, Pune',
  30,
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop',
  'Medical background preferred but not required',
  'PUBLISHED'
),
(
  'Community Kitchen Setup',
  'Help set up and organize a community kitchen to provide nutritious meals to those in need.',
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM categories WHERE name = 'Community Development' LIMIT 1),
  '2025-09-02',
  '11:00:00',
  'Swargate, Pune',
  20,
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop',
  'Willingness to work with food preparation',
  'PUBLISHED'
),
(
  'Beach Cleanup Drive',
  'Join our weekend beach cleanup drive to protect marine life and keep our coastlines clean and beautiful.',
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM categories WHERE name = 'Environmental' LIMIT 1),
  '2025-09-05',
  '07:00:00',
  'Alibaug Beach',
  50,
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=250&fit=crop',
  'Gloves and reusable water bottle',
  'PUBLISHED'
),
(
  'Adult Literacy Program',
  'Teach reading and writing skills to adults who missed formal education opportunities. Make a lasting impact on lives.',
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM categories WHERE name = 'Education' LIMIT 1),
  '2025-09-08',
  '16:00:00',
  'Hadapsar, Pune',
  12,
  'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=250&fit=crop',
  'Patience and teaching aptitude',
  'PUBLISHED'
);

-- Insert some dummy registrations
INSERT INTO public.registrations (volunteer_id, activity_id, status) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM activities WHERE title = 'Tree Plantation Drive' LIMIT 1), 'APPROVED'),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM activities WHERE title = 'Tree Plantation Drive' LIMIT 1), 'PENDING'),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM activities WHERE title = 'Teaching Kids Digital Skills' LIMIT 1), 'APPROVED'),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM activities WHERE title = 'Health Checkup Camp' LIMIT 1), 'APPROVED');

-- Enable realtime for activities table
ALTER TABLE activities REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE activities;

-- Enable realtime for registrations table  
ALTER TABLE registrations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE registrations;