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

// --- Функции рефлексии (день наблюдения) ---

function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function callOpenAI(apiKey, responsesText) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты профессиональный коуч по личной эффективности и психолог. Твоя задача — проанализировать день наблюдения (рефлексии) пользователя и составить глубокий, поддерживающий анализ.'
          },
          {
            role: 'user',
            content: `Вот логи наблюдения за день:\n\n${responsesText}\n\nПожалуйста, проанализируй эти данные и составь отчет. Отчет должен включать:\n1. Анализ эмоционального состояния и мыслей в течение дня.\n2. Динамику энергии и выявление реального "окна продуктивности" (когда энергия была на высоте и чем занимался пользователь).\n3. Замеченные паттерны или несоответствия (например, высокая энергия тратилась на рутину, или сильная усталость к определенному часу).\n4. Коучинговые рекомендации: как эффективнее распределять задачи на основе этих данных.\n\nПиши в уважительном, поддерживающем и лаконичном стиле на русском языке. Используй эмодзи для наглядности.`
          }
        ],
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    throw new Error(JSON.stringify(data));
  } catch (err) {
    console.error('Error calling OpenAI API:', err);
    return 'Не удалось сгенерировать ИИ-анализ из-за технической ошибки. Вот ваши ответы за день:\n\n' + responsesText;
  }
}

