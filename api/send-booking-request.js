// Sends booking requests as a Telegram DM from your own bot.
// Setup: message @BotFather to create a bot and get TELEGRAM_BOT_TOKEN, then
// message your new bot once and use TELEGRAM_CHAT_ID from getUpdates to find
// your chat id. See README for the full walkthrough.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    res.status(500).json({ error: 'Booking requests are not configured on this deployment yet.' });
    return;
  }

  const { name, email, phone, vehicle, address, services, notes } = req.body || {};

  if (!name || !phone || !vehicle || !address) {
    res.status(400).json({ error: 'Please fill in your name, phone, vehicle, and address.' });
    return;
  }

  const serviceList = Array.isArray(services) && services.length ? services.join(', ') : 'None selected';

  // Plain text (no parse_mode) so nothing in a customer's input can be
  // misread as Telegram markdown formatting.
  const text = [
    'New Booking Request — Blackline Detailing',
    '',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || 'Not provided'}`,
    `Vehicle: ${vehicle}`,
    `Address: ${address}`,
    `Services: ${serviceList}`,
    `Notes: ${notes || 'None'}`,
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });
    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Telegram API error');
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram send failed:', err);
    res.status(500).json({ error: 'Unable to send your request right now. Please call us instead.' });
  }
};
