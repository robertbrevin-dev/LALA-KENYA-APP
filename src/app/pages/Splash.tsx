import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { supabase } from '../../lib/supabase';

export default function Splash() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<'logo' | 'content'>('logo');
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(195);
  const mouseY = useMotionValue(422);
  const glowX = useTransform(mouseX, [0, 390], ['-10%', '110%']);
  const glowY = useTransform(mouseY, [0, 844], ['-10%', '110%']);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = (session.user.user_metadata as any)?.role || 'guest';
        navigate(role === 'host' ? '/host' : '/home');
      } else {
        // Logo phase first, then reveal content
        setTimeout(() => setPhase('content'), 1400);
        setTimeout(() => setReady(true), 200);
      }
    });
  }, [navigate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #1a0f00 0%, #03020a 50%, #000000 100%)' }}
    >
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[390px] h-[844px] rounded-[48px] overflow-hidden relative flex flex-col"
        style={{
          background: 'linear-gradient(170deg, #0e0b08 0%, #080608 40%, #060408 100%)',
          border: '1px solid rgba(232,184,109,0.15)',
          boxShadow: `
            0 100px 200px rgba(0,0,0,0.98),
            0 0 0 1px rgba(255,255,255,0.02),
            inset 0 1px 0 rgba(232,184,109,0.1),
            inset 0 -1px 0 rgba(0,0,0,0.5)
          `,
        }}
      >
        {/* Interactive mouse-follow glow */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,184,109,0.07) 0%, transparent 70%)',
            left: glowX,
            top: glowY,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Static background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top gold bloom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 90% 45% at 50% -5%, rgba(232,184,109,0.22) 0%, transparent 65%)',
          }} />
          {/* Bottom teal whisper */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 30% at 15% 95%, rgba(62,207,178,0.06) 0%, transparent 60%)',
          }} />
          {/* Fine grain overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.4,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }} />
          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(232,184,109,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,109,0.025) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }} />
        </div>

        {/* Animated gold particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: i % 2 === 0 ? 2 : 3,
              height: i % 2 === 0 ? 2 : 3,
              background: `rgba(232,184,109,${0.3 + i * 0.05})`,
              left: `${15 + i * 13}%`,
              top: `${20 + (i % 3) * 15}%`,
            }}
            animate={{
              y: [-8, 8, -8],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Horizontal shimmer sweep */}
        <motion.div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ height: 1, top: '38%', background: 'linear-gradient(90deg, transparent 0%, rgba(232,184,109,0.4) 50%, transparent 100%)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ delay: 0.8, duration: 1.2, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
        />

        <div className="relative z-10 flex flex-col items-center justify-between h-full px-8 pt-14 pb-10 text-center">

          {/* ── LOGO SECTION ── */}
          <div className="flex flex-col items-center">

            {/* Logo with dramatic reveal */}
            <AnimatePresence>
              {ready && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: -20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                  className="relative mb-8"
                >
                  {/* Outer pulse ring 1 */}
                  <motion.div
                    className="absolute rounded-[32px] pointer-events-none"
                    style={{ inset: -14, border: '1px solid rgba(232,184,109,0.15)', borderRadius: 38 }}
                    animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  {/* Outer pulse ring 2 */}
                  <motion.div
                    className="absolute rounded-[40px] pointer-events-none"
                    style={{ inset: -26, border: '1px solid rgba(232,184,109,0.07)', borderRadius: 50 }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  />

                  {/* Logo box */}
                  <motion.div
                    whileHover={{ scale: 1.06, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-[92px] h-[92px] rounded-[28px] flex items-center justify-center relative"
                    style={{
                      background: 'linear-gradient(145deg, #F7DC8A 0%, #E8B86D 35%, #D4953A 70%, #B87820 100%)',
                      boxShadow: `
                        0 0 0 1px rgba(255,220,130,0.3),
                        0 20px 60px rgba(232,184,109,0.55),
                        0 8px 24px rgba(232,184,109,0.4),
                        0 2px 8px rgba(0,0,0,0.6),
                        inset 0 2px 0 rgba(255,255,255,0.35),
                        inset 0 -2px 0 rgba(0,0,0,0.2)
                      `,
                    }}
                  >
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-[28px]" style={{
                      background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: 42,
                      fontWeight: 900,
                      color: '#1a0a00',
                      lineHeight: 1,
                      position: 'relative',
                      textShadow: '0 1px 0 rgba(255,255,255,0.2)',
                    }}>L</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* LALA wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '60px',
                fontWeight: 900,
                letterSpacing: '-3px',
                background: 'linear-gradient(170deg, #FFF0C0 0%, #F5D080 20%, #E8B86D 50%, #C8843A 80%, #9A5E1A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 0.95,
                marginBottom: 12,
                filter: 'drop-shadow(0 4px 24px rgba(232,184,109,0.3))',
              }}>LALA</h1>
            </motion.div>

            {/* Kenya badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(232,184,109,0.12), rgba(232,184,109,0.06))',
                border: '1px solid rgba(232,184,109,0.25)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ fontSize: 14 }}>🇰🇪</span>
              <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: '#E8B86D' }}>KENYA</span>
              <span style={{ color: 'rgba(232,184,109,0.3)', fontSize: 8 }}>◆</span>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(232,184,109,0.7)' }}>PATA LALA SASA</span>
            </motion.div>

            {/* Features — staggered */}
            <motion.div className="flex flex-col gap-2.5 w-full max-w-[260px]">
              {[
                { icon: '🏙️', text: 'Instant short-stays, anywhere' },
                { icon: '✅', text: 'Verified hosts. Zero surprises.' },
                { icon: '⚡', text: 'Book in under 60 seconds' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-[12px]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={{ fontSize: 16, minWidth: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'left', lineHeight: 1.4 }}>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── BUTTONS ── */}
          <AnimatePresence>
            {phase === 'content' && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col gap-3"
              >
                {/* PRIMARY — Get Started */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.015 }}
                  onClick={() => navigate('/role/signup')}
                  className="w-full relative overflow-hidden rounded-[18px] border-none cursor-pointer"
                  style={{ padding: '17px 24px' }}
                >
                  {/* Button background */}
                  <div className="absolute inset-0 rounded-[18px]" style={{
                    background: 'linear-gradient(135deg, #F7DC8A 0%, #E8B86D 40%, #C8843A 100%)',
                    boxShadow: '0 16px 48px rgba(232,184,109,0.5), 0 4px 16px rgba(232,184,109,0.3), inset 0 1px 0 rgba(255,255,255,0.35)',
                  }} />
                  {/* Shine */}
                  <motion.div
                    className="absolute inset-0 rounded-[18px] pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <span className="relative flex items-center justify-center gap-2.5" style={{ fontSize: '16px', fontWeight: 800, color: '#1a0800', letterSpacing: '0.1px' }}>
                    <span style={{ fontSize: 18 }}>🏨</span>
                    Get Started — Sign Up
                  </span>
                </motion.button>

                {/* SECONDARY — Log In */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.015 }}
                  onClick={() => navigate('/role/login')}
                  className="w-full rounded-[18px] cursor-pointer relative overflow-hidden"
                  style={{
                    padding: '17px 24px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1.5px solid rgba(232,184,109,0.2)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{
                    background: 'linear-gradient(135deg, rgba(232,184,109,0.06) 0%, transparent 60%)',
                  }} />
                  <span className="relative flex items-center justify-center gap-2.5" style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1px' }}>
                    <span style={{ fontSize: 16 }}>🔑</span>
                    I Already Have an Account
                  </span>
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-0.5">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>OR</span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />
                </div>

                {/* Ghost — Browse */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/home')}
                  className="w-full py-3 rounded-[14px] border-none cursor-pointer"
                  style={{ background: 'transparent', color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 500 }}
                >
                  Browse Properties →
                </motion.button>

                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.12)', lineHeight: 1.7, marginTop: 2 }}>
                  By continuing you agree to our Terms & Privacy Policy
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}