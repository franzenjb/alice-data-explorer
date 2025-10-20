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
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
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
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
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
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
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
  actor_user_id UUID REFERENCES auth.users(id),
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

-- Enable Row Level Security
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles (users can only see/edit their own profile)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Helper function to get user's allowed region IDs
CREATE OR REPLACE FUNCTION get_user_allowed_regions()
RETURNS UUID[] AS $$
DECLARE
  user_role TEXT;
  user_region_id UUID;
  allowed_regions UUID[];
BEGIN
  SELECT role, region_id INTO user_role, user_region_id
  FROM user_profiles 
  WHERE id = auth.uid();
  
  IF user_role = 'national_admin' THEN
    -- National admins can see all regions
    SELECT array_agg(id) INTO allowed_regions FROM regions;
  ELSIF user_role IN ('regional_lead', 'chapter_user', 'read_only') AND user_region_id IS NOT NULL THEN
    -- Regional users can only see their assigned region
    allowed_regions := ARRAY[user_region_id];
  ELSE
    -- No access by default
    allowed_regions := ARRAY[]::UUID[];
  END IF;
  
  RETURN allowed_regions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for organizations
CREATE POLICY "Users can view organizations in their region" ON organizations
  FOR SELECT USING (region_id = ANY(get_user_allowed_regions()));

CREATE POLICY "Users can insert organizations in their region" ON organizations
  FOR INSERT WITH CHECK (region_id = ANY(get_user_allowed_regions()));

CREATE POLICY "Users can update organizations in their region" ON organizations
  FOR UPDATE USING (region_id = ANY(get_user_allowed_regions()));

CREATE POLICY "Users can delete organizations in their region" ON organizations
  FOR DELETE USING (region_id = ANY(get_user_allowed_regions()));

-- RLS policies for people (inherit from organization access)
CREATE POLICY "Users can view people in their region" ON people
  FOR SELECT USING (
    org_id IN (
      SELECT id FROM organizations 
      WHERE region_id = ANY(get_user_allowed_regions())
    )
  );

CREATE POLICY "Users can insert people in their region" ON people
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT id FROM organizations 
      WHERE region_id = ANY(get_user_allowed_regions())
    )
  );

CREATE POLICY "Users can update people in their region" ON people
  FOR UPDATE USING (
    org_id IN (
      SELECT id FROM organizations 
      WHERE region_id = ANY(get_user_allowed_regions())
    )
  );

CREATE POLICY "Users can delete people in their region" ON people
  FOR DELETE USING (
    org_id IN (
      SELECT id FROM organizations 
      WHERE region_id = ANY(get_user_allowed_regions())
    )
  );

-- RLS policies for meetings (inherit from organization access)
CREATE POLICY "Users can view meetings in their region" ON meetings
  FOR SELECT USING (
    org_id IN (
      SELECT id FROM organizations 
      WHERE region_id = ANY(get_user_allowed_regions())
    )
  );

CREATE POLICY "Users can insert meetings in their region" ON meetings
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT id FROM organizations 
      WHERE region_id = ANY(get_user_allowed_regions())
    )
  );

CREATE POLICY "Users can update meetings in their region" ON meetings
  FOR UPDATE USING (
    org_id IN (
      SELECT id FROM organizations 
      WHERE region_id = ANY(get_user_allowed_regions())
    )
  );

CREATE POLICY "Users can delete meetings in their region" ON meetings
  FOR DELETE USING (
    org_id IN (
      SELECT id FROM organizations 
      WHERE region_id = ANY(get_user_allowed_regions())
    )
  );

-- RLS policies for attachments (inherit from meeting access)
CREATE POLICY "Users can view attachments in their region" ON attachments
  FOR SELECT USING (
    meeting_id IN (
      SELECT m.id FROM meetings m
      JOIN organizations o ON m.org_id = o.id
      WHERE o.region_id = ANY(get_user_allowed_regions())
    )
  );

CREATE POLICY "Users can insert attachments in their region" ON attachments
  FOR INSERT WITH CHECK (
    meeting_id IN (
      SELECT m.id FROM meetings m
      JOIN organizations o ON m.org_id = o.id
      WHERE o.region_id = ANY(get_user_allowed_regions())
    )
  );

-- RLS policies for geographic tables (readable by all authenticated users)
CREATE POLICY "Authenticated users can view regions" ON regions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view chapters" ON chapters
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view counties" ON counties
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policies for activity log
CREATE POLICY "Users can view activity in their region" ON activity_log
  FOR SELECT USING (
    CASE entity_type
      WHEN 'organization' THEN 
        entity_id::UUID IN (
          SELECT id FROM organizations 
          WHERE region_id = ANY(get_user_allowed_regions())
        )
      WHEN 'person' THEN 
        entity_id::UUID IN (
          SELECT p.id FROM people p
          JOIN organizations o ON p.org_id = o.id
          WHERE o.region_id = ANY(get_user_allowed_regions())
        )
      WHEN 'meeting' THEN 
        entity_id::UUID IN (
          SELECT m.id FROM meetings m
          JOIN organizations o ON m.org_id = o.id
          WHERE o.region_id = ANY(get_user_allowed_regions())
        )
      ELSE false
    END
  );

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

-- Create trigger function for activity logging
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (actor_user_id, entity_type, entity_id, action, payload)
  VALUES (
    auth.uid(),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    'chapter_user', -- default role
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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