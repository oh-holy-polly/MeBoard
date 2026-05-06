import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTodayHabitsWithStatus } from '@/lib/productivity-logic';

// Получение списка привычек со статусом на сегодня
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });
  }

  try {
    const data = await getTodayHabitsWithStatus(userId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Создание привычки
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from('habits')
    .insert([
      {
        name: body.name,
        category: body.category,
        schedule_type: body.schedule_type,
        schedule_config: body.schedule_config || {},
        user_id: userId,
      },
    ])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}


