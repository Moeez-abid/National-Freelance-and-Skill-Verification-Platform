const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkGigs() {
  const { data, error } = await supabase.from('gigs').select('*');
  if (error) {
    console.error('Error fetching gigs:', error);
    return;
  }
  console.log('Total gigs in DB:', data.length);
  data.forEach(g => {
    console.log(`- [${g.status}] ID: ${g.id} | Title: ${g.title} | Freelancer: ${g.freelancer_id}`);
  });
}

checkGigs();
