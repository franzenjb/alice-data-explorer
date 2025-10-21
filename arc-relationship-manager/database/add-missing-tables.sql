-- Add missing tables to existing Supabase database
-- Run this in Supabase SQL Editor

-- Create people table
CREATE TABLE IF NOT EXISTS people (
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
CREATE TABLE IF NOT EXISTS meetings (
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
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS people_search_idx ON people USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS people_org_idx ON people (org_id);
CREATE INDEX IF NOT EXISTS people_email_idx ON people (email);

CREATE INDEX IF NOT EXISTS meetings_search_idx ON meetings USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS meetings_org_idx ON meetings (org_id);
CREATE INDEX IF NOT EXISTS meetings_date_idx ON meetings (date);
CREATE INDEX IF NOT EXISTS meetings_follow_up_date_idx ON meetings (follow_up_date);

-- Create triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_people_updated_at 
  BEFORE UPDATE ON people 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_meetings_updated_at 
  BEFORE UPDATE ON meetings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create activity logging triggers
CREATE TRIGGER IF NOT EXISTS log_people_activity
  AFTER INSERT OR UPDATE OR DELETE ON people
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER IF NOT EXISTS log_meetings_activity
  AFTER INSERT OR UPDATE OR DELETE ON meetings
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Insert sample people data
INSERT INTO people (org_id, first_name, last_name, title, email, phone, notes) VALUES
(
  (SELECT id FROM organizations LIMIT 1),
  'Sarah',
  'Johnson',
  'Executive Director',
  'sarah.johnson@example.org',
  '(555) 123-4567',
  'Primary contact for disaster relief coordination'
),
(
  (SELECT id FROM organizations LIMIT 1),
  'Mike',
  'Chen',
  'Program Manager',
  'mike.chen@example.org',
  '(555) 234-5678',
  'Leads volunteer programs and community outreach'
);

-- Insert sample meetings data
INSERT INTO meetings (org_id, date, location, summary, follow_up_date) VALUES
(
  (SELECT id FROM organizations LIMIT 1),
  '2024-01-15',
  'ARC Regional Office',
  'Quarterly coordination meeting to discuss upcoming disaster preparedness initiatives and resource allocation.',
  '2024-02-15'
),
(
  (SELECT id FROM organizations LIMIT 1),
  '2024-01-20',
  'Virtual Meeting',
  'Training session on new volunteer management system and protocols.',
  '2024-02-01'
);

-- Success message
SELECT 'People and Meetings tables created successfully!' as message;