import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Получение или создание пользователя по telegram_id
export async function POST(request: Request) {
  const { telegram_id, username } = await request.json();

  if (!telegram_id) {
    return NextResponse.json({ error: 'Missing telegram_id' }, { status: 400 });
  }

  // Пытаемся найти существующего пользователя
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegram_id)
    .single();

  if (existingUser) {
    return NextResponse.json(existingUser);
  }

  // Если не нашли, создаем нового
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([
      {
        telegram_id,
        username,
      },
    ])
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  return NextResponse.json(newUser, { status: 201 });
}
