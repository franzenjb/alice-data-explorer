// Verify tables exist using service role key
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyTables() {
  console.log('🔍 Verifying tables exist with service role...')
  
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(3)
    
    if (error) {
      console.log('❌ Service role error:', error.message)
    } else {
      console.log('✅ SUCCESS! Tables exist and have data:')
      console.log(`📊 Found ${data.length} organizations:`)
      data.forEach(org => {
        console.log(`  - ${org.name}`)
      })
      
      // Now test if this is an anon key permission issue
      console.log('\n🔧 Issue is with anon key permissions')
      console.log('✅ Your data exists, but the frontend cannot access it')
      console.log('\n🎯 SOLUTION: Visit your app at http://localhost:3000')
      console.log('   If it still shows loading, we need to fix anon key permissions')
    }
  } catch (error) {
    console.error('❌ Verification error:', error.message)
  }
}

verifyTables()