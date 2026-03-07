import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const GOLD = '#E8B86D';
const TEAL = '#3ECFB2';

const features = [
  { icon: '🏨', text: 'Instant short-stays, anywhere' },
  { icon: '✅', text: 'Verified hosts. Zero surprises.' },
  { icon: '⚡', text: 'Book in under 60 seconds' },
];

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#03020a' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{
          background: 'linear-gradient(170deg, #0e0b08 0%, #080608 60%, #060408 100%)',
          border: '1px solid rgba(232,184,109,0.1)',
          boxShadow: '0 80px 160px rgba(0,0,0,0.95)',
        }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(232,184,109,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,109,0.02) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-72 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,184,109,0.13) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 flex flex-col flex-1 px-7 pt-16 pb-10 justify-between">

          {/* Top: Logo + title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            {/* L icon */}
            <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-5 relative"
              style={{
                background: 'linear-gradient(145deg, #F7DC8A, #E8B86D, #C8843A)',
                boxShadow: '0 20px 50px rgba(232,184,109,0.45)',
              }}>
              <div className="absolute inset-0 rounded-[24px]" style={{
                background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)',
              }} />
              <span style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 36,
                fontWeight: 900,
                color: '#1a0800',
                position: 'relative',
              }}>L</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 48,
              fontWeight: 900,
              color: GOLD,
              letterSpacing: '-1px',
              lineHeight: 1,
              marginBottom: 10,
            }}>LALA</h1>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{ background: 'rgba(232,184,109,0.08)', border: '1px solid rgba(232,184,109,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>
                KENYA &bull; PATA LALA SASA
              </span>
            </div>

            {/* Feature pills */}
            <div className="flex flex-col gap-2.5 w-full">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-[14px]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom: Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            {/* Get Started */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/role/signup')}
              className="w-full py-4 rounded-[18px] border-none cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, #F7DC8A, ${GOLD}, #C8843A)`,
                boxShadow: '0 8px 30px rgba(232,184,109,0.35)',
              }}
            >
              <span style={{ fontSize: 20 }}>🏠</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1a0800', fontFamily: 'var(--font-playfair)' }}>
                Get Started — Sign Up
              </span>
            </motion.button>

            {/* Already have account */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/role/login')}
              className="w-full py-4 rounded-[18px] border-none cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'rgba(232,184,109,0.08)',
                border: '1.5px solid rgba(232,184,109,0.25)',
              }}
            >
              <span style={{ fontSize: 20 }}>🔑</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: GOLD, fontFamily: 'var(--font-playfair)' }}>
                I Already Have an Account
              </span>
            </motion.button>

            <div className="text-center my-1" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>OR</div>

            <button
              onClick={() => navigate('/home')}
              className="border-none bg-transparent cursor-pointer text-center"
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}
            >
              Browse Properties →
            </button>

            <p className="text-center" style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>
              By continuing you agree to our Terms & Privacy Policy
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
