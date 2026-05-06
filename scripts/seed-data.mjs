import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  console.log('Seeding data...');

  // 1. Создаем пользователя
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({ telegram_id: 12345, username: 'Polina' })
    .select()
    .single();

  if (userError) {
    console.error('Error creating user:', userError);
    return;
  }
  
  const userId = user.id;
  console.log('User created:', userId);

  // 2. Создаем цели
  const { data: goal } = await supabase
    .from('goals')
    .upsert({ title: 'Запуск MeBoard v1', progress: 65, user_id: userId })
    .select()
    .single();

  // 3. Создаем задачи
  await supabase.from('tasks').upsert([
    { title: 'Доработать дизайн дашборда', status: 'done', user_id: userId, goal_id: goal.id },
    { title: 'Подключить реальные данные', status: 'doing', user_id: userId, goal_id: goal.id },
    { title: 'Протестировать Telegram бота', status: 'todo', user_id: userId }
  ]);

  // 4. Создаем привычки
  await supabase.from('habits').upsert([
    { name: 'Утренняя медитация', schedule_type: 'daily', user_id: userId },
    { name: 'Чтение 30 минут', schedule_type: 'daily', user_id: userId }
  ]);

  console.log('Seed completed successfully!');
}

seed();
