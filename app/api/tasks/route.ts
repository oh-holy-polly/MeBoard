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
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        ...body,
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}

