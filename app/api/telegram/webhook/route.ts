import { bot } from '@/lib/bot';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
}

// Telegram требует, чтобы мы также отвечали на GET-запросы (хотя бы пустым ответом)
export async function GET() {
  return new Response('Telegram Bot Webhook is running!');
}
