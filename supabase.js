import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://zzyyjyiawfrupeifdaxl.supabase.co"
const SUPABASE_KEY = "sb_publishable_-jyZrmSF0zbcgIAkO6CskQ_BTb8iVh4"

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)
