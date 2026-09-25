const { Resend } = require('resend');

// Sends straight to the business inbox — override via the BOOKING_TO_EMAIL
// env var without touching code. The "from" address uses Resend's shared
// sandbox domain, which can send to this address with no domain setup.
const TO_EMAIL = process.env.BOOKING_TO_EMAIL || 'pratt2093@gmail.com';
const FROM_EMAIL = 'Blackline Detailing <onboarding@resend.dev>';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    res.status(500).json({ error: 'Booking requests are not configured on this deployment yet.' });
    return;
  }

  const { name, email, phone, vehicle, address, services, notes } = req.body || {};

  if (!name || !phone || !vehicle || !address) {
    res.status(400).json({ error: 'Please fill in your name, phone, vehicle, and address.' });
    return;
  }

  const serviceItems = Array.isArray(services) && services.length
    ? services.map((s) => `<li>${escapeHtml(s)}</li>`).join('')
    : '<li>None selected</li>';

  const html = `
    <h2>New Booking Request &mdash; Blackline Detailing</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Email:</strong> ${email ? escapeHtml(email) : 'Not provided'}</p>
    <p><strong>Vehicle:</strong> ${escapeHtml(vehicle)}</p>
    <p><strong>Service Address:</strong> ${escapeHtml(address)}</p>
    <p><strong>Services requested:</strong></p>
    <ul>${serviceItems}</ul>
    <p><strong>Notes:</strong> ${notes ? escapeHtml(notes) : 'None'}</p>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email || undefined,
      subject: `New Booking Request from ${name}`,
      html,
    });

    if (error) {
      throw error;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend send failed:', err);
    res.status(500).json({ error: 'Unable to send your request right now. Please call or email us directly.' });
  }
};
