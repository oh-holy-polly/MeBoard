import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listUsers() {
  const { data: users } = await supabase.from('users').select('*');
  console.log(JSON.stringify(users, null, 2));
}

listUsers();
