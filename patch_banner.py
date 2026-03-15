# -*- coding: utf-8 -*-

# Create standalone banner component
banner = '''import { useApp } from '../context/AppContext';
import { Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function IncomingCallBanner() {
  const { incomingCall, acceptCall, rejectCall } = useApp();
  if (!incomingCall) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #0d2a1f, #061a10)',
          borderBottom: '1px solid rgba(62,207,178,0.3)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(62,207,178,0.15)', border: '2px solid rgba(62,207,178,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>&#128100;</div>
          <div>
            <div style={{ color: 'rgba(62,207,178,0.9)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Incoming {incomingCall.call_type === 'video' ? 'Video' : 'Voice'} Call</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{incomingCall.caller_name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => rejectCall(incomingCall)} style={{ width: 38, height: 38, borderRadius: '50%', background: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(220,38,38,0.5)' }}>
            <PhoneOff size={16} color="white" />
          </button>
          <button onClick={() => acceptCall(incomingCall)} style={{ width: 38, height: 38, borderRadius: '50%', background: '#16a34a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(22,163,74,0.5)' }}>
            <Phone size={16} color="white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
'''
with open('src/app/components/IncomingCallBanner.tsx', 'w', encoding='utf-8') as f:
    f.write(banner)
print("Banner created")

# Fix PhoneFrame to use new component
with open('src/app/components/PhoneFrame.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace(
    "import { GlobalIncomingCallInner } from '../App';",
    "import IncomingCallBanner from './IncomingCallBanner';"
)
c = c.replace(
    "        <GlobalIncomingCallInner />",
    "        <IncomingCallBanner />"
)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/PhoneFrame.tsx', 'wb').write(out.encode('utf-8'))
print("PhoneFrame updated")
