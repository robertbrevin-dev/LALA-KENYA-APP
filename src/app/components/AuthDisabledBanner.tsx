import { motion } from 'motion/react'

export default function AuthDisabledBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[14px] p-3 mb-4"
      style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)' }}
    >
      <div className="text-[13px]" style={{ color: '#FF6B6B', fontWeight: 700 }}>
        ⚠️ Auth disabled
      </div>
      <div className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Add Supabase credentials to .env and restart to enable sign up and sign in.
      </div>
      <div className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
        VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
      </div>
    </motion.div>
  )
}
