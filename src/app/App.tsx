import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { useApp } from './context/AppContext';
import { Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function GlobalIncomingCallInner() {
  const { incomingCall, acceptCall, rejectCall } = useApp();
  if (!incomingCall) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #0d1f1a, #061210)',
          borderBottom: '1px solid rgba(62,207,178,0.25)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          borderRadius: '44px 44px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            &#128100;
          </div>
          <div>
            <div style={{ color: 'rgba(62,207,178,0.8)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              Incoming {incomingCall.call_type === 'video' ? 'Video' : 'Voice'} Call
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{incomingCall.caller_name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => rejectCall(incomingCall)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneOff size={18} color="white" />
          </button>
          <button onClick={() => acceptCall(incomingCall)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#16a34a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={18} color="white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--lala-card)',
              color: 'var(--lala-white)',
              border: '1px solid var(--lala-border)',
              fontFamily: 'var(--font-dm-sans)',
            },
          }}
        />
      </AppProvider>
    </LanguageProvider>
  );
}
