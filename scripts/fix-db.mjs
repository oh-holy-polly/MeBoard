import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fix() {
  console.log('Fixing habit_logs table...');
  
  // Мы не можем выполнить ALTER TABLE напрямую через клиент Supabase без расширения rpc
  // Но мы можем попробовать вставить запись с user_id. Если колонки нет, будет ошибка.
  // Самый надежный способ - попросить пользователя выполнить SQL в дашборде Supabase.
  
  console.log('Please execute the following SQL in your Supabase Dashboard SQL Editor:');
  console.log('ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);');
  console.log('ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;');
}

fix();
