import { bot } from '@/lib/bot';
import { checkAndSendReflectionPings } from '@/lib/reflection-bot';

export async function GET(request: Request) {
  // Защитный токен (опциональный, если настроен CRON_SECRET)
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const secret = process.env.CRON_SECRET;

  if (secret && token !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await checkAndSendReflectionPings(bot);
    return new Response('Cron executed successfully', { status: 200 });
  } catch (error) {
    console.error('Reflection cron error:', error);
    return new Response('Error executing cron', { status: 500 });
  }
}
