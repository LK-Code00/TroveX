import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ftjzhxbempifcxnrxhoh.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0anpoeGJlbXBpZmN4bnJ4aG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MDQwODcsImV4cCI6MjA4ODE4MDA4N30.DFQsTZa5rFcDAw-gKJZJTRj1kPj-h4gTt5jq7ExRXNQ"

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)
