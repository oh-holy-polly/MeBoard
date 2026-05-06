import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Обновление прогресса или заголовка цели
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from('goals')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  return NextResponse.json(data[0]);
}

