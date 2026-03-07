import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import BackRefreshBar from '../components/BackRefreshBar';
const GOLD = '#E8B86D';
const TEAL = '#3ECFB2';
export default function RoleSelect() {
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const isSignup = mode === 'signup';
  return (
    <div className="flex items-center justify-center min-h-screen p-6" style={{ background: '#06060c' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col" style={{ background: '#0D0F14', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
        <BackRefreshBar />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(232,184,109,0.1) 0%, transparent 70%)` }} />
        <div className="relative z-10 flex flex-col flex-1 px-8 pt-16 pb-10">
          <button onClick={() => navigate('/')} className="mb-6 self-start border-none bg-transparent cursor-pointer flex items-center gap-1 text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}><span style={{ fontSize: 18 }}>‚Üê</span> Back</button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-[64px] h-[64px] rounded-[18px] flex items-center justify-center mx-auto mb-5" style={{ background: `linear-gradient(135deg, ${GOLD}, #C8903D)`, boxShadow: '0 16px 32px rgba(232,184,109,0.3)' }}><span style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: '#0D0F14' }}>L</span></div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, fontWeight: 900, color: 'white' }}>{isSignup ? 'Join LALA Kenya' : 'Welcome Back'}</h1>
            <p className="text-[15px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{isSignup ? 'How will you use LALA?' : 'Which account are you signing in to?'}</p>
          </motion.div>
          <motion.button initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} onClick={() => navigate(isSignup ? '/signup/guest' : '/login/guest')} className="w-full rounded-[20px] p-6 mb-4 text-left cursor-pointer border-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div className="flex items-center gap-4 mb-3"><div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-[28px]" style={{ background: 'rgba(232,184,109,0.15)' }}>Ìø®</div><div><div className="text-[18px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'white' }}>I'm a Guest</div><div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{isSignup ? 'Find & book short stays' : 'Sign in to guest account'}</div></div><div className="ml-auto text-[20px]" style={{ color: GOLD }}>‚Üí</div></div>
          </motion.button>
          <motion.button initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} onClick={() => navigate(isSignup ? '/signup/host' : '/login/host')} className="w-full rounded-[20px] p-6 mb-8 text-left cursor-pointer border-none" style={{ background: 'linear-gradient(135deg, rgba(232,184,109,0.1), rgba(62,207,178,0.05))', border: '1px solid rgba(232,184,109,0.2)' }}>
            <div className="flex items-center gap-4 mb-3"><div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-[28px]" style={{ background: 'rgba(62,207,178,0.12)' }}>Ìø†</div><div><div className="text-[18px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'white' }}>List My Stay</div><div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{isSignup ? 'Host & earn with your property' : 'Sign in to host dashboard'}</div></div><div className="ml-auto text-[20px]" style={{ color: TEAL }}>‚Üí</div></div>
          </motion.button>
          <div className="text-center mt-auto">
            {isSignup ? (<div><span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Already have an account? </span><button onClick={() => navigate('/role/login')} style={{ color: GOLD, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Log In</button></div>)
            : (<div><span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.4)' }}>New to LALA? </span><button onClick={() => navigate('/role/signup')} style={{ color: GOLD, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Sign Up</button></div>)}
            <button onClick={() => navigate('/home')} className="border-none bg-transparent cursor-pointer text-[13px] mt-2 block w-full" style={{ color: 'rgba(255,255,255,0.25)' }}>Continue without account ‚Üí</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
