const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function publishDrafts() {
  const { data, error } = await supabase
    .from('gigs')
    .update({ status: 'live' })
    .eq('freelancer_id', 'aaaaaaaa-0000-0000-0000-000000000001')
    .eq('status', 'draft');
    
  if (error) {
    console.error('Error updating gigs:', error);
    return;
  }
  console.log('Updated existing drafts to live.');
}

publishDrafts();
