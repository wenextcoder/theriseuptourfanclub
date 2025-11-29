# Admin Panel Setup Guide

## 🔐 Admin Credentials

**Email:** `admin@riseupfanclub.com`  
**Password:** `RiseUp2026!Admin`

---

## 📋 Supabase Setup Instructions

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Environment Variables
Create a `.env.local` file in the project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Admin Credentials
NEXT_PUBLIC_ADMIN_EMAIL=admin@riseupfanclub.com
NEXT_PUBLIC_ADMIN_PASSWORD=RiseUp2026!Admin
```

### 3. Database Schema
Run this SQL in your Supabase SQL Editor:

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
  total_price NUMERIC NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON memberships
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated reads (for admin)
CREATE POLICY "Allow authenticated reads" ON memberships
  FOR SELECT TO authenticated
  USING (true);
```

### 4. Create Admin User in Supabase
1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user"
3. Email: `admin@riseupfanclub.com`
4. Password: `RiseUp2026!Admin`
5. Confirm the user

---

## 🚀 Access Admin Panel

Once setup is complete, access the admin panel at:

**URL:** `http://localhost:3000/admin`

---

## 📊 Features

- ✅ Secure admin login
- ✅ View all membership submissions
- ✅ Export data as CSV for Excel
- ✅ Search and filter submissions
- ✅ Real-time updates

