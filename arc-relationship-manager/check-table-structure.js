// Check actual table structure
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStructure() {
  console.log('📋 Checking current table structure...')
  
  try {
    // Try to get one record to see available columns
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
    
    if (orgError) {
      console.log('❌ Organizations table error:', orgError.message)
    } else {
      console.log('✅ Organizations table exists')
      if (orgData && orgData.length > 0) {
        console.log('Available columns:', Object.keys(orgData[0]))
      } else {
        console.log('Table is empty, trying to insert a simple record...')
        
        // Try minimal insert to see what columns are required
        const { data: insertData, error: insertError } = await supabase
          .from('organizations')
          .insert({ name: 'Test Organization' })
          .select()
        
        if (insertError) {
          console.log('Insert error:', insertError.message)
        } else {
          console.log('✅ Simple insert worked, columns:', Object.keys(insertData[0]))
          
          // Clean up test record
          await supabase
            .from('organizations')
            .delete()
            .eq('name', 'Test Organization')
        }
      }
    }
    
    // Try to get metadata about the table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'organizations' })
    
    if (tableError) {
      console.log('Table metadata not available:', tableError.message)
    } else {
      console.log('Table metadata:', tableInfo)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkStructure()