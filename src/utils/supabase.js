import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yqkasgueywibkilfnnlj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxa2FzZ3VleXdpYmtpbGZubmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTY2NzcsImV4cCI6MjA5MTIzMjY3N30.vbwMxtnOi7LhuY8JbQMKkH1YJxT6Y1S_czTaCN6147A'

export const supabase = createClient(supabaseUrl, supabaseKey)