async function callGemini(apiKey, responsesText) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Ты профессиональный коуч по личной эффективности и психолог. Твоя задача — проанализировать день наблюдения (рефлексии) пользователя и составить глубокий, поддерживающий анализ.\n\nВот логи наблюдения за день:\n\n${responsesText}\n\nПожалуйста, проанализируй эти данные и составь отчет. Отчет должен включать:\n1. Анализ эмоционального состояния и мыслей в течение дня.\n2. Динамику энергии и выявление реального "окна продуктивности" (когда энергия была на высоте и чем занимался пользователь).\n3. Замеченные паттерны или несоответствия (например, высокая энергия тратилась на рутину, или сильная усталость к определенному часу).\n4. Коучинговые рекомендации: как эффективнее распределять задачи на основе этих данных.\n\nПиши в уважительном, поддерживающем и лаконичном стиле на русском языке. Используй эмодзи для наглядности.`
          }]
        }]
      })
    });
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error(JSON.stringify(data));
  } catch (err) {
    console.error('Error calling Gemini API:', err);
    return 'Не удалось сгенерировать ИИ-анализ из-за технической ошибки. Вот ваши ответы за день:\n\n' + responsesText;
  }
}

async function callGroq(apiKey, responsesText) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'Ты профессиональный коуч по личной эффективности и психолог. Твоя задача — проанализировать день наблюдения (рефлексии) пользователя и составить глубокий, поддерживающий анализ.'
          },
          {
            role: 'user',
            content: `Вот логи наблюдения за день:\n\n${responsesText}\n\nПожалуйста, проанализируй эти данные и составь отчет. Отчет должен включать:\n1. Анализ эмоционального состояния и мыслей в течение дня.\n2. Динамику энергии и выявление реального "окна продуктивности" (когда энергия была на высоте и чем занимался пользователь).\n3. Замеченные паттерны или несоответствия (например, высокая энергия тратилась на рутину, или сильная усталость к определенному часу).\n4. Коучинговые рекомендации: как эффективнее распределять задачи на основе этих данных.\n\nПиши в уважительном, поддерживающем и лаконичном стиле на русском языке. Используй эмодзи для наглядности.`
          }
        ],
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    throw new Error(JSON.stringify(data));
  } catch (err) {
    console.error('Error calling Groq API:', err);
    return 'Не удалось сгенерировать ИИ-анализ из-за технической ошибки. Вот ваши ответы за день:\n\n' + responsesText;
  }
}

async function generateAIAnalysis(responsesText) {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return callGroq(groqKey, responsesText);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      return callGemini(geminiKey, responsesText);
    }
    return '⚠️ Настройки AI не заданы (отсутствует GROQ_API_KEY, OPENAI_API_KEY или GEMINI_API_KEY). Вот ваши ответы за день:\n\n' + responsesText;
  }
  return callOpenAI(apiKey, responsesText);
}

function chunkString(str, length) {
  const size = Math.ceil(str.length / length);
  const r = new Array(size);
  let offset = 0;
  for (let i = 0; i < size; i++) {
    r[i] = str.substring(offset, offset + length);
    offset += length;
  }
  return r;
}

async function runAIAnalysisAndSend(ctx, reflectionId, username) {
  try {
    const { data: responses, error } = await supabase
      .from('reflection_responses')
      .select('*')
      .eq('reflection_id', reflectionId)
      .order('hour', { ascending: true });

    if (error || !responses || responses.length === 0) {
      await ctx.reply('Не удалось найти ваши ответы за день для проведения анализа.');
      return;
    }

    let responsesText = '';
    for (const resp of responses) {
      responsesText += `⏰ Время: ${resp.hour}:00\n`;
      responsesText += `💭 Мысли: ${resp.thinking || 'нет ответа'}\n`;
      responsesText += `🎭 Чувства: ${resp.feeling || 'нет ответа'}\n`;
      responsesText += `⚡ Энергия: ${resp.energy || 'нет ответа'}\n`;
      responsesText += `💼 Занятие: ${resp.doing || 'нет ответа'}\n`;
      responsesText += `🎯 Желание: ${resp.wanting || 'нет ответа'}\n\n`;
    }

    const analysis = await generateAIAnalysis(responsesText);
    
    if (analysis.length > 4000) {
      const parts = chunkString(analysis, 4000);
      for (const part of parts) {
        await ctx.reply(part);
      }
    } else {
      await ctx.reply(analysis);
    }

    await supabase
      .from('reflections')
      .update({ ai_analysis: analysis })
      .eq('id', reflectionId);

  } catch (err) {
    console.error('Error during AI analysis generation:', err);
    await ctx.reply('Произошла ошибка при анализе дня ИИ. Попробуйте запросить его позже.');
  }
}

async function handleBotState(ctx, user, text) {
  const botState = user.settings?.bot_state;
  if (!botState || !botState.type) return false;

  const rawText = ctx.message.text.trim();

  if (text === 'отмена' || text === '/cancel') {
    const updatedSettings = { ...(user.settings || {}) };
    delete updatedSettings.bot_state;
    await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);
    await ctx.reply('Действие отменено.', { reply_markup: { remove_keyboard: true } });
    return true;
  }

  switch (botState.type) {
    case 'setup_reflection_start': {
      const hour = parseInt(rawText, 10);
      if (isNaN(hour) || hour < 0 || hour > 23) {
        await ctx.reply('Пожалуйста, введи только число от 0 до 23 (например: 9).');
        return true;
      }
      
      const updatedSettings = {
        ...(user.settings || {}),
        bot_state: {
          type: 'setup_reflection_end',
          start_hour: hour
        }
      };
      await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);
      await ctx.reply('Отлично. А во сколько ты планируешь лечь спать? (Введи час от 0 до 23, например: 23)');
      return true;
    }

    case 'setup_reflection_end': {
      const hour = parseInt(rawText, 10);
      if (isNaN(hour) || hour < 0 || hour > 23) {
        await ctx.reply('Пожалуйста, введи только число от 0 до 23 (например: 23).');
        return true;
      }

      const startHour = botState.start_hour;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = getLocalDateStr(tomorrow);

      const { error } = await supabase
        .from('reflections')
        .upsert(
          { user_id: user.id, date: dateStr, start_hour: startHour, end_hour: hour, is_completed: false },
          { onConflict: 'user_id,date' }
        );

      if (error) {
        console.error('Error upserting reflection:', error);
        await ctx.reply('Произошла ошибка при сохранении настроек рефлексии.');
        return true;
      }

      const updatedSettings = { ...(user.settings || {}) };
      delete updatedSettings.bot_state;
      await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);

      await ctx.reply(`Записал! Завтра с ${startHour}:00 до ${hour}:00 каждый час буду присылать тебе вопросы для рефлексии. Хорошего вечера! 🌙`);
      return true;
    }

    case 'reflection_q1': {
      const { error } = await supabase
        .from('reflection_responses')
        .update({ thinking: rawText })
        .eq('reflection_id', botState.reflection_id)
        .eq('hour', botState.hour);

      if (error) {
        console.error('Error saving Q1:', error);
        await ctx.reply('Ошибка сохранения. Попробуйте еще раз.');
        return true;
      }

      const updatedSettings = {
        ...(user.settings || {}),
        bot_state: {
          ...botState,
          type: 'reflection_q2'
        }
      };
      await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);
      await ctx.reply('Понятно.\nЧто сейчас чувствуешь — эмоционально?');
      return true;
    }

    case 'reflection_q2': {
      const { error } = await supabase
        .from('reflection_responses')
        .update({ feeling: rawText })
        .eq('reflection_id', botState.reflection_id)
        .eq('hour', botState.hour);

      if (error) {
        console.error('Error saving Q2:', error);
        await ctx.reply('Ошибка сохранения. Попробуйте еще раз.');
        return true;
      }

      const updatedSettings = {
        ...(user.settings || {}),
        bot_state: {
          ...botState,
          type: 'reflection_q3'
        }
      };
      await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);
      
      const keyboard = [
        ['🔋 Очень низкий', '🔋🔋 Низкий'],
        ['🔋🔋🔋 Средний'],
        ['🔋🔋🔋🔋 Высокий', '🔋🔋🔋🔋🔋 Очень высокий']
      ];
      await ctx.reply('Какой уровень энергии прямо сейчас?', {
        reply_markup: {
          keyboard: keyboard,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
      return true;
    }

    case 'reflection_q3': {
      const { error } = await supabase
        .from('reflection_responses')
        .update({ energy: rawText })
        .eq('reflection_id', botState.reflection_id)
        .eq('hour', botState.hour);

      if (error) {
        console.error('Error saving Q3:', error);
        await ctx.reply('Ошибка сохранения. Попробуйте еще раз.');
        return true;
      }

      const updatedSettings = {
        ...(user.settings || {}),
        bot_state: {
          ...botState,
          type: 'reflection_q4'
        }
      };
      await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);
      await ctx.reply('Что ты сейчас делаешь или чем занимаешься?', {
        reply_markup: { remove_keyboard: true }
      });
      return true;
    }

    case 'reflection_q4': {
      const { error } = await supabase
        .from('reflection_responses')
        .update({ doing: rawText })
        .eq('reflection_id', botState.reflection_id)
        .eq('hour', botState.hour);

      if (error) {
        console.error('Error saving Q4:', error);
        await ctx.reply('Ошибка сохранения. Попробуйте еще раз.');
        return true;
      }

      const updatedSettings = {
        ...(user.settings || {}),
        bot_state: {
          ...botState,
          type: 'reflection_q5'
        }
      };
      await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);
      await ctx.reply('И последнее на этот час — чего ты сейчас хочешь? Конкретно в моменте, не глобально.');
      return true;
    }

    case 'reflection_q5': {
      const { error } = await supabase
        .from('reflection_responses')
        .update({ wanting: rawText })
        .eq('reflection_id', botState.reflection_id)
        .eq('hour', botState.hour);

      if (error) {
        console.error('Error saving Q5:', error);
        await ctx.reply('Ошибка сохранения. Попробуйте еще раз.');
        return true;
      }

      const { data: ref } = await supabase
        .from('reflections')
        .select('*')
        .eq('id', botState.reflection_id)
        .single();

      const updatedSettings = { ...(user.settings || {}) };
      delete updatedSettings.bot_state;
      await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);

      if (ref && botState.hour >= ref.end_hour) {
        await supabase
          .from('reflections')
          .update({ is_completed: true })
          .eq('id', ref.id);

        await ctx.reply('Зафиксировали 🙂 День наблюдения закончен. Сейчас я подготовлю для тебя аналитику на основе твоих ответов за день...');
        
        runAIAnalysisAndSend(ctx, ref.id, user.username);
      } else {
        const nextHour = botState.hour + 1;
        await ctx.reply(`Зафиксировали 🙂 Напишу в ${nextHour}:00.`);
      }
      return true;
    }

    default:
      return false;
  }
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
/reflection — Начать день рефлексии (наблюдения)
/cancel — Отменить настройку/ответ рефлексии

💡 *Умные функции:*
Просто напишите: "удали [текст]", чтобы стереть задачу.
Любое другое сообщение добавит новую задачу в список.
  `;
  ctx.reply(helpText, { parse_mode: 'Markdown' });
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

  // Сначала проверяем состояние бота (активная рефлексия)
  const stateHandled = await handleBotState(ctx, user, text);
  if (stateHandled) return;

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

