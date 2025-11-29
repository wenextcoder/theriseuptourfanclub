# 💳 Stripe Payment Integration Guide

## 🔑 Stripe API Keys

**Test Mode Keys:**
- Get your keys from: [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
- **Publishable Key:** Starts with `pk_test_`
- **Secret Key:** Starts with `sk_test_`

**Note:** Add your keys to the `.env.local` file (never commit this file).

---

## ✅ What's Been Integrated

### 1. Payment Flow
- ✅ **5-Step Process:** Added payment as Step 5
- ✅ **Secure Processing:** Server-side payment intent creation
- ✅ **Auto-calculation:** Price based on membership level
- ✅ **Real-time validation:** Stripe validates cards before processing

### 2. Features
- ✅ **Multiple Payment Methods:** Credit cards, debit cards, and more
- ✅ **3D Secure Support:** For enhanced security
- ✅ **Test Mode:** Use test cards for development
- ✅ **Payment Receipt:** Stripe sends email receipts
- ✅ **Payment Tracking:** Payment Intent ID saved with submission

### 3. Payment Amounts
- **Basic:** $75
- **Plus:** $175  
- **Premium:** $225

---

## 🧪 Testing with Stripe Test Cards

Use these test cards in **test mode**:

### ✅ Successful Payments
| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Visa - Always succeeds |
| `5555 5555 5555 4444` | Mastercard - Always succeeds |
| `3782 822463 10005` | American Express - Always succeeds |

### ❌ Declined Payments
| Card Number | Description |
|-------------|-------------|
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

### 🔐 3D Secure (Authentication Required)
| Card Number | Description |
|-------------|-------------|
| `4000 0027 6000 3184` | Requires 3D Secure |

**For all test cards:**
- **CVC:** Any 3 digits (e.g., `123`)
- **Expiry:** Any future date (e.g., `12/34`)
- **Zip:** Any valid zip (e.g., `12345`)

---

## 📋 Environment Setup

### Update your `.env.local` file:

```env
# Stripe API Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### When Ready for Production:

1. Get your **Live API Keys** from Stripe Dashboard
2. Update `.env.local`:

```env
# Stripe API Keys (LIVE MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
```

---

## 🗄️ Updated Database Schema

Add this column to your Supabase `memberships` table:

```sql
-- Add payment_intent_id column
ALTER TABLE memberships 
ADD COLUMN payment_intent_id TEXT;

-- Create index for faster lookups
CREATE INDEX idx_payment_intent_id ON memberships(payment_intent_id);
```

This stores the Stripe Payment Intent ID for each transaction.

---

## 🚀 How It Works

### User Flow:
1. User fills out form (Steps 1-3)
2. User reviews information and accepts terms (Step 4)
3. User clicks "Proceed to Payment"
4. **Payment Intent Created** on the server
5. Stripe payment form appears (Step 5)
6. User enters card details
7. Payment processed securely by Stripe
8. On success: Form data + payment ID saved to database
9. User receives confirmation

### Security:
- ✅ Payment processed directly by Stripe (PCI compliant)
- ✅ No card data touches your server
- ✅ Server-side payment intent creation
- ✅ SSL encrypted connection
- ✅ Row Level Security on database

---

## 📊 Admin Panel Updates

The admin dashboard now shows:
- Payment Intent ID for each submission
- All payment data is exportable to CSV
- Track which members have paid

---

## 🔧 Customization

### Change Payment Amounts

Edit `membership-form.tsx`:

```typescript
useEffect(() => {
    let newPrice = 0;
    if (membershipLevel === "basic") newPrice = 75;
    if (membershipLevel === "plus") newPrice = 175;
    if (membershipLevel === "premium") newPrice = 225;
    setPrice(newPrice);
}, [membershipLevel]);
```

### Stripe Appearance

Customize in `membership-form.tsx`:

```typescript
<Elements
    options={{
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#9F0001', // Your brand color
            },
        },
    }}
    stripe={stripePromise}
>
```

---

## 🆘 Troubleshooting

### "Payment processing failed"
- Check your `.env.local` file has correct keys
- Verify you're using test cards in test mode
- Check browser console for error messages

### "Unable to initialize payment"
- Ensure API route `/api/create-payment-intent` is accessible
- Check server logs for errors
- Verify Stripe secret key is set

### Test card not working
- Make sure you're using test keys (starting with `pk_test_` and `sk_test_`)
- Use exact card numbers from test card list
- Try a different test card number

---

## 📞 Stripe Dashboard

Access your Stripe Dashboard:
- **Test Mode:** [https://dashboard.stripe.com/test](https://dashboard.stripe.com/test)
- **Live Mode:** [https://dashboard.stripe.com/](https://dashboard.stripe.com/)

View:
- All transactions
- Customer details
- Payment analytics
- Refunds
- Disputes

---

## 🎉 Ready to Go Live?

When ready for production:

1. ✅ Get your Live API keys from Stripe
2. ✅ Update `.env.local` with live keys
3. ✅ Test thoroughly with real cards
4. ✅ Verify webhooks (if needed for advanced features)
5. ✅ Update Stripe business settings
6. ✅ Enable automatic payouts

---

**💡 Tip:** Always test the complete flow with test cards before going live!

