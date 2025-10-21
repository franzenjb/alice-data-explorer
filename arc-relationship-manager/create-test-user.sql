-- Create a test user directly in Supabase
-- Run this in the Supabase SQL Editor to create a test user

-- First, let's create a test user profile directly
INSERT INTO user_profiles (id, email, role, first_name, last_name)
VALUES (
  gen_random_uuid(),
  'jeff.franzen2@redcross.org', 
  'chapter_user',
  'Jeff',
  'Franzen'
);

-- Note: This creates the profile, but you'll still need to sign up normally
-- through the Supabase auth system for the actual authentication