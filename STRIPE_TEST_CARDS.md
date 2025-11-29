# 💳 Stripe Test Cards - Quick Reference

## ✅ Cards That Will SUCCEED

### Visa
```
Card: 4242 4242 4242 4242
CVC: 123
Expiry: 12/34
Zip: 12345
```

### Mastercard
```
Card: 5555 5555 5555 4444
CVC: 123
Expiry: 12/34
Zip: 12345
```

### American Express
```
Card: 3782 822463 10005
CVC: 1234
Expiry: 12/34
Zip: 12345
```

---

## ❌ Cards That Will DECLINE

### Generic Decline
```
Card: 4000 0000 0000 0002
CVC: 123
Expiry: 12/34
Zip: 12345
Result: Card declined
```

### Insufficient Funds
```
Card: 4000 0000 0000 9995
CVC: 123
Expiry: 12/34
Zip: 12345
Result: Insufficient funds
```

### Lost Card
```
Card: 4000 0000 0000 9987
CVC: 123
Expiry: 12/34
Zip: 12345
Result: Lost card
```

---

## 🔐 3D Secure Authentication

### Requires Authentication
```
Card: 4000 0027 6000 3184
CVC: 123
Expiry: 12/34
Zip: 12345
Note: Will require 3D Secure authentication
```

---

## 📝 Important Notes

- ✅ Use **any** 3-digit CVC (e.g., 123, 456, 789)
- ✅ Use **any** future expiry date (e.g., 12/34, 05/28)
- ✅ Use **any** valid zip code (e.g., 12345, 90210)
- ✅ Name can be anything (e.g., "Test User")

---

## 🧪 Testing Your Integration

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** [http://localhost:3000](http://localhost:3000)

3. **Fill out the form**

4. **On Step 5 (Payment), use test card:**
   - Card: `4242 4242 4242 4242`
   - CVC: `123`
   - Expiry: `12/34`
   - Zip: `12345`

5. **Click "Pay $XX.XX"**

6. **Success!** ✅

---

## 💰 Test Payment Amounts

- **Basic Membership:** $75.00
- **Plus Membership:** $175.00
- **Premium Membership:** $225.00

---

## 🔗 Useful Links

- **Stripe Dashboard (Test Mode):** [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
- **All Test Cards:** [https://docs.stripe.com/testing](https://docs.stripe.com/testing)

