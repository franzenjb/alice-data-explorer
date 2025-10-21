// Complete database setup - Create all tables and comprehensive sample data
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    if (error) throw error
    return data
  } catch (error) {
    console.log('SQL execution note:', error.message)
    return null
  }
}

async function setupCompleteDatabase() {
  console.log('🚀 Setting up complete ARC Relationship Manager database...')
  
  try {
    // Step 1: Clean slate - drop existing tables
    console.log('🧹 Cleaning existing tables...')
    await executeSQL(`
      DROP TABLE IF EXISTS attachments CASCADE;
      DROP TABLE IF EXISTS meetings CASCADE;
      DROP TABLE IF EXISTS people CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
      DROP TABLE IF EXISTS user_profiles CASCADE;
      DROP TABLE IF EXISTS activity_log CASCADE;
    `)

    // Step 2: Create organizations table
    console.log('📊 Creating organizations table...')
    await executeSQL(`
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
    `)

    // Step 3: Create people table
    console.log('👥 Creating people table...')
    await executeSQL(`
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
    `)

    // Step 4: Create meetings table
    console.log('📅 Creating meetings table...')
    await executeSQL(`
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
    `)

    // Step 5: Create indexes
    console.log('🔍 Creating indexes...')
    await executeSQL(`
      CREATE INDEX organizations_name_idx ON organizations (name);
      CREATE INDEX organizations_status_idx ON organizations (status);
      CREATE INDEX organizations_mission_area_idx ON organizations (mission_area);
      CREATE INDEX people_org_idx ON people (org_id);
      CREATE INDEX people_email_idx ON people (email);
      CREATE INDEX meetings_org_idx ON meetings (org_id);
      CREATE INDEX meetings_date_idx ON meetings (date);
    `)

    // Step 6: Insert comprehensive sample organizations
    console.log('🏢 Inserting sample organizations...')
    const organizations = [
      // Government Partners
      {
        name: 'FEMA Region III',
        mission_area: 'disaster_relief',
        organization_type: 'government',
        address: '615 Chestnut Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19106',
        website: 'https://www.fema.gov/region-iii',
        phone: '(215) 931-5500',
        notes: 'Federal emergency management coordination',
        status: 'active'
      },
      {
        name: 'Washington DC Emergency Management Agency',
        mission_area: 'disaster_relief',
        organization_type: 'government',
        address: '2720 Martin Luther King Jr Ave SE',
        city: 'Washington',
        state: 'DC',
        zip: '20032',
        website: 'https://hsema.dc.gov',
        phone: '(202) 727-6161',
        notes: 'Primary emergency management partner for DC region',
        status: 'active'
      },
      {
        name: 'Montgomery County Fire & Rescue',
        mission_area: 'disaster_relief',
        organization_type: 'government',
        address: '101 Monroe Street',
        city: 'Rockville',
        state: 'MD',
        zip: '20850',
        website: 'https://www.montgomerycountymd.gov/mcfrs',
        phone: '(240) 777-2444',
        notes: 'Local fire and emergency services partner',
        status: 'active'
      },
      // Healthcare Partners
      {
        name: 'Johns Hopkins Hospital',
        mission_area: 'health_safety',
        organization_type: 'healthcare',
        address: '1800 Orleans Street',
        city: 'Baltimore',
        state: 'MD',
        zip: '21287',
        website: 'https://www.hopkinsmedicine.org',
        phone: '(410) 955-5000',
        notes: 'Major medical center partnership for emergency response',
        status: 'active'
      },
      {
        name: 'MedStar Washington Hospital Center',
        mission_area: 'health_safety',
        organization_type: 'healthcare',
        address: '110 Irving Street NW',
        city: 'Washington',
        state: 'DC',
        zip: '20010',
        website: 'https://www.medstarwashington.org',
        phone: '(202) 877-7000',
        notes: 'Trauma center and emergency medical services',
        status: 'active'
      },
      {
        name: 'Children\'s National Hospital',
        mission_area: 'health_safety',
        organization_type: 'healthcare',
        address: '111 Michigan Avenue NW',
        city: 'Washington',
        state: 'DC',
        zip: '20010',
        website: 'https://childrensnational.org',
        phone: '(202) 476-5000',
        notes: 'Pediatric emergency care coordination',
        status: 'active'
      },
      // Nonprofit Partners
      {
        name: 'Salvation Army National Capital Area',
        mission_area: 'disaster_relief',
        organization_type: 'nonprofit',
        address: '2626 Pennsylvania Avenue NW',
        city: 'Washington',
        state: 'DC',
        zip: '20037',
        website: 'https://salvationarmynca.org',
        phone: '(202) 756-2600',
        notes: 'Emergency shelter and food services partner',
        status: 'active'
      },
      {
        name: 'United Way of the National Capital Area',
        mission_area: 'disaster_relief',
        organization_type: 'nonprofit',
        address: '2200 Clarendon Boulevard',
        city: 'Arlington',
        state: 'VA',
        zip: '22201',
        website: 'https://unitedwaynca.org',
        phone: '(703) 536-1000',
        notes: 'Community coordination and volunteer mobilization',
        status: 'active'
      },
      {
        name: 'Food & Friends',
        mission_area: 'health_safety',
        organization_type: 'nonprofit',
        address: '219 Riggs Road NE',
        city: 'Washington',
        state: 'DC',
        zip: '20011',
        website: 'https://foodandfriends.org',
        phone: '(202) 269-2277',
        notes: 'Meal delivery for vulnerable populations',
        status: 'active'
      },
      // Corporate Partners
      {
        name: 'Amazon Web Services',
        mission_area: 'disaster_relief',
        organization_type: 'business',
        address: '410 Terry Avenue North',
        city: 'Seattle',
        state: 'WA',
        zip: '98109',
        website: 'https://aws.amazon.com',
        phone: '(206) 266-1000',
        notes: 'Cloud infrastructure and disaster recovery technology',
        status: 'active'
      },
      {
        name: 'Microsoft Corporation',
        mission_area: 'disaster_relief',
        organization_type: 'business',
        address: 'One Microsoft Way',
        city: 'Redmond',
        state: 'WA',
        zip: '98052',
        website: 'https://www.microsoft.com',
        phone: '(425) 882-8080',
        notes: 'Technology solutions for emergency response',
        status: 'active'
      },
      // Faith-based Organizations
      {
        name: 'Washington National Cathedral',
        mission_area: 'disaster_relief',
        organization_type: 'faith_based',
        address: '3101 Wisconsin Avenue NW',
        city: 'Washington',
        state: 'DC',
        zip: '20016',
        website: 'https://cathedral.org',
        phone: '(202) 537-6200',
        notes: 'Interfaith disaster response coordination',
        status: 'active'
      },
      // Educational Institutions
      {
        name: 'George Washington University',
        mission_area: 'health_safety',
        organization_type: 'educational',
        address: '2121 I Street NW',
        city: 'Washington',
        state: 'DC',
        zip: '20052',
        website: 'https://www.gwu.edu',
        phone: '(202) 994-1000',
        notes: 'University emergency management and student volunteers',
        status: 'active'
      }
    ]

    for (const org of organizations) {
      const { error } = await supabase
        .from('organizations')
        .insert(org)
      
      if (error) {
        console.log(`⚠️  Error inserting ${org.name}:`, error.message)
      } else {
        console.log(`✅ Inserted: ${org.name}`)
      }
    }

    // Step 7: Get organization IDs for people and meetings
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name')

    if (orgs && orgs.length > 0) {
      // Step 8: Insert sample people
      console.log('👥 Inserting sample people...')
      const people = [
        // FEMA contacts
        {
          org_id: orgs.find(o => o.name === 'FEMA Region III')?.id,
          first_name: 'Michael',
          last_name: 'Rodriguez',
          title: 'Regional Administrator',
          email: 'michael.rodriguez@fema.dhs.gov',
          phone: '(215) 931-5501',
          notes: 'Primary FEMA contact for regional coordination'
        },
        {
          org_id: orgs.find(o => o.name === 'FEMA Region III')?.id,
          first_name: 'Jennifer',
          last_name: 'Thompson',
          title: 'Emergency Management Specialist',
          email: 'jennifer.thompson@fema.dhs.gov',
          phone: '(215) 931-5502',
          notes: 'Disaster response planning and operations'
        },
        // Johns Hopkins
        {
          org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id,
          first_name: 'Dr. Sarah',
          last_name: 'Kim',
          title: 'Emergency Department Director',
          email: 'skim@jhmi.edu',
          phone: '(410) 955-5001',
          notes: 'Emergency medical services coordination'
        },
        {
          org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id,
          first_name: 'Robert',
          last_name: 'Chen',
          title: 'Emergency Preparedness Manager',
          email: 'rchen@jhmi.edu',
          phone: '(410) 955-5002',
          notes: 'Hospital emergency planning and response'
        },
        // Salvation Army
        {
          org_id: orgs.find(o => o.name === 'Salvation Army National Capital Area')?.id,
          first_name: 'Major John',
          last_name: 'Williams',
          title: 'Area Commander',
          email: 'john.williams@uss.salvationarmy.org',
          phone: '(202) 756-2601',
          notes: 'Salvation Army regional operations'
        },
        {
          org_id: orgs.find(o => o.name === 'Salvation Army National Capital Area')?.id,
          first_name: 'Captain Mary',
          last_name: 'Davis',
          title: 'Emergency Services Director',
          email: 'mary.davis@uss.salvationarmy.org',
          phone: '(202) 756-2602',
          notes: 'Shelter and feeding operations'
        },
        // AWS
        {
          org_id: orgs.find(o => o.name === 'Amazon Web Services')?.id,
          first_name: 'Dr. Patricia',
          last_name: 'Lee',
          title: 'Public Sector Director',
          email: 'patlee@amazon.com',
          phone: '(206) 266-1001',
          notes: 'Government and nonprofit cloud solutions'
        },
        // Microsoft
        {
          org_id: orgs.find(o => o.name === 'Microsoft Corporation')?.id,
          first_name: 'Emily',
          last_name: 'Zhang',
          title: 'Nonprofit Partnerships Director',
          email: 'emzhang@microsoft.com',
          phone: '(425) 882-8081',
          notes: 'Technology for social impact initiatives'
        },
        // Cathedral
        {
          org_id: orgs.find(o => o.name === 'Washington National Cathedral')?.id,
          first_name: 'Rev. Dr. James',
          last_name: 'Anderson',
          title: 'Canon for Social Justice',
          email: 'anderson@cathedral.org',
          phone: '(202) 537-6201',
          notes: 'Interfaith emergency response coordination'
        },
        // GWU
        {
          org_id: orgs.find(o => o.name === 'George Washington University')?.id,
          first_name: 'Dr. Amanda',
          last_name: 'Scott',
          title: 'Emergency Management Director',
          email: 'ascott@gwu.edu',
          phone: '(202) 994-1001',
          notes: 'Campus emergency planning and student volunteers'
        }
      ].filter(p => p.org_id) // Only include people with valid org_id

      for (const person of people) {
        const { error } = await supabase
          .from('people')
          .insert(person)
        
        if (error) {
          console.log(`⚠️  Error inserting person:`, error.message)
        } else {
          console.log(`✅ Inserted: ${person.first_name} ${person.last_name}`)
        }
      }

      // Step 9: Insert sample meetings
      console.log('📅 Inserting sample meetings...')
      const meetings = [
        {
          org_id: orgs.find(o => o.name === 'FEMA Region III')?.id,
          date: '2024-01-15',
          location: 'ARC National Headquarters',
          summary: 'Quarterly coordination meeting discussing 2024 disaster preparedness initiatives, resource pre-positioning, and training schedules. Reviewed lessons learned from 2023 response operations.',
          follow_up_date: '2024-04-15'
        },
        {
          org_id: orgs.find(o => o.name === 'Washington DC Emergency Management Agency')?.id,
          date: '2024-01-22',
          location: 'DC Emergency Operations Center',
          summary: 'Winter weather preparedness meeting. Discussed shelter activation protocols, warming center coordination, and public messaging strategies for severe weather events.',
          follow_up_date: '2024-02-22'
        },
        {
          org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id,
          date: '2024-01-28',
          location: 'Johns Hopkins Hospital',
          summary: 'Medical surge planning session. Reviewed hospital capacity, patient flow procedures, and coordination with ARC mass care operations during large-scale emergencies.',
          follow_up_date: '2024-03-01'
        },
        {
          org_id: orgs.find(o => o.name === 'Salvation Army National Capital Area')?.id,
          date: '2024-02-05',
          location: 'Salvation Army Headquarters',
          summary: 'Emergency shelter coordination meeting. Planned joint shelter operations, volunteer training schedules, and resource sharing agreements for 2024 disaster season.',
          follow_up_date: '2024-03-05'
        },
        {
          org_id: orgs.find(o => o.name === 'Amazon Web Services')?.id,
          date: '2024-02-18',
          location: 'Virtual Meeting',
          summary: 'Cloud infrastructure for disaster response presentation. AWS demonstrated emergency data backup, communication systems, and mobile app deployment capabilities for field operations.',
          follow_up_date: '2024-03-18'
        },
        {
          org_id: orgs.find(o => o.name === 'Microsoft Corporation')?.id,
          date: '2024-02-25',
          location: 'Microsoft Office',
          summary: 'Digital transformation for emergency response. Reviewed Teams implementation for incident management, SharePoint for resource tracking, and Power BI for operational dashboards.',
          follow_up_date: '2024-04-25'
        },
        {
          org_id: orgs.find(o => o.name === 'Washington National Cathedral')?.id,
          date: '2024-03-03',
          location: 'Washington National Cathedral',
          summary: 'Interfaith disaster response coordination. Representatives from 15 faith communities discussed shelter hosting, volunteer mobilization, and spiritual care services.',
          follow_up_date: '2024-06-03'
        },
        {
          org_id: orgs.find(o => o.name === 'George Washington University')?.id,
          date: '2024-03-17',
          location: 'GWU Campus',
          summary: 'Student volunteer program development. Planned disaster response training curriculum, spring break deployment opportunities, and academic credit for emergency management fieldwork.',
          follow_up_date: '2024-04-17'
        }
      ].filter(m => m.org_id) // Only include meetings with valid org_id

      for (const meeting of meetings) {
        const { error } = await supabase
          .from('meetings')
          .insert(meeting)
        
        if (error) {
          console.log(`⚠️  Error inserting meeting:`, error.message)
        } else {
          console.log(`✅ Inserted meeting with ${orgs.find(o => o.id === meeting.org_id)?.name}`)
        }
      }
    }

    // Step 10: Final count
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
    
    const { count: peopleCount } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true })
    
    const { count: meetingCount } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })

    console.log('\n🎉 Complete database setup finished!')
    console.log(`📊 Final counts:`)
    console.log(`   Organizations: ${orgCount}`)
    console.log(`   People: ${peopleCount}`)
    console.log(`   Meetings: ${meetingCount}`)
    console.log('\n✨ Your ARC Relationship Manager is ready with comprehensive sample data!')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
  }
}

// Run the complete setup
setupCompleteDatabase()