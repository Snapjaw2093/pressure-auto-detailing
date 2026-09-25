// Powers the "Test Telegram Connection" button in the site footer — lets
// you verify TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID are set up correctly
// without submitting a fake booking. Returns the real error message (rather
// than a generic one) since this is a setup tool for the site owner, not a
// customer-facing form.
const { sendTelegramMessage } = require('./_telegram');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const text = [
    'Test message — Blackline Detailing website',
    '',
    "If you're reading this, your Telegram notifications are set up correctly.",
    'Booking requests will arrive the same way.',
  ].join('\n');

  try {
    await sendTelegramMessage(text);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram test message failed:', err);
    res.status(500).json({ error: err.message || 'Unable to send test message.' });
  }
};
