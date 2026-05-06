import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('--- Проверка структуры habit_logs ---');
  // Мы не можем посмотреть схему напрямую, но можем попробовать вставить пустую запись и увидеть ошибку
  const { error } = await supabase.from('habit_logs').insert([{}]);
  console.log('Ошибка при пустой вставке (подскажет колонки):', error?.message);
}

checkSchema();
