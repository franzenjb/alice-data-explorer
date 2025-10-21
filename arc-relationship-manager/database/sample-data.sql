-- Comprehensive Sample Data for ARC Relationship Manager
-- Run this in Supabase SQL Editor after creating the tables

-- First ensure we have the basic tables and functions
-- (This assumes the add-missing-tables.sql has been run)

-- Clear existing sample data
DELETE FROM attachments;
DELETE FROM meetings;
DELETE FROM people;
-- Keep existing organizations

-- Insert comprehensive sample organizations
INSERT INTO organizations (name, mission_area, organization_type, address, city, state, zip, website, phone, notes, status) VALUES
-- Government Partners
('Washington DC Emergency Management Agency', 'disaster_relief', 'government', '2720 Martin Luther King Jr Ave SE', 'Washington', 'DC', '20032', 'https://hsema.dc.gov', '(202) 727-6161', 'Primary emergency management partner for DC region', 'active'),
('FEMA Region III', 'disaster_relief', 'government', '615 Chestnut Street', 'Philadelphia', 'PA', '19106', 'https://www.fema.gov/region-iii', '(215) 931-5500', 'Federal emergency management coordination', 'active'),
('Montgomery County Fire & Rescue', 'disaster_relief', 'government', '101 Monroe Street', 'Rockville', 'MD', '20850', 'https://www.montgomerycountymd.gov/mcfrs', '(240) 777-2444', 'Local fire and emergency services partner', 'active'),
('Virginia Department of Emergency Management', 'disaster_relief', 'government', '10501 Trade Court', 'Richmond', 'VA', '23236', 'https://www.vaemergency.gov', '(804) 897-6502', 'State-level emergency management coordination', 'active'),

-- Healthcare Partners
('Johns Hopkins Hospital', 'health_safety', 'healthcare', '1800 Orleans Street', 'Baltimore', 'MD', '21287', 'https://www.hopkinsmedicine.org', '(410) 955-5000', 'Major medical center partnership for emergency response', 'active'),
('MedStar Washington Hospital Center', 'health_safety', 'healthcare', '110 Irving Street NW', 'Washington', 'DC', '20010', 'https://www.medstarwashington.org', '(202) 877-7000', 'Trauma center and emergency medical services', 'active'),
('Children''s National Hospital', 'health_safety', 'healthcare', '111 Michigan Avenue NW', 'Washington', 'DC', '20010', 'https://childrensnational.org', '(202) 476-5000', 'Pediatric emergency care coordination', 'active'),

-- Nonprofit Partners
('Salvation Army National Capital Area', 'disaster_relief', 'nonprofit', '2626 Pennsylvania Avenue NW', 'Washington', 'DC', '20037', 'https://salvationarmynca.org', '(202) 756-2600', 'Emergency shelter and food services partner', 'active'),
('United Way of the National Capital Area', 'disaster_relief', 'nonprofit', '2200 Clarendon Boulevard', 'Arlington', 'VA', '22201', 'https://unitedwaynca.org', '(703) 536-1000', 'Community coordination and volunteer mobilization', 'active'),
('Food & Friends', 'health_safety', 'nonprofit', '219 Riggs Road NE', 'Washington', 'DC', '20011', 'https://foodandfriends.org', '(202) 269-2277', 'Meal delivery for vulnerable populations', 'active'),
('DC Central Kitchen', 'disaster_relief', 'nonprofit', '425 2nd Street NW', 'Washington', 'DC', '20001', 'https://dccentralkitchen.org', '(202) 234-0707', 'Emergency food production and distribution', 'active'),

-- Faith-Based Organizations
('Washington National Cathedral', 'disaster_relief', 'faith_based', '3101 Wisconsin Avenue NW', 'Washington', 'DC', '20016', 'https://cathedral.org', '(202) 537-6200', 'Interfaith disaster response coordination', 'active'),
('Islamic Society of North America', 'disaster_relief', 'faith_based', '6555 S County Road 750 E', 'Plainfield', 'IN', '46168', 'https://www.isna.net', '(317) 839-8157', 'Muslim community disaster response', 'active'),
('Greater Washington Jewish Community', 'disaster_relief', 'faith_based', '1120 20th Street NW', 'Washington', 'DC', '20036', 'https://shalomdc.org', '(202) 777-3200', 'Jewish community emergency services', 'active'),

