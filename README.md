# Blackline Detailing

Mobile auto detailing website for Blackline Detailing (Venice, FL), focused on paint correction: correction stages, before/after comparison, process, additional services, and booking (with an optional online deposit via Stripe, plus a booking request form that DMs you on Telegram).

Static site (Tailwind via CDN) plus two small Vercel serverless functions — one for Stripe checkout, one for sending booking requests to Telegram — no other build step.

## Local preview

Open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

The "Reserve Your Spot Online" deposit button and the "Send Booking Request" form call `/api/create-checkout-session` and `/api/send-booking-request` respectively, which only run on Vercel (or via `vercel dev`) — they won't work from a plain static file server. Everything else on the page works without it.

## Deploy to Vercel

**Option 1 — Vercel dashboard**
1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: **Other**. No build command or output directory needed — Vercel serves `index.html`/`logo.svg` as static files and auto-detects everything under `api/` as serverless functions.
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

## Setting up booking requests (Telegram)

The "Request a Free Paint Assessment" form sends its details straight to you as a Telegram message from your own bot — free, instant, and shows up as a push notification on your phone.

1. **Create your bot.** In Telegram, open a chat with [@BotFather](https://t.me/BotFather), send `/newbot`, and follow the prompts (pick any name/username). BotFather replies with a token that looks like `123456789:AAExampleTokenNotReal`. That's your `TELEGRAM_BOT_TOKEN`.
2. **Start a chat with your new bot.** Search for its username in Telegram and send it any message (e.g. "hi") — bots can't message you first, so this one-time step is required.
3. **Find your chat ID.** In a browser, visit:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   (replacing `<YOUR_TOKEN>` with the token from step 1). Look for `"chat":{"id":123456789,...}` in the response — that number is your `TELEGRAM_CHAT_ID`.
4. In your Vercel project, go to **Settings → Environment Variables** and add:
   - `TELEGRAM_BOT_TOKEN` = the token from step 1
   - `TELEGRAM_CHAT_ID` = the chat id from step 3
5. Redeploy the project so the function picks up the new environment variables.

That's it — no webhook, no paid tier, no domain setup. Every submission arrives as a plain-text Telegram DM from your bot with the customer's name, phone, email (if given), vehicle, address, requested services, and notes. If you ever want it in a group instead of a personal DM, add the bot to a Telegram group and use the group's chat id (starts with `-`) instead.

## Editing content

Everything lives in `index.html`:
- Paint correction packages (Stage 1/2/3 pricing) — "Paint Correction Packages" section
- Before/after comparison slider — "What Is Paint Correction?" section
- Additional services and pricing — "Additional Services" section
- Online deposit widget — "Reserve Your Spot Online" card in the booking section; the dropdown values must match the keys in `SERVICES` in `api/create-checkout-session.js`
- Free-quote booking form — submits via JS `fetch` to `/api/send-booking-request`, which DMs the details to you on Telegram
- Contact info (phone/email) — footer and hero

`logo.svg` is the site logo/favicon. `api/` holds the two serverless functions: `create-checkout-session.js` (deposit amount and service list for Stripe) and `send-booking-request.js` (Telegram message template for booking requests).
