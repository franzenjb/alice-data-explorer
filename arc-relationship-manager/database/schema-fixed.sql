-- COMPLETE ARC Relationship Manager Database Schema (FIXED)
-- Copy this ENTIRE file and paste into Supabase SQL Editor

-- First, clean up any existing tables/functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS log_organizations_activity ON organizations;
DROP TRIGGER IF EXISTS log_people_activity ON people;
DROP TRIGGER IF EXISTS log_meetings_activity ON meetings;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_people_updated_at ON people;
DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS log_activity();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_user_allowed_regions();

DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS counties CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create regions table
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  geom GEOMETRY(MULTIPOLYGON, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  geom GEOMETRY(MULTIPOLYGON, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create counties table
CREATE TABLE counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state_code TEXT NOT NULL,
  fips_code TEXT UNIQUE NOT NULL,
  geom GEOMETRY(MULTIPOLYGON, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mission_area TEXT CHECK (mission_area IN ('disaster_relief', 'health_safety', 'military_families', 'international', 'blood_services', 'other')),
  organization_type TEXT CHECK (organization_type IN ('government', 'nonprofit', 'business', 'faith_based', 'educational', 'healthcare', 'other')),
  
  -- Geographic assignment
  region_id UUID REFERENCES regions(id),
  chapter_id UUID REFERENCES chapters(id),
  county_id UUID REFERENCES counties(id),
  
  -- Location data
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  location GEOMETRY(POINT, 4326),
  
  -- Contact info
  website TEXT,
  phone TEXT,
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  
  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(notes, '') || ' ' || COALESCE(address, ''))
  ) STORED,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Create people table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  
  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || 
                          COALESCE(title, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(notes, ''))
  ) STORED,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Create meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  location TEXT,
  summary TEXT,
  follow_up_date DATE,
  attendees UUID[],
  
  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(summary, '') || ' ' || COALESCE(location, ''))
  ) STORED,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Create attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table (SIMPLIFIED - no auth.users reference for now)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'chapter_user' CHECK (role IN ('national_admin', 'regional_lead', 'chapter_user', 'read_only')),
  region_id UUID REFERENCES regions(id),
  chapter_id UUID REFERENCES chapters(id),
  first_name TEXT,
  last_name TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity log table
CREATE TABLE activity_log (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('organization', 'person', 'meeting', 'attachment')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  payload JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX organizations_search_idx ON organizations USING GIN (search_vector);
CREATE INDEX organizations_location_idx ON organizations USING GIST (location);
CREATE INDEX organizations_region_idx ON organizations (region_id);
CREATE INDEX organizations_chapter_idx ON organizations (chapter_id);
CREATE INDEX organizations_county_idx ON organizations (county_id);
CREATE INDEX organizations_status_idx ON organizations (status);
CREATE INDEX organizations_mission_area_idx ON organizations (mission_area);
CREATE INDEX organizations_updated_at_idx ON organizations (updated_at);

CREATE INDEX people_search_idx ON people USING GIN (search_vector);
CREATE INDEX people_org_idx ON people (org_id);
CREATE INDEX people_email_idx ON people (email);

CREATE INDEX meetings_search_idx ON meetings USING GIN (search_vector);
CREATE INDEX meetings_org_idx ON meetings (org_id);
CREATE INDEX meetings_date_idx ON meetings (date);
CREATE INDEX meetings_follow_up_date_idx ON meetings (follow_up_date);

CREATE INDEX counties_geom_idx ON counties USING GIST (geom);
CREATE INDEX chapters_geom_idx ON chapters USING GIST (geom);
CREATE INDEX regions_geom_idx ON regions USING GIST (geom);

CREATE INDEX activity_log_entity_idx ON activity_log (entity_type, entity_id);
CREATE INDEX activity_log_timestamp_idx ON activity_log (timestamp);
CREATE INDEX activity_log_actor_idx ON activity_log (actor_user_id);

CREATE INDEX user_profiles_email_idx ON user_profiles (email);
CREATE INDEX user_profiles_region_idx ON user_profiles (region_id);

-- Enable Row Level Security (DISABLED FOR NOW TO ALLOW TESTING)
-- ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE people ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create basic policies for geographic tables (readable by all authenticated users)
-- CREATE POLICY "Authenticated users can view regions" ON regions
--   FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can view chapters" ON chapters
--   FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can view counties" ON counties
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Create trigger functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at 
  BEFORE UPDATE ON people 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at 
  BEFORE UPDATE ON meetings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger function for activity logging (SIMPLIFIED)
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (actor_user_id, entity_type, entity_id, action, payload)
  VALUES (
    NULL, -- No user ID for now
    TG_TABLE_NAME::TEXT,
    COALESCE(NEW.id, OLD.id),
    LOWER(TG_OP),
    CASE 
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create activity logging triggers
CREATE TRIGGER log_organizations_activity
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_people_activity
  AFTER INSERT OR UPDATE OR DELETE ON people
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_meetings_activity
  AFTER INSERT OR UPDATE OR DELETE ON meetings
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Insert sample data for development
INSERT INTO regions (id, name, code) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'National Capital & Greater Chesapeake', 'NCGC'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Northern California Coastal', 'NCC'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Southern California', 'SCA'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Texas Gulf Coast', 'TGC');

INSERT INTO chapters (id, region_id, name, code) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Washington DC Metro', 'DCM'),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'San Francisco Bay Area', 'SFBA'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Los Angeles', 'LA'),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Houston', 'HOU');

-- Create sample user for testing
INSERT INTO user_profiles (email, role, first_name, last_name, region_id)
VALUES 
  ('jeff.franzen2@redcross.org', 'chapter_user', 'Jeff', 'Franzen', '550e8400-e29b-41d4-a716-446655440000'),
  ('admin@redcross.org', 'national_admin', 'Admin', 'User', NULL);

-- Success message
SELECT 'Database setup complete! You can now sign up and sign in.' as message;