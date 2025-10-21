-- COMPLETE ARC RELATIONSHIP MANAGER DATABASE SETUP
-- Copy this ENTIRE file and paste into Supabase SQL Editor

-- Step 1: Clean slate - drop existing tables
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;

-- Step 2: Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mission_area TEXT CHECK (mission_area IN ('disaster_relief', 'health_safety', 'military_families', 'international', 'blood_services', 'other')),
  organization_type TEXT CHECK (organization_type IN ('government', 'nonprofit', 'business', 'faith_based', 'educational', 'healthcare', 'other')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  website TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Step 3: Create people table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Step 4: Create meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  location TEXT,
  summary TEXT,
  follow_up_date DATE,
  attendees UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Step 5: Create indexes for performance
CREATE INDEX organizations_name_idx ON organizations (name);
CREATE INDEX organizations_status_idx ON organizations (status);
CREATE INDEX organizations_mission_area_idx ON organizations (mission_area);
CREATE INDEX people_org_idx ON people (org_id);
CREATE INDEX people_email_idx ON people (email);
CREATE INDEX meetings_org_idx ON meetings (org_id);
CREATE INDEX meetings_date_idx ON meetings (date);

-- Step 6: Insert comprehensive sample organizations
INSERT INTO organizations (name, mission_area, organization_type, address, city, state, zip, website, phone, notes, status) VALUES

-- Government Partners
('FEMA Region III', 'disaster_relief', 'government', '615 Chestnut Street', 'Philadelphia', 'PA', '19106', 'https://www.fema.gov/region-iii', '(215) 931-5500', 'Federal emergency management coordination', 'active'),
('Washington DC Emergency Management Agency', 'disaster_relief', 'government', '2720 Martin Luther King Jr Ave SE', 'Washington', 'DC', '20032', 'https://hsema.dc.gov', '(202) 727-6161', 'Primary emergency management partner for DC region', 'active'),
('Montgomery County Fire & Rescue', 'disaster_relief', 'government', '101 Monroe Street', 'Rockville', 'MD', '20850', 'https://www.montgomerycountymd.gov/mcfrs', '(240) 777-2444', 'Local fire and emergency services partner', 'active'),
('Virginia Department of Emergency Management', 'disaster_relief', 'government', '10501 Trade Court', 'Richmond', 'VA', '23236', 'https://www.vaemergency.gov', '(804) 897-6502', 'State-level emergency management coordination', 'active'),

-- Healthcare Partners
('Johns Hopkins Hospital', 'health_safety', 'healthcare', '1800 Orleans Street', 'Baltimore', 'MD', '21287', 'https://www.hopkinsmedicine.org', '(410) 955-5000', 'Major medical center partnership for emergency response', 'active'),
('MedStar Washington Hospital Center', 'health_safety', 'healthcare', '110 Irving Street NW', 'Washington', 'DC', '20010', 'https://www.medstarwashington.org', '(202) 877-7000', 'Trauma center and emergency medical services', 'active'),
('Children''s National Hospital', 'health_safety', 'healthcare', '111 Michigan Avenue NW', 'Washington', 'DC', '20010', 'https://childrensnational.org', '(202) 476-5000', 'Pediatric emergency care coordination', 'active'),
('Inova Health System', 'health_safety', 'healthcare', '8110 Gatehouse Road', 'Falls Church', 'VA', '22042', 'https://www.inova.org', '(703) 289-2069', 'Regional healthcare network and emergency services', 'active'),

-- Nonprofit Partners
('Salvation Army National Capital Area', 'disaster_relief', 'nonprofit', '2626 Pennsylvania Avenue NW', 'Washington', 'DC', '20037', 'https://salvationarmynca.org', '(202) 756-2600', 'Emergency shelter and food services partner', 'active'),
('United Way of the National Capital Area', 'disaster_relief', 'nonprofit', '2200 Clarendon Boulevard', 'Arlington', 'VA', '22201', 'https://unitedwaynca.org', '(703) 536-1000', 'Community coordination and volunteer mobilization', 'active'),
('Food & Friends', 'health_safety', 'nonprofit', '219 Riggs Road NE', 'Washington', 'DC', '20011', 'https://foodandfriends.org', '(202) 269-2277', 'Meal delivery for vulnerable populations', 'active'),
('DC Central Kitchen', 'disaster_relief', 'nonprofit', '425 2nd Street NW', 'Washington', 'DC', '20001', 'https://dccentralkitchen.org', '(202) 234-0707', 'Emergency food production and distribution', 'active'),
('Habitat for Humanity of Washington DC', 'disaster_relief', 'nonprofit', '1436 U Street NW', 'Washington', 'DC', '20009', 'https://habitatdc.org', '(202) 882-0885', 'Post-disaster housing recovery and rebuilding', 'active'),

-- Faith-Based Organizations
('Washington National Cathedral', 'disaster_relief', 'faith_based', '3101 Wisconsin Avenue NW', 'Washington', 'DC', '20016', 'https://cathedral.org', '(202) 537-6200', 'Interfaith disaster response coordination', 'active'),
('Islamic Society of North America', 'disaster_relief', 'faith_based', '6555 S County Road 750 E', 'Plainfield', 'IN', '46168', 'https://www.isna.net', '(317) 839-8157', 'Muslim community disaster response', 'active'),
('Greater Washington Jewish Community', 'disaster_relief', 'faith_based', '1120 20th Street NW', 'Washington', 'DC', '20036', 'https://shalomdc.org', '(202) 777-3200', 'Jewish community emergency services', 'active'),
('Catholic Charities DC', 'disaster_relief', 'faith_based', '924 G Street NW', 'Washington', 'DC', '20001', 'https://catholiccharitiesdc.org', '(202) 772-4300', 'Faith-based social services and disaster relief', 'active'),

-- Educational Institutions
('George Washington University', 'health_safety', 'educational', '2121 I Street NW', 'Washington', 'DC', '20052', 'https://www.gwu.edu', '(202) 994-1000', 'University emergency management and student volunteers', 'active'),
('University of Maryland College Park', 'disaster_relief', 'educational', 'College Park', 'College Park', 'MD', '20742', 'https://www.umd.edu', '(301) 405-1000', 'Research partnerships and student engagement', 'active'),
('Virginia Tech', 'disaster_relief', 'educational', '925 Prices Fork Road', 'Blacksburg', 'VA', '24061', 'https://vt.edu', '(540) 231-6000', 'Emergency management research and training', 'active'),
('Georgetown University', 'health_safety', 'educational', '37th and O Streets NW', 'Washington', 'DC', '20057', 'https://www.georgetown.edu', '(202) 687-0100', 'Medical school emergency preparedness training', 'active'),

-- Corporate Partners
('Amazon Web Services', 'disaster_relief', 'business', '410 Terry Avenue North', 'Seattle', 'WA', '98109', 'https://aws.amazon.com', '(206) 266-1000', 'Cloud infrastructure and disaster recovery technology', 'active'),
('Microsoft Corporation', 'disaster_relief', 'business', 'One Microsoft Way', 'Redmond', 'WA', '98052', 'https://www.microsoft.com', '(425) 882-8080', 'Technology solutions for emergency response', 'active'),
('Home Depot Foundation', 'disaster_relief', 'business', '2455 Paces Ferry Road', 'Atlanta', 'GA', '30339', 'https://homedepotfoundation.org', '(770) 433-8211', 'Disaster recovery supplies and volunteer coordination', 'active'),
('Walmart Foundation', 'disaster_relief', 'business', '702 SW 8th Street', 'Bentonville', 'AR', '72716', 'https://walmart.org', '(479) 273-4000', 'Emergency supplies and logistics support', 'active'),
('Verizon Foundation', 'disaster_relief', 'business', '1095 Avenue of the Americas', 'New York', 'NY', '10036', 'https://www.verizon.com/about/responsibility', '(212) 395-1000', 'Emergency communications and mobile technology', 'active'),

-- International Partners
('International Federation of Red Cross', 'international', 'nonprofit', '17 chemin des Crêts', 'Geneva', 'Switzerland', '1209', 'https://www.ifrc.org', '+41 22 730 4222', 'Global Red Cross coordination', 'active'),
('United Nations OCHA', 'international', 'nonprofit', '220 East 42nd Street', 'New York', 'NY', '10017', 'https://www.unocha.org', '(212) 963-1234', 'UN humanitarian coordination', 'active'),

-- Blood Services Partners
('Inova Blood Donor Services', 'blood_services', 'healthcare', '8110 Gatehouse Road', 'Falls Church', 'VA', '22042', 'https://www.inova.org/blood', '(866) 256-6372', 'Regional blood collection and distribution', 'active'),
('MedStar Georgetown Blood Center', 'blood_services', 'healthcare', '3800 Reservoir Road NW', 'Washington', 'DC', '20007', 'https://www.medstargeorgetown.org', '(202) 444-2000', 'Hospital blood services coordination', 'active');

-- Step 7: Insert comprehensive people data
INSERT INTO people (org_id, first_name, last_name, title, email, phone, notes) VALUES

-- FEMA contacts
((SELECT id FROM organizations WHERE name = 'FEMA Region III'), 'Michael', 'Rodriguez', 'Regional Administrator', 'michael.rodriguez@fema.dhs.gov', '(215) 931-5501', 'Primary FEMA contact for regional coordination'),
((SELECT id FROM organizations WHERE name = 'FEMA Region III'), 'Jennifer', 'Thompson', 'Emergency Management Specialist', 'jennifer.thompson@fema.dhs.gov', '(215) 931-5502', 'Disaster response planning and operations'),
((SELECT id FROM organizations WHERE name = 'FEMA Region III'), 'David', 'Martinez', 'Public Assistance Officer', 'david.martinez@fema.dhs.gov', '(215) 931-5503', 'Post-disaster recovery funding coordination'),

-- DC Emergency Management
((SELECT id FROM organizations WHERE name = 'Washington DC Emergency Management Agency'), 'David', 'Washington', 'Director', 'david.washington@dc.gov', '(202) 727-6162', 'Director of DC emergency management operations'),
((SELECT id FROM organizations WHERE name = 'Washington DC Emergency Management Agency'), 'Lisa', 'Park', 'Deputy Director', 'lisa.park@dc.gov', '(202) 727-6163', 'Operations and planning coordination'),
((SELECT id FROM organizations WHERE name = 'Washington DC Emergency Management Agency'), 'Carlos', 'Rivera', 'Emergency Communications Manager', 'carlos.rivera@dc.gov', '(202) 727-6164', 'Emergency alert systems and public messaging'),

-- Johns Hopkins
((SELECT id FROM organizations WHERE name = 'Johns Hopkins Hospital'), 'Dr. Sarah', 'Kim', 'Emergency Department Director', 'skim@jhmi.edu', '(410) 955-5001', 'Emergency medical services coordination'),
((SELECT id FROM organizations WHERE name = 'Johns Hopkins Hospital'), 'Robert', 'Chen', 'Emergency Preparedness Manager', 'rchen@jhmi.edu', '(410) 955-5002', 'Hospital emergency planning and response'),
((SELECT id FROM organizations WHERE name = 'Johns Hopkins Hospital'), 'Dr. Amanda', 'Foster', 'Trauma Center Chief', 'afoster@jhmi.edu', '(410) 955-5003', 'Mass casualty incident medical response'),

-- Salvation Army
((SELECT id FROM organizations WHERE name = 'Salvation Army National Capital Area'), 'Major John', 'Williams', 'Area Commander', 'john.williams@uss.salvationarmy.org', '(202) 756-2601', 'Salvation Army regional operations'),
((SELECT id FROM organizations WHERE name = 'Salvation Army National Capital Area'), 'Captain Mary', 'Davis', 'Emergency Services Director', 'mary.davis@uss.salvationarmy.org', '(202) 756-2602', 'Shelter and feeding operations'),
((SELECT id FROM organizations WHERE name = 'Salvation Army National Capital Area'), 'Lt. James', 'Johnson', 'Volunteer Coordinator', 'james.johnson@uss.salvationarmy.org', '(202) 756-2603', 'Volunteer mobilization and training'),

-- United Way
((SELECT id FROM organizations WHERE name = 'United Way of the National Capital Area'), 'James', 'Mitchell', 'CEO', 'jmitchell@unitedwaynca.org', '(703) 536-1001', 'Strategic partnership and resource coordination'),
((SELECT id FROM organizations WHERE name = 'United Way of the National Capital Area'), 'Angela', 'Foster', 'Emergency Response Manager', 'afoster@unitedwaynca.org', '(703) 536-1002', 'Community crisis response coordination'),

-- AWS
((SELECT id FROM organizations WHERE name = 'Amazon Web Services'), 'Dr. Patricia', 'Lee', 'Public Sector Director', 'patlee@amazon.com', '(206) 266-1001', 'Government and nonprofit cloud solutions'),
((SELECT id FROM organizations WHERE name = 'Amazon Web Services'), 'Mark', 'Johnson', 'Disaster Response Specialist', 'markj@amazon.com', '(206) 266-1002', 'Emergency cloud infrastructure deployment'),

-- Microsoft
((SELECT id FROM organizations WHERE name = 'Microsoft Corporation'), 'Emily', 'Zhang', 'Nonprofit Partnerships Director', 'emzhang@microsoft.com', '(425) 882-8081', 'Technology for social impact initiatives'),
((SELECT id FROM organizations WHERE name = 'Microsoft Corporation'), 'Carlos', 'Ramirez', 'Emergency Response Technology Lead', 'cramirez@microsoft.com', '(425) 882-8082', 'Crisis response technology solutions'),

-- Faith-based contacts
((SELECT id FROM organizations WHERE name = 'Washington National Cathedral'), 'Rev. Dr. James', 'Anderson', 'Canon for Social Justice', 'anderson@cathedral.org', '(202) 537-6201', 'Interfaith emergency response coordination'),
((SELECT id FROM organizations WHERE name = 'Islamic Society of North America'), 'Imam Mohammad', 'Hassan', 'Emergency Response Coordinator', 'hassan@isna.net', '(317) 839-8158', 'Muslim community disaster response'),
((SELECT id FROM organizations WHERE name = 'Catholic Charities DC'), 'Sister Maria', 'Rodriguez', 'Director of Emergency Services', 'mrodriguez@catholiccharitiesdc.org', '(202) 772-4301', 'Faith-based emergency assistance programs'),

-- Educational contacts
((SELECT id FROM organizations WHERE name = 'George Washington University'), 'Dr. Amanda', 'Scott', 'Emergency Management Director', 'ascott@gwu.edu', '(202) 994-1001', 'Campus emergency planning and student volunteers'),
((SELECT id FROM organizations WHERE name = 'University of Maryland College Park'), 'Professor Thomas', 'Brown', 'Disaster Research Center Director', 'pbrown@umd.edu', '(301) 405-1001', 'Emergency management research and training'),
((SELECT id FROM organizations WHERE name = 'Georgetown University'), 'Dr. Lisa', 'White', 'Medical School Emergency Coordinator', 'lwhite@georgetown.edu', '(202) 687-0101', 'Medical student emergency response training'),

-- Healthcare contacts
((SELECT id FROM organizations WHERE name = 'MedStar Washington Hospital Center'), 'Dr. Rachel', 'Green', 'Chief Medical Officer', 'rachel.green@medstar.net', '(202) 877-7001', 'Medical emergency response coordination'),
((SELECT id FROM organizations WHERE name = 'Children''s National Hospital'), 'Dr. Kevin', 'Wright', 'Pediatric Emergency Director', 'kwright@childrensnational.org', '(202) 476-5001', 'Pediatric emergency care and family services'),
((SELECT id FROM organizations WHERE name = 'Inova Health System'), 'Dr. Susan', 'Taylor', 'Emergency Preparedness Director', 'staylor@inova.org', '(703) 289-2070', 'Regional healthcare emergency coordination'),

-- Corporate foundation contacts
((SELECT id FROM organizations WHERE name = 'Home Depot Foundation'), 'Michelle', 'Taylor', 'Disaster Relief Program Manager', 'michelle_taylor@homedepot.com', '(770) 433-8212', 'Corporate disaster relief funding and volunteers'),
((SELECT id FROM organizations WHERE name = 'Walmart Foundation'), 'Thomas', 'Wilson', 'Emergency Response Director', 'thomas.wilson@walmart.com', '(479) 273-4001', 'Supply chain support for disaster response'),

-- Additional nonprofit contacts
((SELECT id FROM organizations WHERE name = 'Food & Friends'), 'Maria', 'Gonzalez', 'Operations Director', 'mgonzalez@foodandfriends.org', '(202) 269-2278', 'Emergency meal production and delivery'),
((SELECT id FROM organizations WHERE name = 'DC Central Kitchen'), 'Chef Robert', 'Egger', 'Executive Director', 'regger@dccentralkitchen.org', '(202) 234-0708', 'Community kitchen and emergency feeding'),
((SELECT id FROM organizations WHERE name = 'Habitat for Humanity of Washington DC'), 'Sarah', 'Williams', 'Disaster Response Coordinator', 'swilliams@habitatdc.org', '(202) 882-0886', 'Post-disaster housing repair and rebuilding');

-- Step 8: Insert comprehensive meetings data
INSERT INTO meetings (org_id, date, location, summary, follow_up_date) VALUES

-- Recent strategic meetings (2024)
((SELECT id FROM organizations WHERE name = 'FEMA Region III'), '2024-01-15', 'ARC National Headquarters', 'Quarterly coordination meeting discussing 2024 disaster preparedness initiatives, resource pre-positioning, and training schedules. Reviewed lessons learned from 2023 response operations including Hurricane Idalia and severe weather events.', '2024-04-15'),

((SELECT id FROM organizations WHERE name = 'Washington DC Emergency Management Agency'), '2024-01-22', 'DC Emergency Operations Center', 'Winter weather preparedness meeting. Discussed shelter activation protocols, warming center coordination, and public messaging strategies for severe weather events. Reviewed snow removal coordination with ARC emergency response.', '2024-02-22'),

((SELECT id FROM organizations WHERE name = 'Johns Hopkins Hospital'), '2024-01-28', 'Johns Hopkins Hospital Conference Room', 'Medical surge planning session. Reviewed hospital capacity, patient flow procedures, and coordination with ARC mass care operations during large-scale emergencies. Discussed supply chain coordination for medical supplies.', '2024-03-01'),

((SELECT id FROM organizations WHERE name = 'Salvation Army National Capital Area'), '2024-02-05', 'Salvation Army Regional Headquarters', 'Emergency shelter coordination meeting. Planned joint shelter operations, volunteer training schedules, and resource sharing agreements for 2024 disaster season. Reviewed capacity at 12 shelter locations.', '2024-03-05'),

((SELECT id FROM organizations WHERE name = 'United Way of the National Capital Area'), '2024-02-12', 'United Way Conference Center', 'Community resilience planning session. Discussed long-term recovery programs, volunteer coordination systems, and funding strategies for disaster-affected communities. Planned 2024 disaster response fund allocation.', '2024-05-12'),

-- Technology partnership meetings
((SELECT id FROM organizations WHERE name = 'Amazon Web Services'), '2024-02-18', 'Virtual Meeting Platform', 'Cloud infrastructure for disaster response presentation. AWS demonstrated emergency data backup, communication systems, and mobile app deployment capabilities for field operations. Reviewed AWS Disaster Response Program benefits.', '2024-03-18'),

((SELECT id FROM organizations WHERE name = 'Microsoft Corporation'), '2024-02-25', 'Microsoft Technology Center', 'Digital transformation for emergency response. Reviewed Teams implementation for incident management, SharePoint for resource tracking, and Power BI for operational dashboards. Planned pilot program deployment.', '2024-04-25'),

((SELECT id FROM organizations WHERE name = 'Verizon Foundation'), '2024-03-01', 'Verizon Emergency Response Center', 'Emergency communications coordination meeting. Discussed mobile cell tower deployment, emergency hotlines, and priority communications for disaster response teams. Reviewed 2023 response communication challenges.', '2024-05-01'),

-- Faith-based coordination meetings
((SELECT id FROM organizations WHERE name = 'Washington National Cathedral'), '2024-03-03', 'Washington National Cathedral', 'Interfaith disaster response coordination summit. Representatives from 15 faith communities discussed shelter hosting, volunteer mobilization, and spiritual care services. Planned coordinated response protocols.', '2024-06-03'),

((SELECT id FROM organizations WHERE name = 'Islamic Society of North America'), '2024-03-10', 'ISNA Community Center', 'Cultural competency in disaster response training session. Discussed language services, dietary accommodations, and culturally appropriate emergency shelter operations. Reviewed Muslim community needs assessment.', '2024-04-10'),

((SELECT id FROM organizations WHERE name = 'Catholic Charities DC'), '2024-03-15', 'Catholic Charities Office', 'Faith-based emergency assistance coordination. Discussed financial assistance programs, emergency food distribution, and volunteer coordination with parish networks. Planned Easter season volunteer drives.', '2024-05-15'),

-- Educational partnership meetings
((SELECT id FROM organizations WHERE name = 'George Washington University'), '2024-03-17', 'GWU Emergency Management Center', 'Student volunteer program development meeting. Planned disaster response training curriculum, spring break deployment opportunities, and academic credit for emergency management fieldwork. Reviewed student interest survey results.', '2024-04-17'),

((SELECT id FROM organizations WHERE name = 'University of Maryland College Park'), '2024-03-24', 'UMD Disaster Research Center', 'Research collaboration planning session. Discussed joint studies on community resilience, social media in disaster response, and AI applications for emergency management. Planned summer research internship program.', '2024-06-24'),

((SELECT id FROM organizations WHERE name = 'Georgetown University'), '2024-03-28', 'Georgetown Medical Center', 'Medical student emergency response training coordination. Planned medical volunteer training program, disaster medical simulation exercises, and student deployment protocols for health emergencies.', '2024-05-28'),

-- Healthcare coordination meetings
((SELECT id FROM organizations WHERE name = 'MedStar Washington Hospital Center'), '2024-03-30', 'MedStar Executive Conference Room', 'Mass casualty incident planning exercise debrief. Conducted tabletop exercise simulating multi-hospital coordination during large-scale emergency with ARC mass care support. Identified communication improvement areas.', '2024-04-30'),

((SELECT id FROM organizations WHERE name = 'Children''s National Hospital'), '2024-04-07', 'Children''s National Hospital', 'Pediatric emergency preparedness coordination meeting. Reviewed specialized care protocols, family reunification procedures, and child-friendly shelter operations during disasters. Discussed pediatric medical supply pre-positioning.', '2024-05-07'),

((SELECT id FROM organizations WHERE name = 'Inova Health System'), '2024-04-10', 'Inova Regional Medical Center', 'Regional healthcare emergency coordination summit. Multi-hospital planning session for regional medical surge, patient transfer protocols, and resource sharing during large-scale health emergencies.', '2024-06-10'),

-- Corporate foundation meetings
((SELECT id FROM organizations WHERE name = 'Home Depot Foundation'), '2024-04-14', 'Home Depot Regional Distribution Center', 'Disaster relief supply coordination meeting. Discussed pre-positioning of emergency supplies, volunteer team deployment, and corporate matching gift programs for disaster response. Reviewed 2023 deployment statistics.', '2024-07-14'),

((SELECT id FROM organizations WHERE name = 'Walmart Foundation'), '2024-04-21', 'Walmart Distribution Center', 'Supply chain partnership coordination meeting. Reviewed emergency procurement procedures, logistics support capabilities, and employee volunteer program for disaster response operations. Planned 2024 emergency supply agreements.', '2024-05-21'),

-- Blood services coordination
((SELECT id FROM organizations WHERE name = 'Inova Blood Donor Services'), '2024-04-28', 'Inova Blood Collection Center', 'Emergency blood collection planning session. Discussed mobile blood drive deployment, donor communication strategies, and coordination with ARC blood services during regional emergencies. Reviewed emergency blood shortage protocols.', '2024-06-28'),

((SELECT id FROM organizations WHERE name = 'MedStar Georgetown Blood Center'), '2024-05-02', 'Georgetown Blood Center', 'Hospital blood services emergency coordination. Planned emergency blood distribution, hospital-to-hospital blood sharing protocols, and coordination with Red Cross blood services during disasters.', '2024-07-02'),

-- International coordination
((SELECT id FROM organizations WHERE name = 'International Federation of Red Cross'), '2024-05-05', 'Virtual Global Meeting', 'Global disaster response coordination conference call. Shared best practices from international operations, discussed resource sharing agreements, and planned joint training exercises. Reviewed global disaster response trends.', '2024-08-05'),

((SELECT id FROM organizations WHERE name = 'United Nations OCHA'), '2024-05-08', 'UN Coordination Center', 'Humanitarian coordination planning session. Discussed international disaster response protocols, UN coordination mechanisms, and Red Cross role in global humanitarian response. Planned summer coordination exercises.', '2024-07-08'),

-- Recent operational meetings
((SELECT id FROM organizations WHERE name = 'Montgomery County Fire & Rescue'), '2024-05-12', 'Montgomery County Fire Station 1', 'Multi-agency response exercise debrief session. Reviewed performance during recent severe weather response, identified improvement areas, and planned follow-up training sessions. Discussed equipment sharing protocols.', '2024-06-12'),

((SELECT id FROM organizations WHERE name = 'Virginia Department of Emergency Management'), '2024-05-19', 'Virginia State Emergency Operations Center', 'State-level disaster preparedness quarterly review. Assessed regional capabilities, reviewed mutual aid agreements, and planned summer disaster preparedness campaign coordination. Discussed hurricane season preparations.', '2024-07-19'),

-- Community partnership meetings
((SELECT id FROM organizations WHERE name = 'Food & Friends'), '2024-05-26', 'Food & Friends Commercial Kitchen', 'Emergency feeding operations planning meeting. Discussed meal production capacity for disasters, special dietary needs accommodation, and coordination with ARC mass feeding during large-scale responses. Reviewed volunteer cook training program.', '2024-07-26'),

((SELECT id FROM organizations WHERE name = 'DC Central Kitchen'), '2024-06-02', 'DC Central Kitchen Production Facility', 'Community kitchen coordination planning session. Planned joint food production, volunteer coordination, and distribution logistics for emergency feeding operations in the DC metro area. Discussed food safety protocols.', '2024-08-02'),

((SELECT id FROM organizations WHERE name = 'Habitat for Humanity of Washington DC'), '2024-06-05', 'Habitat for Humanity Office', 'Post-disaster housing recovery coordination meeting. Discussed rapid housing assessment protocols, volunteer construction teams, and coordination with ARC for disaster-affected families. Planned summer build season emergency response capacity.', '2024-08-05');

-- Final success message
SELECT 
  'Database setup complete!' as status,
  (SELECT COUNT(*) FROM organizations) as organizations_count,
  (SELECT COUNT(*) FROM people) as people_count,
  (SELECT COUNT(*) FROM meetings) as meetings_count;