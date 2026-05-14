import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { syncGoalProgress } from '@/lib/productivity-logic';

// Обновление задачи
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from('tasks')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const updatedTask = data[0];

  // Если задача связана с целью, синхронизируем прогресс цели
  if (updatedTask.goal_id) {
    try {
      await syncGoalProgress(updatedTask.goal_id);
    } catch (syncError) {
      console.error('Failed to sync goal progress:', syncError);
    }
  }

  return NextResponse.json(updatedTask);
}


// Удаление задачи
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

