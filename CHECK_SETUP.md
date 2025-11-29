# 🔧 Troubleshooting Payment Issues

## ⚠️ If Payment Button Does Nothing

### Step 1: Check Environment Variables

Make sure you have a `.env.local` file in your project root:

```env
# Stripe API Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TYooMQauvdEDq54NiTphI7jx
STRIPE_SECRET_KEY=sk_test_BQokikJOvBiI2HlWgH4olfQ2

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important:** Replace the placeholder Supabase values with your actual keys!

### Step 2: Restart Development Server

After creating/updating `.env.local`:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Check Browser Console

Open Chrome DevTools (F12) → Console tab

Look for these messages:

**✅ Good Messages:**
```
=== Creating Payment Intent ===
Amount: 75
✅ Client secret set successfully
=== Payment Submit Started ===
Stripe loaded: true
Elements loaded: true
✅ Payment successful!
```

**❌ Bad Messages (and fixes):**
```
❌ STRIPE_SECRET_KEY not found
→ Add keys to .env.local and restart server

❌ Stripe or Elements not loaded
→ Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local

❌ Failed to initialize payment
→ Check API route is working at /api/create-payment-intent
```

### Step 4: Test API Route

Open in browser:
```
http://localhost:3000/api/create-payment-intent
```

You should see an error (that's normal), but NOT a 404.

### Step 5: Verify Stripe Keys Are Valid

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy your keys again
3. Update `.env.local`
4. Restart dev server

---

## 🐛 Common Issues

### Issue: Button Does Nothing
**Cause:** Stripe keys not loaded
**Fix:** 
1. Check `.env.local` exists
2. Keys start with `pk_test_` and `sk_test_`
3. Restart server

### Issue: Redirects to localhost:3000
**Cause:** Payment intent not created
**Fix:** Check browser console for errors

### Issue: "Payment system not ready"
**Cause:** Stripe.js not loaded
**Fix:** Check publishable key in `.env.local`

---

## ✅ Quick Test Checklist

Run this checklist:

- [ ] `.env.local` file exists in project root
- [ ] File contains `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] File contains `STRIPE_SECRET_KEY=sk_test_...`
- [ ] Dev server restarted after adding keys
- [ ] Browser console open (F12)
- [ ] Can see "Creating Payment Intent" in console

---

## 📞 Still Not Working?

Check the browser console and share these details:
1. What do you see in Console tab?
2. Any red error messages?
3. Does it say "Creating Payment Intent"?
4. What's the value of `Stripe loaded: true/false`?

