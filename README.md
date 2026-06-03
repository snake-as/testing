# ClaimPilot

Professional insurance claim documentation tool. Upload your policy, answer 8 questions, and download a complete PDF claim package powered by AI.

## Features

- Policy coverage analysis (AI-powered)
- Damage inventory generation
- Formal dispute letter drafting
- Professional PDF package download
- Mobile-first, clean UI
- No login or accounts required

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Anthropic Claude API** (claude-sonnet-4-5)
- **pdf-lib** for PDF generation
- **Resend** (optional email delivery)

---

## 1. Files Created

```
claimpilot/
├── .env.example
├── .gitignore
├── README.md
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout with Inter font and metadata
    │   ├── globals.css         # Tailwind base + utility classes
    │   ├── page.tsx            # Landing page
    │   ├── claim/
    │   │   └── page.tsx        # Claim form page
    │   ├── privacy/
    │   │   └── page.tsx
    │   ├── terms/
    │   │   └── page.tsx
    │   ├── disclaimer/
    │   │   └── page.tsx
    │   └── api/
    │       ├── extract-pdf/
    │       │   └── route.ts    # Extracts text from uploaded policy PDF
    │       ├── process-claim/
    │       │   └── route.ts    # Runs 3 Claude AI calls in sequence
    │       └── generate-pdf/
    │           └── route.ts    # Generates final PDF with pdf-lib
    ├── components/
    │   ├── ClaimForm.tsx       # Multi-step form (upload → questions → processing → done)
    │   ├── Header.tsx
    │   └── Footer.tsx
    ├── lib/
    │   ├── anthropic.ts        # 3 Claude API calls (policy analysis, inventory, letter)
    │   └── pdf.ts              # PDF generation with pdf-lib
    └── types/
        └── claim.ts            # TypeScript types
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Add API Keys

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
RESEND_API_KEY=re_your_key_here          # Optional for email delivery
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get your Anthropic API key:** https://console.anthropic.com

**Stripe keys** (add when ready for payments):
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test the flow:**
1. Click "Start My Claim Package"
2. Upload any insurance PDF (test PDF is fine)
3. Answer all 8 questions
4. Click "Generate My Package"
5. Download your PDF

---

## 5. Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add your `ANTHROPIC_API_KEY`.

### Option B: Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your GitHub repo
4. Add environment variables:
   - `ANTHROPIC_API_KEY` = your key
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL
5. Click Deploy

### Vercel Settings

The app is pre-configured for Vercel:
- API routes use `maxDuration = 60` for the AI processing endpoint
- No special build settings needed
- Framework preset: Next.js (auto-detected)

---

## Adding Stripe (Phase 2)

To add the €49 payment gate before PDF download:

1. Install Stripe: `npm install stripe @stripe/stripe-js`
2. Add Stripe keys to `.env.local`
3. Create `/api/create-checkout` route
4. Create `/api/webhook` route for payment confirmation
5. In `ClaimForm.tsx`, replace the direct download button on the `done` step with a Stripe Checkout redirect
6. After successful payment, redirect to `/claim/success?session_id=...` and trigger PDF download

---

## Legal

ClaimPilot is a document preparation service. It does not constitute legal, financial, or regulated insurance advice.
