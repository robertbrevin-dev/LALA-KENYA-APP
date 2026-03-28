# -*- coding: utf-8 -*-

# Fix IncomingCallBanner - use hash navigation instead of full reload
banner = '''import { useApp } from '../context/AppContext';
import { Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function IncomingCallBanner() {
  const { incomingCall, acceptCall, rejectCall } = useApp();
  if (!incomingCall) return null;

  const handleAccept = () => {
    acceptCall(incomingCall);
  };

  return (
    <AnimatePresence>
      <motion.div key="incoming-banner" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
        style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, zIndex: 99999, background: 'linear-gradient(135deg, #0d2a1f, #061a10)', borderBottom: '1px solid rgba(62,207,178,0.3)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', borderRadius: '0 0 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(62,207,178,0.15)', border: '2px solid rgba(62,207,178,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>&#128100;</div>
          <div>
            <div style={{ color: 'rgba(62,207,178,0.9)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Incoming {incomingCall.call_type === 'video' ? 'Video' : 'Voice'} Call</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{incomingCall.caller_name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => rejectCall(incomingCall)} style={{ width: 42, height: 42, borderRadius: '50%', background: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PhoneOff size={18} color="white" /></button>
          <button onClick={handleAccept} style={{ width: 42, height: 42, borderRadius: '50%', background: '#16a34a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} color="white" /></button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
'''
with open('src/app/components/IncomingCallBanner.tsx', 'w', encoding='utf-8') as f:
    f.write(banner)
print("Banner fixed")

# Fix Conversation.tsx - when callStatus.active + callConnected -> show call UI immediately
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix accept button inside conversation page
c = c.replace(
    "acceptCall(incomingCall); setCallState('connected'); setCallType(incomingCall.call_type || 'audio');",
    "acceptCall(incomingCall); setCallState('connected'); setLocalDuration(0); setCallType(incomingCall.call_type || 'audio');"
)

# When callStatus becomes active and callConnected = true, show call UI
c = c.replace(
    "  useEffect(() => {\n    setShowCallUI(callStatus.active && callStatus.conversationId === id);\n  }, [callStatus.active, callStatus.conversationId, id]);",
    """  useEffect(() => {
    setShowCallUI(callStatus.active && callStatus.conversationId === id);
    if (callStatus.active && callStatus.conversationId === id && callConnected) {
      setCallState('connected');
    }
  }, [callStatus.active, callStatus.conversationId, id, callConnected]);"""
)

print("Conversation fixed:", "callConnected" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
