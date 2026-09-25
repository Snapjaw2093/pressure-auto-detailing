# Pressure Auto Detailing

Mobile auto detailing website for Pressure Auto Detailing (Venice, FL), focused on paint correction: correction stages, before/after comparison, process, additional services, and a booking form.

Static site — plain HTML/CSS (Tailwind via CDN) + a small amount of vanilla JS for the before/after slider. No build step.

## Local preview

Open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

## Deploy to Vercel

**Option 1 — Vercel dashboard**
1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: **Other** (static site). No build command or output directory needed — Vercel will serve the files as-is.
4. Click **Deploy**.

**Option 2 — Vercel CLI**
```bash
npm i -g vercel
vercel        # deploy a preview
vercel --prod # deploy to production
```

`vercel.json` sets clean URLs and a few basic security headers; no other configuration is required.

## Editing content

Everything lives in `index.html`:
- Paint correction packages (Stage 1/2/3 pricing) — "Paint Correction Packages" section
- Before/after comparison slider — "What Is Paint Correction?" section
- Additional services and pricing — "Additional Services" section
- Booking form — submits via `mailto:` to the address in the form's `action` attribute
- Contact info (phone/email) — footer and hero

`logo.svg` is the site logo/favicon.