async function checkAndSendReflectionPings() {
  try {
    const todayStr = getLocalDateStr();
    const currentHour = new Date().getHours();

    const { data: reflections, error } = await supabase
      .from('reflections')
      .select('*, users(*)')
      .eq('date', todayStr)
      .eq('is_completed', false);

    if (error) {
      console.error('Error fetching reflections in cron:', error);
      return;
    }

    for (const ref of reflections) {
      const user = ref.users;
      if (!user || !user.telegram_id) continue;

      if (currentHour >= ref.start_hour && currentHour <= ref.end_hour) {
        const { data: existingResponse } = await supabase
          .from('reflection_responses')
          .select('*')
          .eq('reflection_id', ref.id)
          .eq('hour', currentHour)
          .maybeSingle();

        if (!existingResponse) {
          const { error: insertError } = await supabase
            .from('reflection_responses')
            .insert([{ reflection_id: ref.id, hour: currentHour }]);

          if (insertError) {
            console.error('Error inserting response:', insertError);
            continue;
          }

          const updatedSettings = {
            ...(user.settings || {}),
            bot_state: {
              type: 'reflection_q1',
              reflection_id: ref.id,
              hour: currentHour
            }
          };
          await supabase.from('users').update({ settings: updatedSettings }).eq('id', user.id);

          let greeting = `О чём ты сейчас думаешь?`;
          if (currentHour === ref.start_hour) {
            greeting = `Доброе утро, ${user.username || 'друг'} 🙂\nНачинаем день наблюдения. Отвечай честно — первое что приходит, без обдумывания.\n\nО чём ты сейчас думаешь?`;
          }
          await bot.telegram.sendMessage(user.telegram_id, greeting);
        }
      }
    }
  } catch (err) {
    console.error('Error in checkAndSendReflectionPings:', err);
  }
}

cron.schedule('* * * * *', checkAndSendReflectionPings);

bot.launch().then(() => console.log('Bot is running!'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
