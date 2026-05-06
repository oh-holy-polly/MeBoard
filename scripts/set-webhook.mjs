const token = process.env.TELEGRAM_BOT_TOKEN;
const url = process.argv[2];

if (!token || !url) {
  console.log('Usage: node set-webhook.mjs <your-public-url>');
  process.exit(1);
}

const webhookUrl = `${url}/api/telegram/webhook`;

fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`)
  .then(res => res.json())
  .then(data => {
    console.log('Telegram response:', data);
  })
  .catch(err => {
    console.error('Error setting webhook:', err);
  });
