// Test database connection using anon key (like the frontend)
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzgzODMsImV4cCI6MjA3NjYxNDM4M30.cC9tlaNQoABPpcL_R_dxbxwjLAi2rDSm4MdBtaDsFg4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 Testing frontend database connection...')
  
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(5)
    
    if (error) {
      console.log('❌ Frontend connection error:', error.message)
    } else {
      console.log('✅ SUCCESS! Frontend can access data:')
      console.log(`📊 Found ${data.length} organizations:`)
      data.forEach(org => {
        console.log(`  - ${org.name} (${org.organization_type})`)
      })
      console.log('\n🎉 Your ARC Relationship Manager is now fully functional!')
      console.log('🌐 Visit: http://localhost:3000')
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message)
  }
}

testConnection()