-- Educational Institutions
('George Washington University', 'health_safety', 'educational', '2121 I Street NW', 'Washington', 'DC', '20052', 'https://www.gwu.edu', '(202) 994-1000', 'University emergency management and student volunteers', 'active'),
('University of Maryland College Park', 'disaster_relief', 'educational', 'College Park', 'College Park', 'MD', '20742', 'https://www.umd.edu', '(301) 405-1000', 'Research partnerships and student engagement', 'active'),
('Virginia Tech', 'disaster_relief', 'educational', '925 Prices Fork Road', 'Blacksburg', 'VA', '24061', 'https://vt.edu', '(540) 231-6000', 'Emergency management research and training', 'active'),

-- Corporate Partners
('Amazon Web Services', 'disaster_relief', 'business', '410 Terry Avenue North', 'Seattle', 'WA', '98109', 'https://aws.amazon.com', '(206) 266-1000', 'Cloud infrastructure and disaster recovery technology', 'active'),
('Microsoft Corporation', 'disaster_relief', 'business', 'One Microsoft Way', 'Redmond', 'WA', '98052', 'https://www.microsoft.com', '(425) 882-8080', 'Technology solutions for emergency response', 'active'),
('Home Depot Foundation', 'disaster_relief', 'business', '2455 Paces Ferry Road', 'Atlanta', 'GA', '30339', 'https://homedepotfoundation.org', '(770) 433-8211', 'Disaster recovery supplies and volunteer coordination', 'active'),
('Walmart Foundation', 'disaster_relief', 'business', '702 SW 8th Street', 'Bentonville', 'AR', '72716', 'https://walmart.org', '(479) 273-4000', 'Emergency supplies and logistics support', 'active'),

-- International Partners
('International Federation of Red Cross', 'international', 'nonprofit', '17 chemin des Crêts', 'Geneva', 'Switzerland', '1209', 'https://www.ifrc.org', '+41 22 730 4222', 'Global Red Cross coordination', 'active'),
('United Nations OCHA', 'international', 'nonprofit', '220 East 42nd Street', 'New York', 'NY', '10017', 'https://www.unocha.org', '(212) 963-1234', 'UN humanitarian coordination', 'active'),

-- Blood Services Partners
('Inova Blood Donor Services', 'blood_services', 'healthcare', '8110 Gatehouse Road', 'Falls Church', 'VA', '22042', 'https://www.inova.org/blood', '(866) 256-6372', 'Regional blood collection and distribution', 'active'),
('MedStar Georgetown Blood Center', 'blood_services', 'healthcare', '3800 Reservoir Road NW', 'Washington', 'DC', '20007', 'https://www.medstargeorgetown.org', '(202) 444-2000', 'Hospital blood services coordination', 'active');

-- Insert comprehensive people data
INSERT INTO people (org_id, first_name, last_name, title, email, phone, notes) VALUES
-- FEMA contacts
((SELECT id FROM organizations WHERE name = 'FEMA Region III'), 'Michael', 'Rodriguez', 'Regional Administrator', 'michael.rodriguez@fema.dhs.gov', '(215) 931-5501', 'Primary FEMA contact for regional coordination'),
((SELECT id FROM organizations WHERE name = 'FEMA Region III'), 'Jennifer', 'Thompson', 'Emergency Management Specialist', 'jennifer.thompson@fema.dhs.gov', '(215) 931-5502', 'Disaster response planning and operations'),

-- DC Emergency Management
((SELECT id FROM organizations WHERE name = 'Washington DC Emergency Management Agency'), 'David', 'Washington', 'Director', 'david.washington@dc.gov', '(202) 727-6162', 'Director of DC emergency management operations'),
((SELECT id FROM organizations WHERE name = 'Washington DC Emergency Management Agency'), 'Lisa', 'Park', 'Deputy Director', 'lisa.park@dc.gov', '(202) 727-6163', 'Operations and planning coordination'),

-- Johns Hopkins
((SELECT id FROM organizations WHERE name = 'Johns Hopkins Hospital'), 'Dr. Sarah', 'Kim', 'Emergency Department Director', 'skim@jhmi.edu', '(410) 955-5001', 'Emergency medical services coordination'),
((SELECT id FROM organizations WHERE name = 'Johns Hopkins Hospital'), 'Robert', 'Chen', 'Emergency Preparedness Manager', 'rchen@jhmi.edu', '(410) 955-5002', 'Hospital emergency planning and response'),

