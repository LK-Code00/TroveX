import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ftjzhxbempifcxnrxhoh.supabase.co"
const SUPABASE_KEY = "sb_publishable_2GRy6GmkuJAbbiSo367iFQ_d0naHmY0"

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
