import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err.message)
    supabase = null
  }
} else {
  if (!supabaseUrl) console.warn('[Supabase] VITE_SUPABASE_URL is not set — Supabase features disabled')
  if (!supabaseKey) console.warn('[Supabase] VITE_SUPABASE_ANON_KEY is not set — Supabase features disabled')
}

export { supabase }
