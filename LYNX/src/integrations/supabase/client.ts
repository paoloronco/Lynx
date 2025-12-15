import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjzshwbjnkxvthdiqadg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqenNod2Jqbmt4dnRoZGlxYWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzM4MTIsImV4cCI6MjA2OTYwOTgxMn0.pDTATcRzLNINZ4Kpzm5zrFoYShff0IYsfDt8NUONUSc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})