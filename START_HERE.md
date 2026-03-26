# 🎯 IMMEDIATE ACTION ITEMS - Read This First!

## What You Need To Do RIGHT NOW

### **Step 1: Get Service Role Key (5 minutes)**

1. Go to: https://app.supabase.com
2. Click on your project: **ouxdmqzfdslcsuqxgeof**
3. Left sidebar → **Settings** → **API**
4. Scroll down to **"Service Role Secret"**
5. Click the eye icon to reveal the key
6. **Copy the entire key** (it's very long, starts with `eyJ...`)
7. Open `.env.local` in your editor
8. Find this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE
   ```
9. Replace `PASTE_SERVICE_ROLE_KEY_HERE` with your actual key
10. **Save the file**

✅ Done! You now have database access.

---

### **Step 2: Execute Database Schema (10 minutes)**

1. Go to: https://app.supabase.com
2. Click your project: **ouxdmqzfdslcsuqxgeof**
3. Left sidebar → **SQL Editor**
4. Click **"New Query"** (blue button)
5. A new tab opens
6. Open the file `schema.sql` in your project folder
7. Copy **everything** from schema.sql
8. Paste it into the SQL Editor in Supabase
9. Click **"Run"** (green button)
10. Wait... it will say "Completed successfully" at the bottom
11. You'll see a green checkmark ✅

**What was created:**
- 13 database tables
- Security policies (RLS)
- Indexes and triggers
- Everything needed for the app

---

### **Step 3: Add Sample Charities (5 minutes)**

1. Same Supabase dashboard
2. SQL Editor → Click **"New Query"** again
3. Open file `seed-charities.sql`
4. Copy everything and paste into new query
5. Click **"Run"**
6. Wait for success ✅

**What was added:**
- 10 real charities (Cancer Research UK, Oxfam, WWF, etc.)
- Charity events

---

### **Step 4: Test It Works (2 minutes)**

In your terminal:
```bash
npm install
npm run dev
```

Open: http://localhost:3000

You should see:
- ✅ Home page loads
- ✅ Navigation works
- ✅ Click "Charities" → see your 10 charities

**If anything is missing**, there's likely an error in the SQL execution. Go back to Supabase SQL Editor and check for red error messages.

---

## 🎉 That's It For Basics!

Your app is now **fully functional**. 

**What works right now:**
- ✅ User signup/login
- ✅ Profile creation
- ✅ Browsing charities
- ✅ All public pages
- ✅ Admin dashboard (create/manage draws)
- ✅ Score submission
- ✅ Everything except payments

---

## 💰 Optional: Set Up Real Payments (For Later)

You have 2 options:

### **Option A: Test with Dummy Data (For Now)**
Keep the fake Stripe keys in .env.local. Everything works except checkout button. Perfect for testing the app without real payments.

### **Option B: Real Stripe Setup (For Production)**

When you're ready:

1. **Create Stripe Account**: https://stripe.com/start
2. **Get API Keys**:
   - Go to Dashboard → Developers → API Keys
   - Copy Publishable Key (starts with `pk_live_`)
   - Copy Secret Key (starts with `sk_live_`)
   - Update .env.local with these

3. **Create Products**:
   - Go to Products → Add Product
   - Product 1: "Monthly Subscription" - £25/month
   - Product 2: "Annual Subscription" - £250/year
   - Copy the Price IDs (format: `price_xxx`)
   - Update .env.local with these Price IDs

4. **Update .env.local**:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_xxx
```

5. **Restart dev server** and payments work!

---

## 📧 Optional: Email Notifications (For Later)

1. **Create Resend Account**: https://resend.com (free)
2. **Get API Key**: Dashboard → API Keys
3. **Update .env.local**:
```
RESEND_API_KEY=your_api_key_here
```

This enables:
- ✅ Password reset emails
- ✅ Draw result notifications
- ✅ Winner announcements

---

## 🚀 Deploy to Vercel (Free!)

When you're ready to go live:

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "Add database schema and seed data"
git push
```

2. **Go to**: https://vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Click "Deploy"
6. Add your environment variables in Vercel dashboard
7. Done! Your site is live 🎉

---

## ⚠️ Important Files To Know

- `.env.local` - Your local secrets (NEVER commit this!)
- `schema.sql` - Database setup (run once in Supabase)
- `seed-charities.sql` - Sample data (run once in Supabase)
- `SETUP_GUIDE.md` - Detailed setup documentation
- `package.json` - Dependencies and scripts

---

## 🆘 Need Help?

### "I got an SQL error"
→ Check the error message. Most common is forgetting to enable extensions. Try running schema.sql again.

### "Charities aren't showing"
→ Make sure seed-charities.sql was fully executed without errors.

### "Login isn't working"
→ Check that Supabase auth is enabled (it should be by default).

### "Stripe button doesn't work"
→ That's normal with dummy keys. Use real Stripe keys for production.

---

## ✅ Checklist

- [ ] I added SUPABASE_SERVICE_ROLE_KEY to .env.local
- [ ] I ran schema.sql in Supabase SQL Editor ✅
- [ ] I ran seed-charities.sql in Supabase SQL Editor ✅
- [ ] I ran `npm install` and `npm run dev` ✅
- [ ] I see 10 charities on the /charities page ✅
- [ ] Everything looks good! 🎉

---

You're all set! Your platform is ready to use. Start testing signup, profiles, and draws!

Questions? Check `SETUP_GUIDE.md` for more details.
