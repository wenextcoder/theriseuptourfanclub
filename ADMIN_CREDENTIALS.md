# 🔐 Admin Panel - Quick Start Guide

## Admin Credentials

**🌐 Admin URL:** `http://localhost:3000/admin`

**📧 Email:** `admin@riseupfanclub.com`  
**🔑 Password:** `RiseUp2026!Admin`

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name:** RISEUP Fan Club
   - **Database Password:** (create a strong password)
   - **Region:** Choose closest to you
4. Wait 1-2 minutes for project to be ready

### Step 2: Get Your API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 3: Create Environment File
Create a file named `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=paste_your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here

# Stripe API Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

### Step 4: Create Database Table
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Paste this SQL and click **RUN**:

```sql
-- Create the memberships table
CREATE TABLE memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE NOT NULL,
  address1 TEXT NOT NULL,
  address2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  referral_source TEXT NOT NULL,
  referrer_name TEXT,
  is_dbn_member TEXT NOT NULL,
  birth_city_state TEXT NOT NULL,
  membership_status TEXT NOT NULL,
  membership_level TEXT NOT NULL,
  shirt_size TEXT NOT NULL,
  jacket_size TEXT NOT NULL,
  coupon_code TEXT,
  terms_accepted BOOLEAN NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_intent_id TEXT
);

-- Enable Row Level Security
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Allow form submissions from anyone
CREATE POLICY "Allow anonymous inserts" ON memberships
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow admin to read all data
CREATE POLICY "Allow authenticated reads" ON memberships
  FOR SELECT TO authenticated
  USING (true);
```

### Step 5: Create Admin User
1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** `admin@riseupfanclub.com`
   - **Password:** `RiseUp2026!Admin`
   - **Auto Confirm User:** ✅ YES (check this box!)
4. Click **"Create user"**

### Step 6: Start Your App
```bash
npm run dev
```

---

## ✅ You're Done!

### Access Admin Panel
1. Open: [http://localhost:3000/admin](http://localhost:3000/admin)
2. Login with:
   - Email: `admin@riseupfanclub.com`
   - Password: `RiseUp2026!Admin`

### Test Form Submission
1. Open: [http://localhost:3000](http://localhost:3000)
2. Fill out and submit a test membership application
3. Go back to admin panel and see the submission!

---

## 📊 Admin Panel Features

### Dashboard View
- ✅ **Total submissions counter**
- ✅ **Real-time data updates**
- ✅ **Search functionality** (by name, email, or phone)
- ✅ **Clean table view** with all important details

### Export to CSV
- ✅ Click **"Export CSV"** button
- ✅ Opens in Excel, Google Sheets, or any spreadsheet app
- ✅ Includes ALL submission data
- ✅ Filename includes current date

### Data Included in Export
- Submission ID and Date/Time
- Full name (First, Middle, Last)
- Contact info (Email, Phone)
- Birth information (Date, City/State)
- Complete address
- Referral information
- DBN membership status
- Membership details (Status, Level, Sizes)
- Coupon code (if used)
- Total price paid

---

## 🔒 Security Notes

- Admin panel requires authentication
- Only authenticated users can view submissions
- Form submissions work without authentication
- Database is protected by Row Level Security (RLS)
- Passwords are hashed by Supabase automatically

---

## 🆘 Troubleshooting

### "supabaseUrl is required" error
- Make sure `.env.local` file exists in project root
- Check that environment variables are properly set
- Restart dev server after creating `.env.local`

### Can't login to admin
- Verify you created the user in Supabase Authentication
- Check that "Auto Confirm User" was enabled
- Password is case-sensitive: `RiseUp2026!Admin`

### No submissions showing
- Submit a test form first
- Check Supabase dashboard → Table Editor → memberships
- Verify the SQL policies were created correctly

---

## 📞 Need Help?

Check the SQL Editor in Supabase for any error messages during table creation. All data is stored securely in your Supabase project!

---

**🎉 Congratulations! Your admin panel is ready to use!**

