import { Telegraf, Context } from 'telegraf';
import { supabase } from './supabase';
import { getTodayTasks, getTodayHabitsWithStatus } from './productivity-logic';
import { handleBotState } from './reflection-bot';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not defined');

export const bot = new Telegraf(token);

// Хелпер для поиска или регистрации пользователя
async function getOrCreateUser(ctx: Context) {
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username || ctx.from?.first_name;

  if (!telegramId) return null;

  // Пытаемся найти существующего пользователя
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (existingUser) return existingUser;

  // Если не нашли, создаем нового
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([{ telegram_id: telegramId, username }])
    .select()
    .single();

  if (createError) {
    console.error('User registration error:', createError);
    return null;
  }
  return newUser;
}


// Команда /start
bot.start(async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return ctx.reply('Ошибка регистрации. Попробуйте позже.');

  await ctx.reply(`Привет, ${user.username}! Я твой личный помощник по продуктивности MeBoard.\n\n` +
    `Доступные команды:\n` +
    `/today - задачи и привычки на сегодня\n` +
    `/add - добавить задачу\n` +
    `/reflection - начать день рефлексии (наблюдения)\n` +
    `/cancel - отменить настройку/ответ рефлексии\n\n` +
    `Просто напиши мне текст, и я создам из него задачу!`);
});

bot.command('reflection', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return ctx.reply('Пользователь не найден.');

  const updatedSettings = {
    ...(user.settings || {}),
    bot_state: {
      type: 'setup_reflection_start'
    }
  };
  await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);

  await ctx.reply(
    'Завтра будет день наблюдения (рефлексии). Я буду присылать тебе вопросы каждый час.\n\n' +
    'Во сколько ты завтра просыпаешься? (Введи час начала от 0 до 23, например: 9)\n\n' +
    'Для отмены введи /cancel в любой момент.'
  );
});

bot.command('cancel', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return;
  const updatedSettings = { ...(user.settings || {}) };
  delete updatedSettings.bot_state;
  await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);
  await ctx.reply('Действие отменено.', { reply_markup: { remove_keyboard: true } });
});

// Команда /today
bot.command('today', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return ctx.reply('Пользователь не найден.');

  try {
    const tasks = await getTodayTasks(user.id);
    const habits = await getTodayHabitsWithStatus(user.id);

    let message = `📅 *Планы на сегодня:*\n\n`;

    message += `✅ *Задачи:*\n`;
    if (tasks.length === 0) message += `_Задач нет_\n`;
    else tasks.forEach(t => message += `${t.status === 'done' ? '🟢' : '⚪️'} ${t.title}\n`);

    message += `\n✨ *Привычки:*\n`;
    if (habits.length === 0) message += `_Привычек нет_\n`;
    else habits.forEach(h => message += `${h.completed_today ? '🔥' : '⭕️'} ${h.name}\n`);

    await ctx.replyWithMarkdown(message);
  } catch (err) {
    console.error(err);
    await ctx.reply('Ошибка при получении данных.');
  }
});

// Обработка любого текстового сообщения (быстрое добавление задачи)
bot.on('text', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  if (!user) return ctx.reply('Пользователь не найден.');

  const text = ctx.message.text;
  if (text.startsWith('/')) return; // Игнорируем другие команды

  // Сначала проверяем состояние бота (активная рефлексия)
  const stateHandled = await handleBotState(ctx, user, text.toLowerCase().trim());
  if (stateHandled) return;

  try {
    const { error } = await supabase
      .from('tasks')
      .insert([{ 
        title: text, 
        user_id: user.id,
        priority: 'medium',
        status: 'todo'
      }]);

    if (error) throw error;
    await ctx.reply(`✅ Задача добавлена: "${text}"`);
  } catch (err) {
    console.error(err);
    await ctx.reply('Не удалось добавить задачу.');
  }
});
