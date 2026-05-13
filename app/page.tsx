'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Circle, Clock, TrendingUp, Calendar, Zap, Target, 
  Settings, User, Plus, Search, MoreHorizontal, ArrowRight, Loader2, Trash2
} from 'lucide-react';
import LivingSky, { type Star, type DayKey } from './LivingSky';

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [selectedHabitDays, setSelectedHabitDays] = useState<number[]>([]);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskEditDate, setTaskEditDate] = useState('');
  const [taskEditTime, setTaskEditTime] = useState('');
  const [taskEditAllDay, setTaskEditAllDay] = useState(true);
  const [isTaskEditModalOpen, setIsTaskEditModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [goalStep, setGoalStep] = useState(1);
  const [createdGoalId, setCreatedGoalId] = useState<string | null>(null);
  const [goalTaskInputs, setGoalTaskInputs] = useState<string[]>(['']);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isNewTaskAllDay, setIsNewTaskAllDay] = useState(true);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitSchedule, setNewHabitSchedule] = useState('daily');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [loginId, setLoginId] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const linkify = (text: string) => {
    if (!text) return text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-link"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedId = localStorage.getItem('meboard_user_id');
    if (savedId) {
      setUserId(savedId);
    } else {
      setLoading(false);
    }
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const skyStars: Star[] = useMemo(() => {
  const now = new Date();
  const currentDay = now.getDay();              // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayKeys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayKey = dayKeys[diffToMonday];       // ключ сегодняшнего дня

  // Локальная дата YYYY-MM-DD (без UTC-сдвига)
  const formatLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const total = habits.length;

  return dayKeys.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    d.setHours(12, 0, 0, 0);                    // полдень — чтобы избежать DST-граней
    const dateStr = formatLocal(d);
    const isToday = day === todayKey;
    const isFuture = formatLocal(d) > formatLocal(now);

    let done = 0;
    if (!isFuture) {
      done = isToday
        ? habits.filter((h: any) => h.is_completed).length
        : habitLogs.filter((l: any) => l.date === dateStr && l.completed).length;
    }
    return { day, completion: total > 0 ? done / total : 0 };
  });
}, [habits, habitLogs]);

  // Загрузка данных
  const fetchData = async () => {
    if (!userId) return;
    try {
      const headers = { 'x-user-id': userId };
      const [tasksRes, goalsRes, habitsRes, logsRes] = await Promise.all([
        fetch('/api/tasks', { headers }).then(res => res.json()).catch(() => []),
        fetch('/api/goals', { headers }).then(res => res.json()).catch(() => []),
        fetch('/api/habits', { headers }).then(res => res.json()).catch(() => []),
        fetch('/api/habit-logs', { headers }).then(res => res.json()).catch(() => []),
      ]);
      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      setGoals(Array.isArray(goalsRes) ? goalsRes : []);
      setHabits(Array.isArray(habitsRes) ? habitsRes : []);
      setHabitLogs(Array.isArray(logsRes) ? logsRes : []);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) return;

    try {
      // Пытаемся найти пользователя по имени
      const { data: userByName, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', loginId.trim())
        .single();

      const finalId = userByName ? userByName.id : loginId.trim();
      
      localStorage.setItem('meboard_user_id', finalId);
      setUserId(finalId);
    } catch (err) {
      // Если по имени не нашли, пробуем зайти по введенному ID
      localStorage.setItem('meboard_user_id', loginId.trim());
      setUserId(loginId.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('meboard_user_id');
    setUserId(null);
  };

  const openTaskModal = (date?: string) => {
    setNewTaskTitle('');
    setSelectedGoalId('');
    setNewTaskDate(date || new Date().toISOString().split('T')[0]);
    setNewTaskTime('');
    setIsNewTaskAllDay(true);
    setIsTaskModalOpen(true);
  };

  const openTaskEdit = (task: any) => {
    setSelectedTask(task);
    if (task.deadline && (task.deadline.includes(' ') || task.deadline.includes('T'))) {
      const date = new Date(task.deadline);
      const isAllDay = date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
      setTaskEditAllDay(isAllDay);
      setTaskEditDate(task.deadline.split('T')[0] || task.deadline.split(' ')[0]);
      setTaskEditTime(isAllDay ? '' : date.toTimeString().slice(0, 5));
    } else {
      setTaskEditAllDay(true);
      setTaskEditDate(task.deadline || new Date().toISOString().split('T')[0]);
      setTaskEditTime('');
    }
    setOpenDropdownId(null);
    setIsTaskEditModalOpen(true);
  };

  const openTaskNotes = (task: any) => {
    setSelectedTask(task);
    setTaskDescription(task.description || '');
    // Если описание есть — открываем в режиме просмотра (ссылки кликабельны)
    // Если описания нет — открываем сразу в режиме редактирования
    setIsEditingNotes(!task.description);
    setIsTaskDetailModalOpen(true);
  };

  const formatTaskTime = (deadline?: string) => {
    if (!deadline) return 'Весь день';
    const hasTime = deadline.includes('T') || deadline.includes(' ');
    if (!hasTime) return 'Весь день';
    const date = new Date(deadline);
    if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0) return 'Весь день';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Создание задачи
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !userId) return;
    if (!isNewTaskAllDay && !newTaskTime) return;

    const deadline = isNewTaskAllDay
      ? newTaskDate
      : (() => {
          const local = new Date(`${newTaskDate}T${newTaskTime}:00`);
          return local.toISOString();
        })();
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
        body: JSON.stringify({ title: newTaskTitle, goal_id: selectedGoalId || null, deadline }),
      });
      setNewTaskTitle(''); setSelectedGoalId(''); setNewTaskTime(''); setIsNewTaskAllDay(true); setIsTaskModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Создание цели
  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !userId) return;
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ title: newGoalTitle }),
      });
      const goal = await res.json();
      setCreatedGoalId(goal.id);
      setGoalStep(2);
    } catch (err) { console.error(err); }
  };

  const finishGoalCreation = async () => {
    const filledTasks = goalTaskInputs.filter(t => t.trim());
    if (filledTasks.length > 0 && createdGoalId && userId) {
      await Promise.all(filledTasks.map(title =>
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
          body: JSON.stringify({ title, goal_id: createdGoalId, deadline: new Date().toISOString().split('T')[0] }),
        })
      ));
    }
    setNewGoalTitle('');
    setGoalTaskInputs(['']);
    setGoalStep(1);
    setCreatedGoalId(null);
    setIsGoalModalOpen(false);
    fetchData();
};

  // Создание привычки
  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || !userId) return;

    const schedulePayload =
      newHabitSchedule === 'weekly'
        ? { schedule_type: 'weekly', schedule_config: { weekdays: [new Date().getDay()] } }
        : newHabitSchedule === 'every_other_day'
          ? { schedule_type: 'custom', schedule_config: { interval: 2 } }
          : { schedule_type: 'daily', schedule_config: {} };

    try {
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
        body: JSON.stringify({ name: newHabitName, ...schedulePayload }),
      });
      setNewHabitName(''); setNewHabitSchedule('daily'); setIsHabitModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Удаление задачи
    const updateTaskDescription = async () => {
      if (!selectedTask) return;
      const deadline = taskEditAllDay
        ? taskEditDate
        : (() => {
            const local = new Date(`${taskEditDate}T${taskEditTime}:00`);
            return local.toISOString();
          })();
      try {
        const res = await fetch(`/api/tasks/${selectedTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
          body: JSON.stringify({ description: taskDescription, deadline }),
        });
        if (res.ok) {
          setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, description: taskDescription, deadline } : t));
          setIsTaskDetailModalOpen(false);
        }
      } catch (err) { console.error(err); }
    };

  const deleteTask = async (id: string) => {
    if (!confirm('Удалить эту задачу?') || !userId) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers: { 'x-user-id': userId } });
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Удаление цели
  const deleteGoal = async (id: string) => {
    if (!confirm('Удалить эту цель? Связанные задачи останутся без цели.') || !userId) return;
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE', headers: { 'x-user-id': userId } });
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Переключение статуса задачи
  const toggleTask = async (id: string, currentStatus: string) => {
    if (!userId) return;
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Удаление привычки
  const deleteHabit = async (id: string) => {
    if (!userId) return;
    if (!confirm('Вы уверены, что хотите навсегда удалить эту привычку?')) return;
    try {
      await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  // Отметка привычки
  const checkHabit = async (id: string) => {
    if (!userId) return;
    console.log('Клик по привычке:', id);
    
    // Оптимистичное переключение (toggle)
    setHabits(prev => prev.map(h => 
      h.id === id ? { ...h, is_completed: !h.is_completed } : h
    ));

    try {
      const res = await fetch(`/api/habits/${id}/check`, {
        method: 'POST',
        headers: { 'x-user-id': userId },
      });
      const result = await res.json();
      console.log('Результат отметки:', result);
      
      // Даем базе данных время, прежде чем синхронизироваться
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (err) { 
      console.error('Ошибка при отметке:', err);
      fetchData(); 
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  // Экран входа
  if (!userId) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '4rem' }}>
          <h1 className="serif" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>MeBoard</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>Добро пожаловать в пространство осознанной продуктивности.</p>
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Введите ваш MeBoard ID" 
              value={loginId} 
              onChange={e => setLoginId(e.target.value)} 
              className="elegant-input" 
              style={{ fontSize: '1rem', textAlign: 'center' }}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Войти</button>
          </form>
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Узнать свой ID можно у нашего бота.</p>
        </motion.div>
      </div>
    );
  }

  const stats = [
    { label: 'Завершено задач', value: tasks.filter(t => t.status === 'done').length.toString(), icon: CheckCircle2, color: 'var(--accent-primary)' },
    { label: 'Привычек на сегодня', value: habits.length.toString(), icon: Zap, color: 'var(--accent-gold)' },
    { label: 'Общий прогресс', value: goals.length > 0 ? `${Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)}%` : '0%', icon: Target, color: 'var(--accent-primary)' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => 
    t.deadline?.startsWith(todayStr) || 
    (t.deadline && t.deadline < todayStr && t.status !== 'done')
  );

  return (
    <main className="dashboard-container" onClick={() => setOpenDropdownId(null)}>
      {/* Модальное окно: ЗАДАЧА */}
      {isTaskModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTaskModalOpen(false)}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="serif" style={{ marginBottom: '2rem' }}>Новая задача</h2>
            <form onSubmit={addTask}>
              <input autoFocus type="text" placeholder="Что планируете сделать?" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="elegant-input" />
              <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className="elegant-input compact-input" />
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button type="button" onClick={() => setIsNewTaskAllDay(true)} className={isNewTaskAllDay ? 'btn-primary' : 'btn-secondary'}>Весь день</button>
                <button type="button" onClick={() => setIsNewTaskAllDay(false)} className={!isNewTaskAllDay ? 'btn-primary' : 'btn-secondary'}>По времени</button>
              </div>
              {!isNewTaskAllDay && (
                <input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="elegant-input compact-input" required />
              )}
              <select value={selectedGoalId} onChange={e => setSelectedGoalId(e.target.value)} className="elegant-select">
                <option value="">Без цели</option>
                {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn-secondary">Отмена</button>
                <button type="submit" className="btn-primary">Создать</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Модальное окно: ЦЕЛЬ */}
      {isGoalModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsGoalModalOpen(false); setGoalStep(1); setGoalTaskInputs(['']); }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, scale: 1 }} className="glass-card modal-content" onClick={e => e.stopPropagation()}>
      
            {goalStep === 1 && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Шаг 1 из 2</p>
                <h2 className="serif" style={{ marginBottom: '2rem' }}>Новая цель</h2>
                <form onSubmit={addGoal}>
                  <input autoFocus type="text" placeholder="Ваша глобальная цель?" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} className="elegant-input" />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={() => { setIsGoalModalOpen(false); setGoalStep(1); }} className="btn-secondary">Отмена</button>
                    <button type="submit" className="btn-primary">Далее →</button>
                  </div>
                </form>
              </>
            )}

            {goalStep === 2 && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Шаг 2 из 2</p>
                <h2 className="serif" style={{ marginBottom: '0.5rem' }}>Задачи к цели</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Добавьте первые шаги или пропустите этот шаг.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {goalTaskInputs.map((val, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Задача ${i + 1}`}
                      value={val}
                      onChange={e => {
                        const updated = [...goalTaskInputs];
                        updated[i] = e.target.value;
                        setGoalTaskInputs(updated);
                      }}
                      className="elegant-input"
                      style={{ marginBottom: 0 }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setGoalTaskInputs(prev => [...prev, ''])}
                    style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                  >
                    + Добавить ещё
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={finishGoalCreation} className="btn-secondary">Пропустить</button>
                  <button type="button" onClick={finishGoalCreation} className="btn-primary">Готово</button>
                </div>
              </>
            )}

          </motion.div>
        </div>
      )}

      {/* Модальное окно: ПРИВЫЧКА */}
      {isHabitModalOpen && (
        <div className="modal-overlay" onClick={() => setIsHabitModalOpen(false)}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="serif" style={{ marginBottom: '2rem' }}>Новая привычка</h2>
            <form onSubmit={addHabit}>
              <input autoFocus type="text" placeholder="Название привычки (напр. Чтение)" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} className="elegant-input" />
              <select value={newHabitSchedule} onChange={e => setNewHabitSchedule(e.target.value)} className="elegant-select">
                <option value="daily">Ежедневно</option>
                <option value="every_other_day">Через день</option>
                <option value="weekly">Раз в неделю</option>
              </select>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Частоту можно выбрать при создании привычки.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setIsHabitModalOpen(false)} className="btn-secondary">Отмена</button>
                <button type="submit" className="btn-primary">Добавить</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Навигация */}
      <nav className="nav-menu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6rem' }}>
        <div style={{ display: 'flex', gap: '3rem' }}>
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            Дашборд
          </div>
          <div 
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Календарь
          </div>
          <div 
            className={`nav-item ${activeTab === 'goals_all' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals_all')}
          >
            Цели
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Settings size={20} color="var(--text-secondary)" cursor="pointer" />
          <div 
            onClick={handleLogout}
            title="Выйти"
            style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', cursor: 'pointer' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="white" />
            </div>
          </div>
        </div>
      </nav>

      {/* Рендеринг контента в зависимости от вкладки */}
      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Заголовок */}
          <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '4.5rem', marginBottom: '1rem', fontWeight: 400 }}>
              Искусство <span style={{ fontStyle: 'italic', color: 'var(--accent-gold)' }}>Продуктивности</span>
            </motion.h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 300 }}>
              Добро пожаловать. У вас {tasks.filter(t => t.status !== 'done').length} активных задач.
            </p>
          </header>

          {/* Статистика */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }} className="glass-card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>{stat.label}</p>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 400, marginBottom: '0.5rem' }}>{stat.value}</h3>
                <div style={{ width: '40px', height: '1px', background: 'var(--accent-gold)', margin: '0 auto' }} />
              </motion.div>
            ))}
          </div>

          {/* Основная сетка */}
          <div className="dashboard-grid">
            <div style={{ gridColumn: 'span 7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Планы на день</h2>
                <div 
                  onClick={() => openTaskModal()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Добавить <Plus size={16} />
                </div>
              </div>

              {todayTasks.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>Задач пока нет. Отдохните!</p>
              ) : (
                todayTasks.map((task, i) => (
                  <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 + 0.5 }} className="todo-item">
                    <div 
                      onClick={() => toggleTask(task.id, task.status)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {task.status === 'done' ? <CheckCircle2 color="var(--accent-primary)" /> : <Circle color="var(--text-secondary)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 
                        onClick={() => openTaskNotes(task)}
                        style={{ 
                          fontSize: '1.2rem', fontWeight: 400,
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          color: task.status === 'done' ? 'var(--text-secondary)' : 'var(--text-primary)',
                          cursor: 'pointer'
                        }} 
                        className="serif"
                      >
                        {task.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {formatTaskTime(task.deadline)}
                      </p>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <MoreHorizontal
                        size={18} 
                        color="var(--text-secondary)" 
                        style={{ cursor: 'pointer', opacity: 0.3 }}
                        onClick={e => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === task.id ? null : task.id);
                        }}
                      />
                      {openDropdownId === task.id && (
                        <div
                          style={{
                            position: 'absolute', right: 0, top: '24px', zIndex: 100,
                            background: 'var(--bg-color)', border: '1px solid var(--border-elegant)',
                            borderRadius: '12px', padding: '0.5rem', minWidth: '140px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div
                            onClick={() => openTaskEdit(task)}
                            style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-elegant)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            ✏️ Редактировать
                          </div>
                          <div
                            onClick={() => { setOpenDropdownId(null); deleteTask(task.id); }}
                            style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', color: '#e57373' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-elegant)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            🗑️ Удалить
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div style={{ gridColumn: 'span 5' }}>
              <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Текущие Цели</h3>
                  <Plus size={18} color="var(--accent-gold)" cursor="pointer" onClick={() => setIsGoalModalOpen(true)} />
                </div>
                {goals.map(goal => (
                  <div key={goal.id} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="serif" style={{ fontSize: '1.1rem' }}>{goal.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{goal.progress}%</span>
                        <Trash2 size={14} color="var(--text-secondary)" style={{ cursor: 'pointer', opacity: 0.45 }} onClick={() => deleteGoal(goal.id)} />
                      </div>
                    </div>
                    <div className="progress-bar">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} className="progress-fill" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--bg-color)' }}>Привычки</h3>
                  <Plus size={18} color="var(--bg-color)" cursor="pointer" onClick={() => setIsHabitModalOpen(true)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {habits.map(habit => (
                    <div 
                      key={habit.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div 
                        onClick={() => checkHabit(habit.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, opacity: habit.is_completed ? 0.6 : 1 }}
                      >
                        {habit.is_completed ? <CheckCircle2 size={18} color="var(--bg-color)" /> : <Zap size={16} opacity={0.5} />}
                        <span className="serif" style={{ textDecoration: habit.is_completed ? 'line-through' : 'none', color: 'white' }}>
                          {habit.name}
                        </span>
                      </div>
                      <MoreHorizontal 
                        size={16} 
                        color="var(--bg-color)" 
                        style={{ cursor: 'pointer', opacity: 0.4 }} 
                        onClick={() => deleteHabit(habit.id)} 
                      />
                    </div>
                  ))}
                  {habits.length === 0 && <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Привычки не добавлены</p>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'calendar' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card" style={{ padding: '4rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
              <ArrowRight 
                size={24} 
                color="var(--accent-gold)" 
                style={{ transform: 'rotate(180deg)', cursor: 'pointer', opacity: 0.6 }} 
                onClick={prevMonth}
              />
              <h2 className="serif" style={{ fontSize: '2.5rem', textAlign: 'center', flex: 1 }}>
                {currentDate.toLocaleString('ru', { month: 'long', year: 'numeric' })}
              </h2>
              <ArrowRight 
                size={24} 
                color="var(--accent-gold)" 
                style={{ cursor: 'pointer', opacity: 0.6 }} 
                onClick={nextMonth}
              />
            </div>
            
            <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-elegant)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-elegant)' }}>
              {/* Заголовки дней недели в сетке */}
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                <div key={day} style={{ background: '#fafafa', padding: '1rem', textAlign: 'center', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-elegant)' }}>
                  {day}
                </div>
              ))}
              
              {(() => {
                const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
                const days = [];
                
                for (let i = 0; i < startingDay; i++) days.push(<div key={`empty-${i}`} className="calendar-day" style={{ background: 'rgba(255,255,255,0.2)' }} />);
                
                for (let d = 1; d <= lastDay.getDate(); d++) {
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const dayTasks = Array.isArray(tasks) ? tasks.filter(t => t.deadline?.startsWith(dateStr)) : [];
                  const isSelected = selectedDate === dateStr;
                  const dayLogs = Array.isArray(habitLogs) ? habitLogs.filter(l => l.completed_at?.startsWith(dateStr)) : [];
                  const hasHabits = dayLogs.length > 0;
                  
                  days.push(
                    <div 
                      key={d} 
                      onClick={() => setSelectedDate(dateStr)}
                      className="calendar-day"
                      style={{ 
                        
                        padding: '1rem', 
                        position: 'relative',
                        transition: 'all 0.3s ease', 
                        cursor: 'pointer',
                        background: isSelected ? 'var(--bg-color)' : (hasHabits ? `linear-gradient(135deg, white 0%, rgba(184, 158, 103, ${Math.min(dayLogs.length * 0.15, 0.4)}) 100%)` : 'white'),
                        boxShadow: hasHabits ? '0 4px 15px rgba(184, 158, 103, 0.05)' : 'none',
                        border: isSelected ? '1px solid var(--accent-gold)' : 'none',
                        zIndex: isSelected ? 10 : 1,
                        minHeight: '80px'
                      }} 
                    >
                      <span style={{ 
                        fontSize: '1.2rem', 
                        color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)',
                        fontFamily: 'var(--font-serif)'
                      }}>{d}</span>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {dayTasks.map(t => (
                          <div key={t.id} style={{ width: '4px', height: '4px', borderRadius: '50%', background: t.status === 'done' ? 'var(--accent-primary)' : 'var(--accent-gold)', opacity: 0.7 }} />
                        ))}
                      </div>
                      {hasHabits && (
                        <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
                          <Zap size={10} color="var(--accent-gold)" opacity={0.6} />
                        </div>
                      )}
                    </div>
                  );
                }
                return days;
              })()}
            </div>
          </div>

          {/* Детали дня */}
          {selectedDate && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '3rem' }}>
              <h3 className="serif" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
                Планы на {new Date(selectedDate).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
              </h3>
              <div
                onClick={() => openTaskModal(selectedDate)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '2rem' }}
              >
                Добавить <Plus size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.filter(t => t.deadline?.startsWith(selectedDate)).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>В этот день пока нет назначенных задач.</p>
                ) : (
                  tasks.filter(t => t.deadline?.startsWith(selectedDate)).map(task => (
                    <div key={task.id} className="todo-item" style={{ padding: '1rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {task.status === 'done' ? <CheckCircle2 size={18} color="var(--accent-primary)" /> : <Circle size={18} color="var(--text-secondary)" />}
                        <div style={{ flex: 1 }}>
                          <span 
                            onClick={() => openTaskNotes(task)}
                            style={{ 
                              fontSize: '1.1rem', 
                              textDecoration: task.status === 'done' ? 'line-through' : 'none', 
                              opacity: task.status === 'done' ? 0.5 : 1,
                              cursor: 'pointer'
                            }}
                          >
                            {task.title}
                          </span>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{formatTaskTime(task.deadline)}</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                      <MoreHorizontal
                        size={18} 
                        color="var(--text-secondary)" 
                        style={{ cursor: 'pointer', opacity: 0.3 }}
                        onClick={e => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === task.id ? null : task.id);
                        }}
                      />
                      {openDropdownId === task.id && (
                        <div
                          style={{
                            position: 'absolute', right: 0, top: '24px', zIndex: 100,
                            background: 'var(--bg-color)', border: '1px solid var(--border-elegant)',
                            borderRadius: '12px', padding: '0.5rem', minWidth: '140px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div
                            onClick={() => openTaskEdit(task)}
                            style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-elegant)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            ✏️ Редактировать
                          </div>
                          <div
                            onClick={() => { setOpenDropdownId(null); deleteTask(task.id); }}
                            style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', color: '#e57373' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-elegant)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            🗑️ Удалить
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {activeTab === 'goals_all' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Визуализация Созвездие */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 className="serif" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Ваше созвездие недели</h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Зажигайте звезды, выполняя привычки</p>
            </div>
            <LivingSky stars={skyStars} />
          </div>
          {/* Heatmap привычек */}
          <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem' }}>
            <h3 className="serif" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Трекер привычек (30 дней)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {habits.map(habit => (
                <div key={habit.id}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>{habit.name}</p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {[...Array(30)].map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (29 - i));
                      const dateStr = d.toISOString().split('T')[0];
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      const isDone = isToday 
                        ? habit.is_completed 
                        : habitLogs.some(l => l.habit_id === habit.id && l.date === dateStr && l.completed);
                      const toggleHabitLog = async (habitId: string, dateStr: string, currentDone: boolean) => {
                        if (!userId) return;
                        const newCompleted = !currentDone;

                        // Оптимистичное обновление локального стейта
                        setHabitLogs(prev => {
                          const exists = prev.some(l => l.habit_id === habitId && l.date === dateStr);
                          if (exists) {
                            return prev.map(l =>
                              l.habit_id === habitId && l.date === dateStr ? { ...l, completed: newCompleted } : l
                            );
                          }
                          return [...prev, { habit_id: habitId, date: dateStr, completed: newCompleted }];
                        });

                        await fetch('/api/habit-logs', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                          body: JSON.stringify({ habit_id: habitId, date: dateStr, completed: newCompleted }),
                        });
                      };
                      return (
                        <div 
                          key={i} 
                          title={dateStr}
                          onClick={() => { 
                            const isFuture = dateStr > new Date().toISOString().split('T')[0]; 
                            if (!isFuture) toggleHabitLog(habit.id, dateStr, isDone);
                          }}
                          style={{ 
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            background: isDone ? 'var(--accent-primary)' : 'var(--border-elegant)',
                            opacity: isDone ? 1 : 0.3,
                            cursor: dateStr > new Date().toISOString().split('T')[0] ? 'default' : 'pointer',
                          }} 
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              {habits.length === 0 && <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Добавьте привычки, чтобы увидеть прогресс</p>}
            </div>
          </div>
          {/* График активности */}
          <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem' }}>
            <h3 className="serif" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Ритм вашей продуктивности</h3>
            <div style={{ height: '150px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              {(() => {
                const last7Days = [...Array(7)].map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  const dateStr = d.toISOString().split('T')[0];
                  const taskCount = tasks.filter(t => t.status === 'done' && t.updated_at?.startsWith(dateStr)).length;
                  const habitCount = habitLogs.filter(l => l.completed && l.date === dateStr).length;
                  return { day: d.toLocaleDateString('ru', { weekday: 'short' }), count: taskCount + habitCount };
                });
                const maxCount = Math.max(...last7Days.map(d => d.count), 1);
                
                return last7Days.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${(d.count / maxCount) * 100}px` }} 
                      style={{ width: '100%', maxWidth: '40px', background: 'var(--accent-gold)', borderRadius: '4px 4px 0 0', opacity: 0.3 + (d.count / maxCount) * 0.7 }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{d.day}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="dashboard-grid" style={{ gap: '2rem' }}>
            {goals.map(goal => (
              <div key={goal.id} className="glass-card" style={{ padding: '3rem', gridColumn: 'span 6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                  <div>
                    <h3 className="serif" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{goal.title}</h3>
                    <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Архитектура достижений</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--accent-gold)', opacity: 0.5 }}>{goal.progress}%</span>
                    <Trash2 size={18} color="var(--text-secondary)" style={{ cursor: 'pointer', opacity: 0.45 }} onClick={() => deleteGoal(goal.id)} />
                  </div>
                </div>

                <div className="progress-bar" style={{ height: '6px', marginBottom: '3rem' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} className="progress-fill" />
                </div>

                <div style={{ borderTop: '1px solid var(--border-elegant)', paddingTop: '2rem' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.6 }}>Связанные задачи</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tasks.filter(t => t.goal_id === goal.id).length === 0 ? (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Задач пока не назначено</p>
                    ) : (
                      tasks.filter(t => t.goal_id === goal.id).map(t => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.status === 'done' ? 'var(--accent-primary)' : 'var(--border-elegant)' }} />
                          <span style={{ opacity: t.status === 'done' ? 0.4 : 1, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Модальное окно заметок задачи */}
      {isTaskDetailModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTaskDetailModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{selectedTask?.title}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Заметки к задаче</p>
            {isEditingNotes ? (
              <textarea
                autoFocus
                className="elegant-input"
                style={{ fontSize: '1rem', minHeight: '150px', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-elegant)', width: '100%', resize: 'none' }}
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                placeholder="Добавьте детали или подзадачи..."
              />
            ) : (
              <div 
                onClick={() => setIsEditingNotes(true)}
                className="elegant-input"
                style={{ 
                  fontSize: '1rem', 
                  minHeight: '150px', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  border: '1px solid var(--border-elegant)', 
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  cursor: 'text',
                  overflowY: 'auto'
                }}
              >
                {taskDescription ? linkify(taskDescription) : <span style={{ opacity: 0.5 }}>Добавьте детали или подзадачи...</span>}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" onClick={updateTaskDescription}>Сохранить</button>
              <button className="btn-primary" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-elegant)' }} onClick={() => setIsTaskDetailModalOpen(false)}>Закрыть</button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Модальное окно редактирования задачи */}
      {isTaskEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTaskEditModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="serif" style={{ marginBottom: '1.5rem' }}>Редактировать задачу</h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Дата</p>
            <input type="date" value={taskEditDate} onChange={e => setTaskEditDate(e.target.value)} className="elegant-input compact-input" />

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button type="button" onClick={() => setTaskEditAllDay(true)} className={taskEditAllDay ? 'btn-primary' : 'btn-secondary'}>Весь день</button>
              <button type="button" onClick={() => setTaskEditAllDay(false)} className={!taskEditAllDay ? 'btn-primary' : 'btn-secondary'}>По времени</button>
            </div>

            {!taskEditAllDay && (
              <input type="time" value={taskEditTime} onChange={e => setTaskEditTime(e.target.value)} className="elegant-input compact-input" />
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" onClick={async () => {
                const deadline = taskEditAllDay
                  ? taskEditDate
                  : new Date(`${taskEditDate}T${taskEditTime}:00`).toISOString();
                await fetch(`/api/tasks/${selectedTask.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
                  body: JSON.stringify({ deadline }),
                });
                setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, deadline } : t));
                setIsTaskEditModalOpen(false);
              }}>Сохранить</button>
              <button className="btn-primary" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-elegant)' }} onClick={() => setIsTaskEditModalOpen(false)}>Закрыть</button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

