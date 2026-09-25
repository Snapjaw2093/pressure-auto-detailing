# Blackline Detailing

Mobile auto detailing website for Blackline Detailing (Venice, FL), focused on paint correction: correction stages, before/after comparison, process, additional services, and booking (with an optional online deposit via Stripe).

Static site (Tailwind via CDN) plus one small Vercel serverless function for Stripe checkout — no other build step.

## Local preview

Open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

The "Reserve Your Spot Online" deposit button calls `/api/create-checkout-session`, which only runs on Vercel (or via `vercel dev`) — it won't work from a plain static file server. Everything else on the page works without it.

## Deploy to Vercel

**Option 1 — Vercel dashboard**
1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: **Other**. No build command or output directory needed — Vercel serves `index.html`/`logo.svg` as static files and auto-detects `api/create-checkout-session.js` as a serverless function.
4. Add the environment variable below, then click **Deploy**.

**Option 2 — Vercel CLI**
```bash
npm i -g vercel
vercel        # deploy a preview
vercel --prod # deploy to production
```

`vercel.json` sets clean URLs and a few basic security headers; no other configuration is required.

## Setting up Stripe (online booking deposit)

The site offers a $50 deposit customers can pay online to reserve an appointment (the deposit amount and the list of bookable services are defined server-side in `api/create-checkout-session.js`, so a customer can never alter the price from the browser).

1. Create a free account at [dashboard.stripe.com](https://dashboard.stripe.com) if you don't have one.
2. In the Stripe Dashboard, go to **Developers → API keys** and copy the **Secret key**.
   - Use the **test mode** secret key (`sk_test_...`) first to try the flow with [Stripe's test card numbers](https://docs.stripe.com/testing) — no real charges happen in test mode.
   - Switch to the **live mode** secret key (`sk_live_...`) once you're ready to accept real payments.
3. In your Vercel project, go to **Settings → Environment Variables** and add:
   - `STRIPE_SECRET_KEY` = your Stripe secret key
4. Redeploy the project so the function picks up the new environment variable.

That's it — no webhook is required for this simple flow. After a successful payment, Stripe redirects the customer back to the site with a confirmation banner, and you'll see the payment (with which service it was for, in the payment's metadata) in your Stripe Dashboard under **Payments**. Since fulfillment here is just "follow up and schedule the appointment," checking the Dashboard is enough; you can add a webhook later if you want automatic order records instead.

## Editing content

Everything lives in `index.html`:
- Paint correction packages (Stage 1/2/3 pricing) — "Paint Correction Packages" section
- Before/after comparison slider — "What Is Paint Correction?" section
- Additional services and pricing — "Additional Services" section
- Online deposit widget — "Reserve Your Spot Online" card in the booking section; the dropdown values must match the keys in `SERVICES` in `api/create-checkout-session.js`
- Free-quote booking form — submits via `mailto:` to the address in the form's `action` attribute
- Contact info (phone/email) — footer and hero

`logo.svg` is the site logo/favicon. `api/create-checkout-session.js` is the only server-side code, and it's the sole place the deposit amount (`DEPOSIT_AMOUNT_CENTS`) and service list are defined.
