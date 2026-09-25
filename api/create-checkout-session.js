const Stripe = require('stripe');

// Server-defined catalog: the client only ever sends a key, never an amount,
// so prices can't be tampered with from the browser.
const SERVICES = {
  stage1: 'Stage 1 Paint Correction',
  stage2: 'Stage 2 Paint Correction',
  ceramic: 'Ceramic Coating',
  fullDetail: 'Full Detail (Interior & Exterior)',
  exterior: 'Exterior Detail',
  interior: 'Interior Detail',
  maintenance: 'Maintenance Detail',
  claybar: 'Clay Bar Treatment',
};

const DEPOSIT_AMOUNT_CENTS = 5000; // flat $50 booking deposit, applied to any service

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({ error: 'Payments are not configured on this deployment yet.' });
    return;
  }

  const service = req.body && req.body.service;
  const serviceLabel = SERVICES[service];
  if (!serviceLabel) {
    res.status(400).json({ error: 'Please select a valid service.' });
    return;
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: DEPOSIT_AMOUNT_CENTS,
            product_data: {
              name: `Booking Deposit — ${serviceLabel}`,
              description: 'Reserves your Blackline Detailing appointment. Applied toward your total service cost; balance due on-site.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: { service: serviceLabel },
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation failed:', err);
    res.status(500).json({ error: 'Unable to start checkout. Please try again or contact us directly.' });
  }
};
