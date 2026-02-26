import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://yrotulujihpleiibfcnf.supabase.co"
const SUPABASE_KEY = "sb_publishable_CeAqXbi2qYyvy9D6psSGwg_NNk-dGj5"

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)
