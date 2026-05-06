import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkData() {
  console.log('--- Все записи в habit_logs ---');
  const { data: logs, error } = await supabase.from('habit_logs').select('*');
  
  if (error) {
    console.error('Ошибка:', error);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log('Логов нет вообще.');
  } else {
    console.log(JSON.stringify(logs, null, 2));
  }
}

checkData();
