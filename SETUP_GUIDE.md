# GOLF-Fego Setup Guide

## What's Already Done

Your application has:
- ✅ Complete Next.js 16 frontend with all pages and components
- ✅ Full TypeScript types and interfaces
- ✅ Database schema (schema.sql) - ready to execute
- ✅ Seed data with 10 charities (seed-charities.sql)
- ✅ Environment variable templates (.env and .env.local)
- ✅ API routes structure (ready to integrate)
- ✅ Stripe integration structure
- ✅ Supabase authentication setup

---

## Step-by-Step Setup (4 Steps)

### **STEP 1️⃣ : Add SERVICE ROLE KEY to .env.local** (5 min)

1. Go to **[Supabase Dashboard](https://app.supabase.com)**
2. Select your project → **Settings** → **API**
3. Scroll down to find **"Service Role Secret"** (large key starting with `eyJ...`)
4. Copy the entire key
5. Open `.env.local` and replace:
   ```
   SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE
   ```
   with your actual key

✅ **Result**: You'll have full database access for admin operations

---

### **STEP 2️⃣: Execute Database Schema** (5 min)

1. Go to **[Supabase Dashboard](https://app.supabase.com)** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Open `schema.sql` from your project folder
5. Copy **entire contents** into the SQL editor
6. Click **"Run"**
7. Wait for success message (should say "Completed successfully")

**What this creates:**
- 13 database tables (charities, users, scores, draws, etc.)
- Row Level Security policies
- Indexes for performance
- Automatic timestamp triggers

✅ **Result**: Your database is ready

---

### **STEP 3️⃣: Seed Charities** (2 min)

1. Still in **SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of `seed-charities.sql`
4. Click **"Run"**

✅ **Result**: 10 sample charities added (Cancer Research UK, Oxfam, Save the Children, etc.)

---

### **STEP 4️⃣: Test Locally** (5 min)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see:
- ✅ Home page loads
- ✅ Public pages work (Charities, About, FAQ, etc.)
- ✅ Charities page shows your 10 seeded charities

✅ **Result**: App is running locally

---

## Next: Configure Payments & Email

### **For Testing (You can skip this initially)**

The app uses placeholder values:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
```

These are dummy values. Features that need real config:
- ❌ Subscription checkout (needs real Stripe keys)
- ❌ Email notifications (needs Resend API key)

Everything else works fine!

---

### **For Real Payments (When Ready for Production)**

#### **A) Stripe Setup (10 min)**

1. Create **[Stripe Account](https://stripe.com)** (free)
2. Go to **Dashboard** → **Developers** → **API Keys**
3. Copy your **Publishable Key** (pk_live_...)
4. Copy your **Secret Key** (sk_live_...)
5. Update `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   STRIPE_SECRET_KEY=sk_live_your_key
   ```

6. **Create Products & Prices:**
   - Go to **Products** → **Add Product**
   - Product 1: "Monthly Golf Subscription"
     - Price: £25/month
     - Copy Price ID (price_xxx)
     - Add to .env.local: `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxx`
   
   - Product 2: "Annual Golf Subscription"
     - Price: £250/year
     - Copy Price ID
     - Add to .env.local: `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_xxx`

7. **Set Up Webhooks:**
   - Go to **Developers** → **Webhooks** → **Add Endpoint**
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy Signing Secret
   - Add to .env.local: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

---

#### **B) Email Setup (5 min)**

1. Create **[Resend Account](https://resend.com)** (free tier: 100/day)
2. Go to **API Keys**
3. Copy your API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=your_api_key
   ```

This enables:
- ✅ Password reset emails
- ✅ Subscription confirmations
- ✅ Draw result notifications
- ✅ Winner announcements

---

## Deploy to Vercel

### **Deploy in 3 Steps:**

#### **1. Push to GitHub**
```bash
git add .
git commit -m "Add Supabase credentials and database schema"
git push origin main
```

#### **2. Connect to Vercel**
1. Go to **[Vercel.com](https://vercel.com)**
2. Click **"Import Project"**
3. Select your GitHub repo
4. Click **"Import"**

#### **3. Add Environment Variables**
In Vercel dashboard → **Settings** → **Environment Variables**, add:
```
NEXT_PUBLIC_SUPABASE_URL=your_value
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
SUPABASE_SERVICE_ROLE_KEY=your_value
STRIPE_SECRET_KEY=your_value
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_value
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=your_value
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=your_value
STRIPE_WEBHOOK_SECRET=your_value
RESEND_API_KEY=your_value
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Click **"Deploy"** ✅

Your site is now live!

---

## Features You Can Test Right Now

### **Without Stripe/Email:**
- ✅ Public website (home, about, charities, FAQ)
- ✅ User signup/login
- ✅ Profile creation
- ✅ Score submission
- ✅ Charity browsing
- ✅ Admin dashboard (create test draws)

### **Requires Setup:**
- ❌ Subscribe button (needs Stripe)
- ❌ Email notifications (needs Resend)
- ❌ Payment processing

---

## Common Issues & Solutions

### **"NEXT_PUBLIC_SUPABASE_URL is not set"**
→ Check your `.env.local` file has the correct values (not .env)

### **"Invalid API key" during signup**
→ Run `npm run diagnose:integrations`

If Supabase is live but the anon key is stale, copy the latest **Project URL** and **anon public key** from **Supabase Dashboard → Settings → API** into `.env.local`, then restart `npm run dev`.

### **"RLS policy denied this request"**
→ Make sure schema.sql was fully executed (check Supabase SQL Editor for any errors)

### **"No charities showing"**
→ Make sure you ran seed-charities.sql in SQL Editor

### **"Stripe button doesn't work"**
→ That's expected - use dummy values for now

---

## What's Next

- [ ] Add more charities via admin panel
- [ ] Create your first draw (admin dashboard)
- [ ] Test user signup/login
- [ ] Configure Stripe webhooks
- [ ] Set up custom domain
- [ ] Monitor analytics
- [ ] Go live with real users!

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stripe Docs**: https://stripe.com/docs
- **Resend Docs**: https://resend.com/docs

---

## Summary

**You now have:**
1. ✅ Database schema ready
2. ✅ 10 sample charities
3. ✅ Working Next.js app
4. ✅ Supabase connected
5. ⏳ Stripe integration (ready, needs real keys)
6. ⏳ Email service (ready, needs API key)
7. 🚀 Ready to deploy

**Next action**: Execute schema.sql + seed-charities.sql in Supabase dashboard, then run `npm run dev`!
