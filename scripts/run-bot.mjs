import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

console.log('Starting Telegram Bot in polling mode...');

// Регистрация / Поиск пользователя
async function getOrCreateUser(ctx) {
  const { id: telegram_id, username, first_name } = ctx.from;
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegram_id)
    .single();

  if (user) return user;

  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([{ telegram_id, username: username || first_name }])
    .select()
    .single();

  return newUser;
}

bot.start(async (ctx) => {
  const user = await getOrCreateUser(ctx);
  ctx.reply(`Привет, ${user.username}! Добро пожаловать в MeBoard. \n\nОтправьте мне любую задачу, и я добавлю её в ваш список.`);
});

bot.command('id', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  ctx.reply(`Ваш MeBoard ID:\n\n\`${user.id}\``, { parse_mode: 'MarkdownV2' });
});

bot.command('today', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'todo');

  if (!tasks?.length) {
    return ctx.reply('На сегодня задач нет! Отдыхайте.');
  }

  const list = tasks.map(t => `• ${t.title}`).join('\n');
  ctx.reply(`Ваши задачи на сегодня:\n\n${list}`);
});

// --- Функции уведомлений ---
const getMorningMessage = async (user) => {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'todo');

  return tasks?.length 
    ? `Доброе утро, ${user.username}! ✨\nВаши планы на сегодня:\n\n${tasks.map(t => `• ${t.title}`).join('\n')}`
    : `Доброе утро! Планов на сегодня пока нет. Время для вдохновения? ☕`;
};

const getEveningMessage = async (user) => {
  const { data: habits } = await supabase.from('habits').select('*').eq('user_id', user.id);
  // Здесь можно добавить детальную логику привычек
  return `Вечерний MeBoard. 🏛️\nНе забудьте отметить выполненные привычки на сайте и подвести итоги дня.`;
};

// --- Команды ---
bot.command('goals', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  const { data: goals } = await supabase.from('goals').select('*').eq('user_id', user.id);
  
  if (!goals?.length) return ctx.reply('Целей пока нет. Время помечтать? 🎯');
  
  const list = goals.map(g => `• *${g.title}* — ${g.progress}%`).join('\n');
  ctx.reply(`Ваши цели:\n\n${list}`, { parse_mode: 'Markdown' });
});

bot.command('habits', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  const { data: habits } = await supabase.from('habits').select('*').eq('user_id', user.id);
  
  if (!habits?.length) return ctx.reply('Привычек пока нет. Самое время завести полезную традицию! 💎');
  
  const list = habits.map(h => `• ${h.name}`).join('\n');
  ctx.reply(`Ваши привычки:\n\n${list}`);
});

bot.command('stat', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: doneTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .gte('updated_at', sevenDaysAgo.toISOString());

  ctx.reply(`Статистика за 7 дней 📈\n\n✅ Выполнено задач: ${doneTasks?.length || 0}\n🏛️ Вы на верном пути к своим целям!`);
});

bot.command('help', async (ctx) => {
  const helpText = `
📜 *Команды MeBoard:*

/today — Планы на сегодня
/goals — Ваши цели и прогресс
/habits — Список привычек
/stat — Успехи за неделю
/id — Ваш секретный MeBoard ID
/morning — Утренний дайджест
/evening — Вечерний отчет

💡 *Умные функции:*
Просто напишите: "удали [текст]", чтобы стереть задачу.
Любое другое сообщение добавит новую задачу в список.
  `;
  ctx.reply(helpText, { parse_mode: 'Markdown' });
});

bot.command('morning', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  ctx.reply(await getMorningMessage(user));
});

bot.command('evening', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  ctx.reply(await getEveningMessage(user));
});

bot.on('text', async (ctx) => {
  const user = await getOrCreateUser(ctx);
  const text = ctx.message.text.toLowerCase().trim();

  if (text.startsWith('удали') || text.startsWith('delete')) {
    const query = text.replace(/удали|удалить|delete/g, '').trim();
    if (!query) return ctx.reply('Что именно нужно удалить?');

    const { data: foundTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .ilike('title', `%${query}%`)
      .limit(1);

    if (!foundTasks?.length) return ctx.reply(`Не нашел задачу "${query}".`);
    await supabase.from('tasks').delete().eq('id', foundTasks[0].id);
    return ctx.reply(`🗑️ Удалено: "${foundTasks[0].title}"`);
  }

  if (text === 'список' || text === 'планы' || text === 'list') {
    ctx.reply(await getMorningMessage(user));
    return;
  }

  const { error } = await supabase
    .from('tasks')
    .insert([{ title: ctx.message.text, user_id: user.id, status: 'todo' }]);

  if (error) return ctx.reply('Ошибка сохранения.');
  ctx.reply(`✅ Добавлено: "${ctx.message.text}"`);
});

// --- Планировщик ---
cron.schedule('0 9 * * *', async () => {
  const { data: users } = await supabase.from('users').select('*');
  for (const user of users) {
    if (user.telegram_id) bot.telegram.sendMessage(user.telegram_id, await getMorningMessage(user));
  }
});

cron.schedule('0 21 * * *', async () => {
  const { data: users } = await supabase.from('users').select('*');
  for (const user of users) {
    if (user.telegram_id) bot.telegram.sendMessage(user.telegram_id, await getEveningMessage(user));
  }
});

bot.launch().then(() => console.log('Bot is running!'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
