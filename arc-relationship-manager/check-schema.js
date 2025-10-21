// Check current database schema
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('📋 Checking current database schema...')
  
  try {
    // Check organizations table
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
    
    if (orgError) {
      console.log('❌ Organizations table error:', orgError.message)
    } else {
      console.log('✅ Organizations table exists')
      if (orgs && orgs.length > 0) {
        console.log('   Columns:', Object.keys(orgs[0]))
      }
    }

    // Check people table
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .limit(1)
    
    if (peopleError) {
      console.log('❌ People table error:', peopleError.message)
    } else {
      console.log('✅ People table exists')
      if (people && people.length > 0) {
        console.log('   Columns:', Object.keys(people[0]))
      }
    }

    // Check meetings table
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .limit(1)
    
    if (meetingsError) {
      console.log('❌ Meetings table error:', meetingsError.message)
    } else {
      console.log('✅ Meetings table exists')
      if (meetings && meetings.length > 0) {
        console.log('   Columns:', Object.keys(meetings[0]))
      }
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error)
  }
}

checkSchema()