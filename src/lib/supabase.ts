import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type MembershipSubmission = {
  id: string
  created_at: string
  first_name: string
  middle_name?: string
  last_name: string
  nickname: string
  email: string
  phone: string
  birth_date: string
  address1: string
  address2?: string
  city: string
  state: string
  zip_code: string
  referral_source: string
  referrer_name?: string
  is_dbn_member: string
  birth_city_state: string
  membership_status: string
  membership_level: string
  shirt_size: string
  jacket_size: string
  coupon_code?: string
  terms_accepted: boolean
  total_price: number
  payment_intent_id?: string
}

