# 🔐 Stripe API Keys - SECURE SETUP

## ⚠️ IMPORTANT SECURITY NOTICE

**NEVER commit your Stripe API keys to Git/GitHub!**

Your actual Stripe keys have been provided separately. Follow these steps:

---

## 🔑 Where to Get Your Stripe Keys

1. **Login to Stripe Dashboard:**
   - Test Mode: [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
   - Live Mode: [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

2. **Copy Your Keys:**
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

---

## 📝 Setup Instructions

### 1. Create `.env.local` File

In your project root, create a file named `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe API Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

### 2. Add Your Actual Keys

Replace `pk_test_your_actual_key_here` and `sk_test_your_actual_key_here` with your real Stripe keys.

### 3. Verify `.gitignore`

Make sure `.env.local` is in your `.gitignore` file:

```
node_modules
.next
.env.local
.env*.local
```

---

## ✅ Security Best Practices

1. ✅ **Never commit API keys** to version control
2. ✅ **Use environment variables** (`.env.local`)
3. ✅ **Keep `.env.local` in `.gitignore`**
4. ✅ **Use test keys** for development
5. ✅ **Rotate keys** if accidentally exposed
6. ✅ **Use different keys** for test/live environments

---

## 🆘 If Keys Are Exposed

If you accidentally commit API keys:

1. **Immediately revoke** the keys in Stripe Dashboard
2. **Generate new keys**
3. **Update your `.env.local`** with new keys
4. **Remove keys from Git history** (if needed)

---

## 🧪 Test Your Setup

After adding keys to `.env.local`:

```bash
# Restart your development server
npm run dev

# Test a payment with test card
# Card: 4242 4242 4242 4242
# CVC: 123
# Expiry: Any future date
```

---

## 📞 Need Help?

- Stripe Documentation: [https://docs.stripe.com/keys](https://docs.stripe.com/keys)
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)

