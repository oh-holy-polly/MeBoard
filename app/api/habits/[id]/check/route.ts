import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id');
  const habitId = params.id;

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  const todayStr = new Date().toISOString().split('T')[0];

  // Проверяем, есть ли уже отметка на сегодня
  const { data: existingLogs } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('date', todayStr)
    .limit(1);

  if (existingLogs && existingLogs.length > 0) {
    // Если есть - удаляем
    await supabase.from('habit_logs').delete().eq('id', existingLogs[0].id);
    return NextResponse.json({ success: true, action: 'un-checked' });
  } else {
    // Если нет - создаем в правильном формате
    await supabase.from('habit_logs').insert([{
      habit_id: habitId,
      date: todayStr,
      completed: true
      user_id: userId
    }]);
    return NextResponse.json({ success: true, action: 'checked' });
  }

  return NextResponse.json({ success: true });
}
