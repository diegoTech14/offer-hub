-- Seed mock projects for testing
-- This migration creates 15 sample projects with varying statuses

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the first user ID (or create a default one if none exists)
  SELECT id INTO v_user_id FROM users LIMIT 1;
  
  -- If no users exist, create a default test user
  IF v_user_id IS NULL THEN
    INSERT INTO users (email, password_hash, name, role)
    VALUES ('test@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Test User', 'client')
    RETURNING id INTO v_user_id;
  END IF;

  -- Insert 15 mock projects
  INSERT INTO projects (client_id, title, description, category, budget, status, created_at)
  VALUES
    (v_user_id, 'E-commerce Website Development', 'Build a modern e-commerce platform with payment integration and user authentication', 'development', 5000.00, 'active', NOW() - INTERVAL '5 days'),
    (v_user_id, 'Mobile App UI/UX Design', 'Design a beautiful and intuitive mobile app interface for iOS and Android', 'design', 2500.00, 'active', NOW() - INTERVAL '3 days'),
    (v_user_id, 'Social Media Marketing Campaign', 'Create and manage a 3-month social media marketing campaign across platforms', 'marketing', 3500.00, 'active', NOW() - INTERVAL '7 days'),
    (v_user_id, 'Logo and Brand Identity', 'Design a unique logo and complete brand identity package', 'design', 1500.00, 'completed', NOW() - INTERVAL '30 days'),
    (v_user_id, 'React Native Mobile App', 'Develop a cross-platform mobile application using React Native', 'development', 8000.00, 'active', NOW() - INTERVAL '10 days'),
    (v_user_id, 'SEO Optimization Service', 'Improve website SEO and search engine rankings', 'marketing', 2000.00, 'completed', NOW() - INTERVAL '45 days'),
    (v_user_id, 'WordPress Website Setup', 'Set up and customize a WordPress website with theme and plugins', 'development', 1200.00, 'completed', NOW() - INTERVAL '20 days'),
    (v_user_id, 'Product Photography', 'Professional photography for 50 products with editing', 'design', 1800.00, 'active', NOW() - INTERVAL '2 days'),
    (v_user_id, 'Content Writing Service', 'Write 20 blog posts for website content marketing', 'marketing', 1000.00, 'pending', NOW() - INTERVAL '1 day'),
    (v_user_id, 'REST API Development', 'Build a RESTful API with Node.js and Express', 'development', 4500.00, 'active', NOW() - INTERVAL '8 days'),
    (v_user_id, 'Video Editing Service', 'Edit promotional videos for social media marketing', 'design', 2200.00, 'completed', NOW() - INTERVAL '15 days'),
    (v_user_id, 'Database Migration', 'Migrate existing database to PostgreSQL with optimization', 'development', 3000.00, 'pending', NOW() - INTERVAL '4 days'),
    (v_user_id, 'Landing Page Design', 'Create a high-converting landing page design', 'design', 1500.00, 'active', NOW() - INTERVAL '6 days'),
    (v_user_id, 'Email Marketing Campaign', 'Design and implement an automated email marketing funnel', 'marketing', 2800.00, 'completed', NOW() - INTERVAL '25 days'),
    (v_user_id, 'Dashboard Analytics Tool', 'Build a custom analytics dashboard with charts and reports', 'development', 6500.00, 'active', NOW() - INTERVAL '12 days');

END $$;