-- Salvation Army
((SELECT id FROM organizations WHERE name = 'Salvation Army National Capital Area'), 'Major', 'Williams', 'Area Commander', 'john.williams@uss.salvationarmy.org', '(202) 756-2601', 'Salvation Army regional operations'),
((SELECT id FROM organizations WHERE name = 'Salvation Army National Capital Area'), 'Captain', 'Davis', 'Emergency Services Director', 'mary.davis@uss.salvationarmy.org', '(202) 756-2602', 'Shelter and feeding operations'),

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
((SELECT id FROM organizations WHERE name = 'Washington National Cathedral'), 'Rev. Dr.', 'Anderson', 'Canon for Social Justice', 'anderson@cathedral.org', '(202) 537-6201', 'Interfaith emergency response coordination'),
((SELECT id FROM organizations WHERE name = 'Islamic Society of North America'), 'Imam', 'Hassan', 'Emergency Response Coordinator', 'hassan@isna.net', '(317) 839-8158', 'Muslim community disaster response'),

-- Educational contacts
((SELECT id FROM organizations WHERE name = 'George Washington University'), 'Dr. Amanda', 'Scott', 'Emergency Management Director', 'ascott@gwu.edu', '(202) 994-1001', 'Campus emergency planning and student volunteers'),
((SELECT id FROM organizations WHERE name = 'University of Maryland College Park'), 'Professor', 'Brown', 'Disaster Research Center Director', 'pbrown@umd.edu', '(301) 405-1001', 'Emergency management research and training'),

-- Healthcare contacts
((SELECT id FROM organizations WHERE name = 'MedStar Washington Hospital Center'), 'Dr. Rachel', 'Green', 'Chief Medical Officer', 'rachel.green@medstar.net', '(202) 877-7001', 'Medical emergency response coordination'),
((SELECT id FROM organizations WHERE name = 'Children''s National Hospital'), 'Dr. Kevin', 'Wright', 'Pediatric Emergency Director', 'kwright@childrensnational.org', '(202) 476-5001', 'Pediatric emergency care and family services'),

-- Corporate foundation contacts
((SELECT id FROM organizations WHERE name = 'Home Depot Foundation'), 'Michelle', 'Taylor', 'Disaster Relief Program Manager', 'michelle_taylor@homedepot.com', '(770) 433-8212', 'Corporate disaster relief funding and volunteers'),
((SELECT id FROM organizations WHERE name = 'Walmart Foundation'), 'Thomas', 'Wilson', 'Emergency Response Director', 'thomas.wilson@walmart.com', '(479) 273-4001', 'Supply chain support for disaster response');

-- Insert comprehensive meetings data
INSERT INTO meetings (org_id, date, location, summary, follow_up_date, attendees) VALUES
-- Recent strategic meetings
((SELECT id FROM organizations WHERE name = 'FEMA Region III'), '2024-01-15', 'ARC National Headquarters', 'Quarterly coordination meeting discussing 2024 disaster preparedness initiatives, resource pre-positioning, and training schedules. Reviewed lessons learned from 2023 response operations.', '2024-04-15', NULL),

((SELECT id FROM organizations WHERE name = 'Washington DC Emergency Management Agency'), '2024-01-22', 'DC Emergency Operations Center', 'Winter weather preparedness meeting. Discussed shelter activation protocols, warming center coordination, and public messaging strategies for severe weather events.', '2024-02-22', NULL),

((SELECT id FROM organizations WHERE name = 'Johns Hopkins Hospital'), '2024-01-28', 'Johns Hopkins Hospital', 'Medical surge planning session. Reviewed hospital capacity, patient flow procedures, and coordination with ARC mass care operations during large-scale emergencies.', '2024-03-01', NULL),

((SELECT id FROM organizations WHERE name = 'Salvation Army National Capital Area'), '2024-02-05', 'Salvation Army Headquarters', 'Emergency shelter coordination meeting. Planned joint shelter operations, volunteer training schedules, and resource sharing agreements for 2024 disaster season.', '2024-03-05', NULL),

((SELECT id FROM organizations WHERE name = 'United Way of the National Capital Area'), '2024-02-12', 'United Way Office', 'Community resilience planning session. Discussed long-term recovery programs, volunteer coordination systems, and funding strategies for disaster-affected communities.', '2024-05-12', NULL),

-- Technology partnership meetings
((SELECT id FROM organizations WHERE name = 'Amazon Web Services'), '2024-02-18', 'Virtual Meeting', 'Cloud infrastructure for disaster response presentation. AWS demonstrated emergency data backup, communication systems, and mobile app deployment capabilities for field operations.', '2024-03-18', NULL),

((SELECT id FROM organizations WHERE name = 'Microsoft Corporation'), '2024-02-25', 'Microsoft Office', 'Digital transformation for emergency response. Reviewed Teams implementation for incident management, SharePoint for resource tracking, and Power BI for operational dashboards.', '2024-04-25', NULL),

