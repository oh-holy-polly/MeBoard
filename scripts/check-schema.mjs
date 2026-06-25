import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('--- Проверка таблицы reflections ---');
  const { data, error } = await supabase.from('reflections').select('id').limit(1);
  if (error) {
    console.log('❌ Таблица reflections не найдена или нет доступа:', error.message);
    console.log('   → Нужно применить migration_003_reflection.sql в Supabase SQL Editor');
  } else {
    console.log('✅ Таблица reflections существует, строк:', data?.length ?? 0);
  }

  console.log('--- Проверка таблицы reflection_responses ---');
  const { data: data2, error: error2 } = await supabase.from('reflection_responses').select('id').limit(1);
  if (error2) {
    console.log('❌ Таблица reflection_responses не найдена или нет доступа:', error2.message);
  } else {
    console.log('✅ Таблица reflection_responses существует, строк:', data2?.length ?? 0);
  }
}

checkSchema();
