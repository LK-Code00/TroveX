import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://yrotulujihpleiibfcnf.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyb3R1bHVqaWhwbGVpaWJmY25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjE0MzMsImV4cCI6MjA4NzYzNzQzM30.I6zYY5q6zft-mtZKzOeaGGeuoE5BvRtoAaG_LRxLG_c"

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)