-- Faith-based coordination
((SELECT id FROM organizations WHERE name = 'Washington National Cathedral'), '2024-03-03', 'Washington National Cathedral', 'Interfaith disaster response coordination. Representatives from 15 faith communities discussed shelter hosting, volunteer mobilization, and spiritual care services.', '2024-06-03', NULL),

((SELECT id FROM organizations WHERE name = 'Islamic Society of North America'), '2024-03-10', 'ISNA Community Center', 'Cultural competency in disaster response training. Discussed language services, dietary accommodations, and culturally appropriate emergency shelter operations.', '2024-04-10', NULL),

-- Educational partnerships
((SELECT id FROM organizations WHERE name = 'George Washington University'), '2024-03-17', 'GWU Campus', 'Student volunteer program development. Planned disaster response training curriculum, spring break deployment opportunities, and academic credit for emergency management fieldwork.', '2024-04-17', NULL),

((SELECT id FROM organizations WHERE name = 'University of Maryland College Park'), '2024-03-24', 'UMD Emergency Management Building', 'Research collaboration planning. Discussed joint studies on community resilience, social media in disaster response, and AI applications for emergency management.', '2024-06-24', NULL),

-- Healthcare coordination
((SELECT id FROM organizations WHERE name = 'MedStar Washington Hospital Center'), '2024-03-30', 'MedStar Conference Room', 'Mass casualty incident planning exercise. Conducted tabletop exercise simulating multi-hospital coordination during large-scale emergency with ARC mass care support.', '2024-04-30', NULL),

((SELECT id FROM organizations WHERE name = 'Children''s National Hospital'), '2024-04-07', 'Children''s National Hospital', 'Pediatric emergency preparedness meeting. Reviewed specialized care protocols, family reunification procedures, and child-friendly shelter operations during disasters.', '2024-05-07', NULL),

-- Corporate foundation meetings
((SELECT id FROM organizations WHERE name = 'Home Depot Foundation'), '2024-04-14', 'Home Depot Regional Office', 'Disaster relief supply coordination. Discussed pre-positioning of emergency supplies, volunteer team deployment, and corporate matching gift programs for disaster response.', '2024-07-14', NULL),

((SELECT id FROM organizations WHERE name = 'Walmart Foundation'), '2024-04-21', 'Walmart Distribution Center', 'Supply chain partnership meeting. Reviewed emergency procurement procedures, logistics support capabilities, and employee volunteer program for disaster response operations.', '2024-05-21', NULL),

-- Blood services coordination
((SELECT id FROM organizations WHERE name = 'Inova Blood Donor Services'), '2024-04-28', 'Inova Blood Center', 'Emergency blood collection planning. Discussed mobile blood drive deployment, donor communication strategies, and coordination with ARC blood services during regional emergencies.', '2024-06-28', NULL),

-- International coordination
((SELECT id FROM organizations WHERE name = 'International Federation of Red Cross'), '2024-05-05', 'Virtual Meeting', 'Global disaster response coordination call. Shared best practices from international operations, discussed resource sharing agreements, and planned joint training exercises.', '2024-08-05', NULL),

-- Recent operational meetings
((SELECT id FROM organizations WHERE name = 'Montgomery County Fire & Rescue'), '2024-05-12', 'Montgomery County Fire Station 1', 'Multi-agency response exercise debrief. Reviewed performance during recent severe weather response, identified improvement areas, and planned follow-up training sessions.', '2024-06-12', NULL),

((SELECT id FROM organizations WHERE name = 'Virginia Department of Emergency Management'), '2024-05-19', 'Virginia EOC', 'State-level disaster preparedness review. Assessed regional capabilities, reviewed mutual aid agreements, and planned summer disaster preparedness campaign coordination.', '2024-07-19', NULL),

-- Upcoming strategic meetings
((SELECT id FROM organizations WHERE name = 'Food & Friends'), '2024-05-26', 'Food & Friends Kitchen', 'Emergency feeding operations planning. Discussed meal production capacity, special dietary needs accommodation, and coordination with ARC mass feeding during large-scale responses.', '2024-07-26', NULL),

((SELECT id FROM organizations WHERE name = 'DC Central Kitchen'), '2024-06-02', 'DC Central Kitchen', 'Community kitchen coordination meeting. Planned joint food production, volunteer coordination, and distribution logistics for emergency feeding operations in the DC metro area.', '2024-08-02', NULL);

-- Success message
SELECT 'Comprehensive sample data inserted successfully!' as message,
       'Organizations: ' || (SELECT COUNT(*) FROM organizations) as org_count,
       'People: ' || (SELECT COUNT(*) FROM people) as people_count,
       'Meetings: ' || (SELECT COUNT(*) FROM meetings) as meetings_count;