import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pacxvnwssberftkgoche.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3h2bndzc2JlcmZ0a2dvY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODk5MDUsImV4cCI6MjA4Nzg2NTkwNX0.ueYNPpRHQ39hJbI0BGrfW2bMr5TcHD_EoPP87c_DzfY'

const hasEnv = Boolean(supabaseUrl) && Boolean(supabaseAnonKey)
export const isAuthEnabled = hasEnv

export const supabase = hasEnv
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
        signUp: async (_payload?: any) => ({ data: { user: null }, error: { message: 'Auth disabled' } }),
        signInWithPassword: async (_payload?: any) => ({ data: null, error: { message: 'Auth disabled' } }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Auth disabled' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Auth disabled' } }),
        updateUser: async () => ({ data: null, error: { message: 'Auth disabled' } }),
        verifyOtp: async () => ({ data: null, error: { message: 'Auth disabled' } }),
        onAuthStateChange: (cb: any) => {
          try { cb('INITIAL_SESSION', { user: null }); } catch {}
          const subscription = { unsubscribe: () => {} }
          return { data: { subscription } }
        },
      },
      from: (_table: string) => {
        const result = { data: [], error: { message: 'DB disabled' } }
        const builder: any = {
          select: (_cols?: string) => builder,
          insert: (_payload?: any) => builder,
          update: (_payload?: any) => builder,
          delete: () => builder,
          eq: (_col: string, _val: any) => builder,
          in: (_col: string, _vals: any[]) => builder,
          not: (_col: string, _op: string, _val: any) => builder,
          order: (_col: string, _opts?: any) => builder,
          limit: (_n: number) => builder,
          then: (resolve: any) => Promise.resolve(resolve(result)),
          catch: () => Promise.resolve(result),
        }
        return builder
      },
      storage: {
        from: () => ({
          remove: async (_paths: string[]) => ({ data: null, error: { message: 'Storage disabled' } }),
        }),
      },
    } as any)
