import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const { habit_id, date, completed } = await request.json();

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(
      [{ habit_id, date, completed, user_id: userId }],
      { onConflict: 'habit_id,date' }
    )
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}
