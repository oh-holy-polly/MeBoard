import { supabase } from './supabase';

/**
 * Получить задачи на сегодня для конкретного пользователя.
 */
export async function getTodayTasks(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .or(`deadline.gte.${today.toISOString()},deadline.lt.${tomorrow.toISOString()},status.neq.done`)
    .order('priority', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Получить привычки на сегодня вместе со статусом выполнения.
 */
export async function getTodayHabitsWithStatus(userId: string) {
  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`[DEBUG] Запрос привычек для пользователя: ${userId}`);

  try {
    // 1. Получаем ВСЕ привычки пользователя
    const { data: habits, error: hError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (hError) {
      console.error('Ошибка при получении привычек:', hError);
      throw hError;
    }

    console.log(`[DEBUG] Найдено привычек в базе для этого ID: ${habits?.length || 0}`);

    if (!habits || habits.length === 0) return [];

    // 2. Получаем все логи за СЕГОДНЯ для привычек этого пользователя
    const habitIds = habits.map(h => h.id);
    
    const { data: logs, error: lError } = await supabase
      .from('habit_logs')
      .select('habit_id')
      .in('habit_id', habitIds)
      .eq('date', todayStr)
      .eq('completed', true);

    if (lError) {
      console.error('Ошибка при получении логов привычек:', lError);
      // Если колонки нет или другая ошибка логов, просто возвращаем привычки как невыполненные
      return habits.map(h => ({ ...h, is_completed: false }));
    }

    const completedHabitIds = new Set(logs?.map(l => l.habit_id) || []);
    const today = new Date();
    const dayOfWeek = today.getDay();

    return habits.filter((habit) => {
      const config = habit.schedule_config || {};
      // Если тип не указан, считаем ежедневной по умолчанию (для надежности)
      if (!habit.schedule_type || habit.schedule_type === 'daily') return true;
      
      if (habit.schedule_type === 'weekly') {
        return (config.weekdays || []).includes(dayOfWeek);
      }
      if (habit.schedule_type === 'custom') {
        const interval = config.interval || 1;
        const createdAt = new Date(habit.created_at);
        createdAt.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(Math.abs(today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays % interval === 0;
      }
      return false;
    }).map(habit => ({
      ...habit,
      is_completed: completedHabitIds.has(habit.id)
    }));
  } catch (err) {
    console.error('Критическая ошибка в getTodayHabitsWithStatus:', err);
    return [];
  }
}

/**
 * Расчет текущей серии (streak) для привычки.
 */
export async function calculateHabitStreak(habitId: string) {
  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('date')
    .eq('habit_id', habitId)
    .eq('completed', true)
    .order('date', { ascending: false });

  if (error) throw error;
  if (!logs || logs.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentDate = today;

  // Проверяем, была ли отметка сегодня или вчера (чтобы серия не прервалась сразу)
  const lastLogDate = new Date(logs[0].date);
  const diffDays = Math.floor((today.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) return 0; // Пропущено более одного дня

  for (const log of logs) {
    const logDate = new Date(log.date);
    // Здесь должна быть более сложная логика учета расписания (daily/weekly/custom)
    // Для простоты пока считаем только ежедневные
    streak++;
    // TODO: добавить учет пропусков согласно расписанию
  }

  return streak;
}

/**
 * Синхронизировать прогресс цели на основе связанных задач.
 */
export async function syncGoalProgress(goalId: string) {
  // Получаем все задачи, связанные с этой целью
  const { data: tasks, error: tError } = await supabase
    .from('tasks')
    .select('status')
    .eq('goal_id', goalId);

  if (tError) throw tError;
  if (!tasks || tasks.length === 0) return 0;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  // Обновляем прогресс в таблице целей
  const { error: gError } = await supabase
    .from('goals')
    .update({ progress })
    .eq('id', goalId);

  if (gError) throw gError;

  return progress;
}


