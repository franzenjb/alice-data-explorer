// Execute SQL directly via Supabase client
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQLFile() {
  console.log('🚀 Reading and executing SQL file...')
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('COMPLETE_DATABASE_SETUP.sql', 'utf8')
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      if (stmt.length > 0) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}`)
        
        try {
          // Use the SQL RPC function
          const { data, error } = await supabase.rpc('exec_sql', { sql: stmt })
          
          if (error) {
            console.log(`⚠️  Statement ${i + 1} error:`, error.message)
          } else {
            console.log(`✅ Statement ${i + 1} completed`)
          }
        } catch (e) {
          console.log(`❌ Statement ${i + 1} failed:`, e.message)
        }
      }
    }
    
    // Check final state
    console.log('\n📊 Checking final database state...')
    
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5)
    
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id, first_name, last_name')
      .limit(5)
    
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('id, date, summary')
      .limit(5)
    
    console.log('Organizations:', orgs?.length || 0, orgError ? `(${orgError.message})` : '')
    console.log('People:', people?.length || 0, peopleError ? `(${peopleError.message})` : '')
    console.log('Meetings:', meetings?.length || 0, meetingsError ? `(${meetingsError.message})` : '')
    
    if (orgs && orgs.length > 0) {
      console.log('\n🏢 Sample organizations:')
      orgs.forEach(org => console.log(`  - ${org.name}`))
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

executeSQLFile()