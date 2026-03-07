import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://pacxvnwssberftkgoche.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3h2bndzc2JlcmZ0a2dvY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODk5MDUsImV4cCI6MjA4Nzg2NTkwNX0.ueYNPpRHQ39hJbI0BGrfW2bMr5TcHD_EoPP87c_DzfY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'lala-kenya-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})
export const isAuthEnabled = true;
