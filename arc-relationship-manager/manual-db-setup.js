// Manual database setup - execute operations step by step
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function manualSetup() {
  console.log('🚀 Manual database setup - using simple data operations...')
  
  try {
    // Step 1: Clean up existing data (if any)
    console.log('🧹 Cleaning existing data...')
    
    // We'll insert organizations with minimal fields first to see what works
    console.log('📋 Testing simple organization insert...')
    
    const testOrg = {
      name: 'Test Organization',
      status: 'active'
    }
    
    const { data: testResult, error: testError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select()
    
    if (testError) {
      console.log('❌ Test insert failed:', testError.message)
      console.log('Let me try to see what columns exist by checking existing data...')
      
      const { data: existingData, error: existingError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)
      
      if (existingError) {
        console.log('❌ Cannot read existing data:', existingError.message)
        return
      } else {
        console.log('✅ Successfully read organizations table')
        if (existingData && existingData.length > 0) {
          console.log('Available columns:', Object.keys(existingData[0]))
        } else {
          console.log('Table is empty')
        }
      }
    } else {
      console.log('✅ Test insert successful!')
      console.log('Available columns:', Object.keys(testResult[0]))
      
      // Delete test record
      await supabase
        .from('organizations')
        .delete()
        .eq('name', 'Test Organization')
      
      // Now insert real data using only the columns we know exist
      const organizations = [
        {
          name: 'FEMA Region III',
          status: 'active'
        },
        {
          name: 'Johns Hopkins Hospital',
          status: 'active'
        },
        {
          name: 'Salvation Army National Capital Area',
          status: 'active'
        },
        {
          name: 'Amazon Web Services',
          status: 'active'
        },
        {
          name: 'Washington National Cathedral',
          status: 'active'
        }
      ]
      
      console.log('🏢 Inserting real organizations...')
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
    }
    
    // Final count check
    const { count } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n🎉 Setup complete! Organizations in database: ${count || 0}`)
    
    // Try to access the actual application data
    console.log('\n📊 Testing application data access...')
    const { data: appData, error: appError } = await supabase
      .from('organizations')
      .select('*')
      .limit(3)
    
    if (appError) {
      console.log('❌ App data access error:', appError.message)
    } else {
      console.log('✅ App can access organization data:')
      appData.forEach(org => {
        console.log(`  - ${org.name} (ID: ${org.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Setup error:', error.message)
  }
}

manualSetup()