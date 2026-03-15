# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

import re
# Replace everything between {showCallUI && ( ... )} in the AnimatePresence
OLD = r'(\{showCallUI && \()[\s\S]*?(\)\})\s*\n\s*</AnimatePresence>'

NEW = '''{showCallUI && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute inset-0 z-50 flex flex-col"
            style={{ background: 'linear-gradient(160deg, #0d1f1a 0%, #061210 55%, #0a0d1a 100%)' }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
              <div className="text-[12px] uppercase tracking-widest" style={{ color: 'rgba(62,207,178,0.6)' }}>
                Lala Kenya
              </div>
              <div className="text-[12px] px-3 py-1 rounded-full" style={{ background: 'rgba(62,207,178,0.1)', color: '#3ECFB2' }}>
                {callType === 'video' ? 'Video' : 'Voice'} call
              </div>
            </div>
            {/* Center - avatar + name */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-8">
                {callState === 'calling' && [1,2,3].map(i => (
                  <motion.div key={i}
                    className="absolute rounded-full"
                    style={{ border: '1px solid rgba(62,207,178,0.25)', top: -i*22, left: -i*22, right: -i*22, bottom: -i*22 }}
                    animate={{ opacity: [0.5, 0], scale: [1, 1.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  />
                ))}
                <div className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1a3330, #0d1f1a)', border: callState === 'connected' ? '2px solid #3ECFB2' : '2px solid rgba(62,207,178,0.3)', boxShadow: callState === 'connected' ? '0 0 40px rgba(62,207,178,0.15)' : 'none', fontSize: 52 }}>
                  &#128100;
                </div>
              </div>
              <div className="text-[26px] mb-1" style={{ color: 'white', fontWeight: 800 }}>
                {callStatus.participantName || ''}
              </div>
              <motion.div
                animate={callState === 'calling' ? { opacity: [0.4, 1, 0.4] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[15px] mb-3"
                style={{ color: callState === 'connected' ? '#3ECFB2' : 'rgba(255,255,255,0.45)' }}>
                {callState === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') : formatCallDuration(callStatus.duration)}
              </motion.div>
              {callState === 'connected' && (
                <div className="text-[11px] px-3 py-1 rounded-full" style={{ background: 'rgba(62,207,178,0.1)', color: '#3ECFB2', border: '1px solid rgba(62,207,178,0.2)' }}>
                  Connected
                </div>
              )}
            </div>
            {/* Controls */}
            <div className="pb-14 px-8">
              <div className="flex items-center justify-center gap-6 mb-8">
                <button onClick={() => setIsMuted(m => !m)}
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1"
                  style={{ background: isMuted ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill={isMuted ? '#000' : 'white'}/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill={isMuted ? '#000' : 'white'}/>
                  </svg>
                  <span style={{ fontSize: 9, color: isMuted ? '#000' : 'rgba(255,255,255,0.6)' }}>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button onClick={handleEndCall}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: '#dc2626', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}>
                  <PhoneOff size={26} color="white" />
                </button>
                <button onClick={() => setIsSpeaker(s => !s)}
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1"
                  style={{ background: isSpeaker ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" fill={isSpeaker ? '#000' : 'white'}/>
                  </svg>
                  <span style={{ fontSize: 9, color: isSpeaker ? '#000' : 'rgba(255,255,255,0.6)' }}>Speaker</span>
                </button>
              </div>
              {callType === 'video' && (
                <div className="flex justify-center">
                  <button onClick={() => setIsVideoOff(v => !v)}
                    className="w-12 h-12 rounded-full flex flex-col items-center justify-center gap-1"
                    style={{ background: isVideoOff ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.08)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill={isVideoOff ? '#000' : 'white'}/>
                    </svg>
                    <span style={{ fontSize: 9, color: isVideoOff ? '#000' : 'rgba(255,255,255,0.6)' }}>Camera</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
</AnimatePresence>'''

c = re.sub(OLD, NEW, c, flags=re.DOTALL)

# Update video button to start video call
c = c.replace(
    "title={activeConversation?.participantPhone ? 'Video call' : 'Video call not available'}",
    "onClick={() => handleStartCall('video')} title={activeConversation?.participantPhone ? 'Video call' : 'Video call not available'}"
)

print("Done" if "callState === 'calling'" in c else "FAILED - pattern not matched")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
