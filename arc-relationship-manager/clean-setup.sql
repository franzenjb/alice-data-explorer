DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  mission_area TEXT,
  organization_type TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  website TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  location TEXT,
  summary TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON public.organizations TO anon, authenticated, service_role, postgres;
GRANT ALL ON public.people TO anon, authenticated, service_role, postgres;
GRANT ALL ON public.meetings TO anon, authenticated, service_role, postgres;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;

INSERT INTO public.organizations (name, mission_area, organization_type, address, city, state, zip, website, phone, notes, status) VALUES
('FEMA Region III', 'disaster_relief', 'government', '615 Chestnut Street', 'Philadelphia', 'PA', '19106', 'https://www.fema.gov/region-iii', '(215) 931-5500', 'Federal emergency management coordination', 'active'),
('Johns Hopkins Hospital', 'health_safety', 'healthcare', '1800 Orleans Street', 'Baltimore', 'MD', '21287', 'https://www.hopkinsmedicine.org', '(410) 955-5000', 'Major medical center partnership', 'active'),
('Salvation Army NCA', 'disaster_relief', 'nonprofit', '2626 Pennsylvania Avenue NW', 'Washington', 'DC', '20037', 'https://salvationarmynca.org', '(202) 756-2600', 'Emergency shelter and services', 'active'),
('Amazon Web Services', 'disaster_relief', 'business', '410 Terry Avenue North', 'Seattle', 'WA', '98109', 'https://aws.amazon.com', '(206) 266-1000', 'Cloud infrastructure solutions', 'active'),
('Washington National Cathedral', 'disaster_relief', 'faith_based', '3101 Wisconsin Avenue NW', 'Washington', 'DC', '20016', 'https://cathedral.org', '(202) 537-6200', 'Interfaith disaster response', 'active');

SELECT 'Database setup complete!' as status;