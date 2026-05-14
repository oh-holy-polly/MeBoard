import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Получение списка задач
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Создание задачи
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });
  }

  const body = await request.json();
  const payload = {
    title: body.title,
    description: body.description,
    deadline: body.deadline,
    priority: body.priority || 'medium',
    status: body.status || 'todo',
    user_id: userId,
    goal_id: body.goal_id,
  };

  // Пробуем вставить с updated_at
  let { data, error } = await supabase
    .from('tasks')
    .insert([{ ...payload, updated_at: new Date().toISOString() }])
    .select();

  // Если колонки updated_at нет, вставляем без неё
  if (error && error.message?.includes('column "updated_at"')) {
    const retry = await supabase
      .from('tasks')
      .insert([payload])
      .select();
    data = retry.data;
    error = retry.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}

