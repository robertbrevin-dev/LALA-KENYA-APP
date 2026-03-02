import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = (session.user.user_metadata as any)?.role || 'guest';
        if (role === 'host') {
          navigate('/host');
        } else {
          navigate('/home');
        }
      }
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative"
        style={{
          background: 'var(--lala-night)',
          border: '1px solid var(--lala-border)',
          boxShadow: '0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)'
        }}
      >
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, rgba(232,184,109,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 70%, rgba(62,207,178,0.08) 0%, transparent 60%),
            linear-gradient(180deg, #0D0F14 0%, #0A0B10 100%)
          `
        }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(232,184,109,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,184,109,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-8 pt-20 pb-12 text-center">

          {/* Top Section — Logo + Tagline */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-[80px] h-[80px] rounded-[22px] flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--lala-gold), #D4A045)',
                boxShadow: '0 20px 40px rgba(232,184,109,0.35)',
                fontFamily: 'var(--font-playfair)',
                fontSize: '36px',
                fontWeight: 900,
                color: 'var(--lala-night)'
              }}
            >
              L
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '48px',
                fontWeight: 900,
                letterSpacing: '-1px',
                background: 'linear-gradient(135deg, var(--lala-gold-light), var(--lala-gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}
            >
              LALA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm mb-5"
              style={{ color: 'var(--lala-soft)', letterSpacing: '2px' }}
            >
              KENYA · PATA LALA SASA
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[14px] max-w-[260px]"
              style={{ color: 'var(--lala-muted)', lineHeight: '1.8' }}
            >
              Instant short-stays, anywhere.<br />
              Verified hosts. Fast M-Pesa payments.<br />
              Book in under a minute.
            </motion.div>
          </div>

          {/* Bottom Section — Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full flex flex-col gap-3"
          >
            {/* Sign Up Button */}
            <button
              onClick={() => navigate('/signup')}
              className="w-full py-4 px-6 rounded-[16px] border-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--lala-gold), #D4A045)',
                color: 'var(--lala-night)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.3px',
                boxShadow: '0 8px 24px rgba(232,184,109,0.35)'
              }}
            >
              🏨 Get Started — Sign Up
            </button>

            {/* Login Button — BIG and clear */}
            <button
              onClick={() => navigate('/signup')}
              className="w-full py-4 px-6 rounded-[16px] cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--lala-white)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '16px',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                letterSpacing: '0.3px'
              }}
            >
              🔑 Log In or Sign Up
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px" style={{ background: 'var(--lala-border)' }} />
              <span className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>or browse first</span>
              <div className="flex-1 h-px" style={{ background: 'var(--lala-border)' }} />
            </div>

            {/* Browse without account */}
            <button
              onClick={() => navigate('/home')}
              className="w-full py-3 px-6 rounded-[16px] cursor-pointer border-none"
              style={{
                background: 'transparent',
                color: 'var(--lala-muted)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Browse Properties →
            </button>

            <p className="text-[11px] mt-1" style={{ color: 'var(--lala-muted)', lineHeight: '1.6' }}>
              By continuing you agree to our Terms & Privacy Policy
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}