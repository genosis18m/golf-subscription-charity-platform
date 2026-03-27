# GOLF-Fego - Setup & Deployment Guide

This guide provides a comprehensive step-by-step process for setting up the GOLF-Fego platform locally and deploying it to production.

---

## 🚀 Quick Setup (15 Minutes)

### 1. Database Configuration (Supabase)

1.  **Get API Keys:**
    - Log in to your [Supabase Dashboard](https://app.supabase.com).
    - Go to **Settings** → **API**.
    - Copy the `Project URL`, `anon public key`, and particularly the `service_role secret` (starts with `eyJ...`).
2.  **Configure Environment:**
    - Create a `.env.local` file in the root directory.
    - Add the following keys:
      ```env
      NEXT_PUBLIC_SUPABASE_URL=your_project_url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
      SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret
      ```
3.  **Initialize Schema:**
    - In Supabase, go to the **SQL Editor**.
    - Run the contents of `schema.sql` (found in the root directory).
4.  **Seed Data:**
    - Run the contents of `seed-charities.sql` (found in the root directory).

### 2. Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run Dev Server:**
    ```bash
    npm run dev
    ```
3.  **Verify:** Visit `http://localhost:3000`. You should see the homepage and be able to browse seeded charities.

---

## 💰 Production Config (Optional)

### Stripe (Payments)
1.  **Get Keys:** From Stripe Dashboard → Developers → API Keys.
2.  **Create Products:** Create a Monthly (`£25/mo`) and Annual (`£250/yr`) product.
3.  **Update `.env.local`:**
    ```env
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
    NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    ```

### Resend (Emails)
1.  **Get Key:** From [Resend Dashboard](https://resend.com).
2.  **Update `.env.local`:**
    ```env
    RESEND_API_KEY=re_...
    ```

---

## 🚀 Deployment (Vercel)

1.  **Push to GitHub:** Ensure your code is in a GitHub repository.
2.  **Import to Vercel:** Select your repo in the Vercel dashboard.
3.  **Add Environment Variables:** Copy all keys from your `.env.local` into Vercel's Environment Variables settings.
4.  **Deploy:** Click "Deploy" and your site will be live!

---

## 🛠️ Maintenance & Troubleshooting

- **Check Integrations:** Run `npm run diagnose:integrations` to verify Supabase/Stripe connectivity.
- **SQL Errors:** Ensure all Supabase extensions (like `pgcrypto`) are enabled if required by the schema.
- **RLS Access:** If data isn't showing, double-check your Supabase Row Level Security policies in the dashboard.
