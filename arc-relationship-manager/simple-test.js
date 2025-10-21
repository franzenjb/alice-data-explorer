// Simple test to understand what's working
const { createClient } = require('@supabase/supabase-js')

// Using anon key like the frontend does
const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzgzODMsImV4cCI6MjA3NjYxNDM4M30.cC9tlaNQoABPpcL_R_dxbxwjLAi2rDSm4MdBtaDsFg4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function simpleTest() {
  console.log('🔍 Testing basic Supabase connectivity...')
  
  try {
    // Test 1: Can we authenticate?
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.log('📝 No authenticated user (expected for anon key)')
    } else {
      console.log('✅ User authenticated:', authData.user?.email)
    }

    // Test 2: Can we access any tables at all?
    console.log('\n🔍 Testing table access...')
    
    // Try to get a simple list from Supabase API
    const { data: healthCheck, error: healthError } = await supabase
      .from('organizations')
      .select('count')
      .single()
    
    if (healthError) {
      console.log('❌ Organizations table access error:', healthError.message)
      
      // Maybe the table doesn't exist? Let's try a different approach
      console.log('\n🔧 Attempting to create data via the service key...')
      
      // Switch to service key for table creation
      const serviceSupabase = createClient(
        supabaseUrl, 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'
      )
      
      // Try a minimal insert with service key
      const { data: serviceTest, error: serviceError } = await serviceSupabase
        .from('organizations')
        .insert({ name: 'Test Org' })
        .select()
      
      if (serviceError) {
        console.log('❌ Service key test failed:', serviceError.message)
        console.log('\n💡 This suggests the tables need to be created in Supabase dashboard')
        console.log('Please go to https://supabase.com/dashboard and:')
        console.log('1. Open your project')
        console.log('2. Go to Table Editor')
        console.log('3. Create the organizations table manually')
        console.log('4. Add RLS policies to allow public read access')
      } else {
        console.log('✅ Service key worked! Created organization:', serviceTest[0])
        
        // Clean up test record
        await serviceSupabase
          .from('organizations')
          .delete()
          .eq('name', 'Test Org')
        
        console.log('✅ Database is working - the issue is with RLS policies')
        console.log('💡 Need to add RLS policies to allow anon access')
      }
    } else {
      console.log('✅ Organizations table accessible!')
      console.log('Data:', healthCheck)
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message)
  }
}

simpleTest()