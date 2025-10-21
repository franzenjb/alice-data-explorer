// Check database with anon key
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzgzODMsImV4cCI6MjA3NjYxNDM4M30.cC9tlaNQoABPpcL_R_dxbxwjLAi2rDSm4MdBtaDsFg4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkWithAnon() {
  console.log('📋 Checking database with anon key...')
  
  try {
    // Check organizations
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
    
    if (orgError) {
      console.log('❌ Organizations error:', orgError.message)
    } else {
      console.log('✅ Organizations accessible')
      if (orgs && orgs.length > 0) {
        console.log('Available columns:', Object.keys(orgs[0]))
        console.log('Sample data:', orgs[0])
      } else {
        console.log('No data found')
      }
    }

    // Check people
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .limit(1)
    
    if (peopleError) {
      console.log('❌ People error:', peopleError.message)
    } else {
      console.log('✅ People accessible')
      console.log('People count:', people?.length || 0)
    }

    // Check meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .limit(1)
    
    if (meetingsError) {
      console.log('❌ Meetings error:', meetingsError.message)
    } else {
      console.log('✅ Meetings accessible')
      console.log('Meetings count:', meetings?.length || 0)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkWithAnon()