# -*- coding: utf-8 -*-
content = '''import { RouterProvider, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { useApp } from './context/AppContext';
import { Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function GlobalIncomingCall() {
  const { incomingCall, acceptCall, rejectCall } = useApp();
  if (!incomingCall) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -120, opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #0d1f1a, #061210)',
          borderBottom: '1px solid rgba(62,207,178,0.25)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            &#128100;
          </div>
          <div>
            <div style={{ color: 'rgba(62,207,178,0.8)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
              Incoming {incomingCall.call_type === 'video' ? 'Video' : 'Voice'} Call
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{incomingCall.caller_name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => rejectCall(incomingCall)}
            style={{ width: 44, height: 44, borderRadius: '50%', background: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(220,38,38,0.4)' }}>
            <PhoneOff size={20} color="white" />
          </button>
          <button onClick={() => acceptCall(incomingCall)}
            style={{ width: 44, height: 44, borderRadius: '50%', background: '#16a34a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.4)' }}>
            <Phone size={20} color="white" />
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
        <GlobalIncomingCall />
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
'''
with open('src/app/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
