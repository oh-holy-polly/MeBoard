import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Получение списка целей
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Создание цели
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from('goals')
    .insert([
      {
        title: body.title,
        description: body.description,
        progress: body.progress || 0,
        user_id: userId,
      },
    ])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}

