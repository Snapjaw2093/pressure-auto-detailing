// Shared helper for sending Telegram Bot API messages.
// Files prefixed with "_" are not treated as routes by Vercel, so this
// isn't itself exposed as an endpoint.
async function sendTelegramMessage(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    const err = new Error('Telegram is not configured yet — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel, then redeploy.');
    err.notConfigured = true;
    throw err;
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || 'Telegram API error');
  }
}

module.exports = { sendTelegramMessage };
