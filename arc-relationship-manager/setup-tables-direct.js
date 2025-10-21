// Setup database tables directly using Supabase client
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupComplete() {
  console.log('🚀 Setting up complete ARC Relationship Manager...')
  
  try {
    // Sample organizations data
    const organizations = [
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
        notes: 'Federal emergency management coordination for Mid-Atlantic region',
        status: 'active'
      },
      {
        name: 'Washington DC Emergency Management Agency',
        mission_area: 'disaster_relief',
        organization_type: 'government',
        address: '2720 Martin Luther King Jr Avenue SE',
        city: 'Washington',
        state: 'DC',
        zip: '20032',
        website: 'https://hsema.dc.gov',
        phone: '(202) 727-6161',
        notes: 'District emergency response coordination',
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
        notes: 'Local fire and emergency medical services',
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
        notes: 'Major medical center partnership for emergency response and surge capacity',
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
        notes: 'Regional trauma center and medical surge partner',
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
        notes: 'Emergency shelter, feeding, and family services coordination',
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
        notes: 'Cloud infrastructure and disaster recovery technology solutions',
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
        notes: 'Interfaith disaster response and spiritual care coordination',
        status: 'active'
      }
    ]

    // Insert organizations
    console.log('🏢 Inserting organizations...')
    for (const org of organizations) {
      const { data, error } = await supabase
        .from('organizations')
        .upsert(org, { onConflict: 'name' })
        .select()
      
      if (error) {
        console.log(`❌ Error inserting ${org.name}:`, error.message)
      } else {
        console.log(`✅ Inserted: ${org.name}`)
      }
    }

    // Get organization IDs for people
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(8)

    if (orgData && orgData.length > 0) {
      // Sample people data
      const people = [
        {
          org_id: orgData[0].id, // FEMA
          first_name: 'Michael',
          last_name: 'Rodriguez',
          title: 'Regional Administrator',
          email: 'michael.rodriguez@fema.dhs.gov',
          phone: '(215) 931-5501',
          notes: 'Primary FEMA contact for regional coordination and disaster response planning'
        },
        {
          org_id: orgData[0].id, // FEMA
          first_name: 'Jennifer',
          last_name: 'Chen',
          title: 'Deputy Regional Administrator',
          email: 'jennifer.chen@fema.dhs.gov',
          phone: '(215) 931-5502',
          notes: 'FEMA deputy administrator for operations and logistics'
        },
        {
          org_id: orgData[3].id, // Johns Hopkins
          first_name: 'Dr. Sarah',
          last_name: 'Kim',
          title: 'Emergency Department Director',
          email: 'skim@jhmi.edu',
          phone: '(410) 955-5001',
          notes: 'Emergency medical services and hospital surge capacity coordination'
        },
        {
          org_id: orgData[3].id, // Johns Hopkins
          first_name: 'Dr. Robert',
          last_name: 'Anderson',
          title: 'Chief Medical Officer',
          email: 'randerson@jhmi.edu',
          phone: '(410) 955-5002',
          notes: 'Medical response planning and healthcare system coordination'
        },
        {
          org_id: orgData[5].id, // Salvation Army
          first_name: 'Major John',
          last_name: 'Williams',
          title: 'Area Commander',
          email: 'john.williams@uss.salvationarmy.org',
          phone: '(202) 756-2601',
          notes: 'Salvation Army regional operations and emergency services'
        },
        {
          org_id: orgData[6].id, // AWS
          first_name: 'Lisa',
          last_name: 'Thompson',
          title: 'Public Sector Solutions Architect',
          email: 'lisath@amazon.com',
          phone: '(206) 266-1001',
          notes: 'AWS disaster recovery and cloud infrastructure solutions'
        }
      ]

      // Insert people
      console.log('👥 Inserting people...')
      for (const person of people) {
        const { data, error } = await supabase
          .from('people')
          .insert(person)
          .select()
        
        if (error) {
          console.log(`❌ Error inserting person:`, error.message)
        } else {
          console.log(`✅ Inserted: ${person.first_name} ${person.last_name}`)
        }
      }

      // Sample meetings data
      const meetings = [
        {
          org_id: orgData[0].id, // FEMA
          date: '2024-01-15',
          location: 'ARC National Headquarters, Washington DC',
          summary: 'Quarterly coordination meeting discussing 2024 disaster preparedness initiatives, resource pre-positioning strategies, and joint exercise planning. Reviewed updated FEMA region priorities and ARC chapter capabilities.',
          follow_up_date: '2024-04-15'
        },
        {
          org_id: orgData[3].id, // Johns Hopkins
          date: '2024-01-28',
          location: 'Johns Hopkins Hospital Administrative Building',
          summary: 'Medical surge planning session focused on hospital capacity during large-scale emergencies. Discussed ARC mass care coordination with medical facilities and patient transport protocols.',
          follow_up_date: '2024-03-01'
        },
        {
          org_id: orgData[5].id, // Salvation Army
          date: '2024-02-05',
          location: 'Salvation Army National Capital Area Headquarters',
          summary: 'Emergency shelter coordination meeting. Planned joint shelter operations, volunteer training schedules, and resource sharing agreements. Established communication protocols for rapid deployment.',
          follow_up_date: '2024-03-05'
        },
        {
          org_id: orgData[6].id, // AWS
          date: '2024-02-12',
          location: 'Virtual Meeting (AWS Connect)',
          summary: 'Technology partnership discussion focused on cloud-based disaster management systems, data backup solutions, and emergency communication platforms. Explored ARC digital transformation opportunities.',
          follow_up_date: '2024-03-15'
        }
      ]

      // Insert meetings
      console.log('📅 Inserting meetings...')
      for (const meeting of meetings) {
        const { data, error } = await supabase
          .from('meetings')
          .insert(meeting)
          .select()
        
        if (error) {
          console.log(`❌ Error inserting meeting:`, error.message)
        } else {
          console.log(`✅ Inserted meeting with ${orgData.find(o => o.id === meeting.org_id)?.name}`)
        }
      }
    }

    // Final counts
    console.log('\n📊 Checking final counts...')
    
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
    
    const { count: peopleCount } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true })
    
    const { count: meetingCount } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })

    console.log('🎉 Database setup complete!')
    console.log(`Organizations: ${orgCount || 0}`)
    console.log(`People: ${peopleCount || 0}`)
    console.log(`Meetings: ${meetingCount || 0}`)

  } catch (error) {
    console.error('❌ Setup error:', error.message)
  }
}

setupComplete()