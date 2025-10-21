// Setup database tables and sample data via Supabase API
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up database tables and sample data...')
  
  try {
    // Create people table
    console.log('Creating people table...')
    const { error: peopleTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS people (
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
        
        CREATE INDEX IF NOT EXISTS people_org_idx ON people (org_id);
        CREATE INDEX IF NOT EXISTS people_email_idx ON people (email);
      `
    })
    
    if (peopleTableError) {
      console.log('People table might already exist, continuing...')
    }

    // Create meetings table
    console.log('Creating meetings table...')
    const { error: meetingsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS meetings (
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
        
        CREATE INDEX IF NOT EXISTS meetings_org_idx ON meetings (org_id);
        CREATE INDEX IF NOT EXISTS meetings_date_idx ON meetings (date);
      `
    })
    
    if (meetingsTableError) {
      console.log('Meetings table might already exist, continuing...')
    }

    // Insert sample organizations
    console.log('Inserting sample organizations...')
    const sampleOrgs = [
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
      }
    ]

    for (const org of sampleOrgs) {
      const { error } = await supabase
        .from('organizations')
        .upsert(org, { onConflict: 'name' })
      
      if (error) {
        console.log(`Error inserting ${org.name}:`, error.message)
      } else {
        console.log(`✅ Inserted: ${org.name}`)
      }
    }

    // Get organization IDs for people and meetings
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5)

    if (orgs && orgs.length > 0) {
      // Insert sample people
      console.log('Inserting sample people...')
      const samplePeople = [
        {
          org_id: orgs[0].id,
          first_name: 'Michael',
          last_name: 'Rodriguez',
          title: 'Regional Administrator',
          email: 'michael.rodriguez@fema.dhs.gov',
          phone: '(215) 931-5501',
          notes: 'Primary FEMA contact for regional coordination'
        },
        {
          org_id: orgs[1].id,
          first_name: 'Dr. Sarah',
          last_name: 'Kim',
          title: 'Emergency Department Director',
          email: 'skim@jhmi.edu',
          phone: '(410) 955-5001',
          notes: 'Emergency medical services coordination'
        },
        {
          org_id: orgs[2].id,
          first_name: 'Major John',
          last_name: 'Williams',
          title: 'Area Commander',
          email: 'john.williams@uss.salvationarmy.org',
          phone: '(202) 756-2601',
          notes: 'Salvation Army regional operations'
        }
      ]

      for (const person of samplePeople) {
        const { error } = await supabase
          .from('people')
          .insert(person)
        
        if (error) {
          console.log(`Error inserting person:`, error.message)
        } else {
          console.log(`✅ Inserted: ${person.first_name} ${person.last_name}`)
        }
      }

      // Insert sample meetings
      console.log('Inserting sample meetings...')
      const sampleMeetings = [
        {
          org_id: orgs[0].id,
          date: '2024-01-15',
          location: 'ARC National Headquarters',
          summary: 'Quarterly coordination meeting discussing 2024 disaster preparedness initiatives and resource pre-positioning.',
          follow_up_date: '2024-04-15'
        },
        {
          org_id: orgs[1].id,
          date: '2024-01-28',
          location: 'Johns Hopkins Hospital',
          summary: 'Medical surge planning session. Reviewed hospital capacity and coordination with ARC mass care operations.',
          follow_up_date: '2024-03-01'
        },
        {
          org_id: orgs[2].id,
          date: '2024-02-05',
          location: 'Salvation Army Headquarters',
          summary: 'Emergency shelter coordination meeting. Planned joint shelter operations and volunteer training.',
          follow_up_date: '2024-03-05'
        }
      ]

      for (const meeting of sampleMeetings) {
        const { error } = await supabase
          .from('meetings')
          .insert(meeting)
        
        if (error) {
          console.log(`Error inserting meeting:`, error.message)
        } else {
          console.log(`✅ Inserted meeting with ${orgs.find(o => o.id === meeting.org_id)?.name}`)
        }
      }
    }

    // Check final counts
    const { data: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
    
    const { data: peopleCount } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true })
    
    const { data: meetingCount } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })

    console.log('\n🎉 Database setup complete!')
    console.log(`📊 Final counts:`)
    console.log(`   Organizations: ${orgCount?.length || 0}`)
    console.log(`   People: ${peopleCount?.length || 0}`)
    console.log(`   Meetings: ${meetingCount?.length || 0}`)

  } catch (error) {
    console.error('❌ Error setting up database:', error)
  }
}

// Run the setup
setupDatabase()