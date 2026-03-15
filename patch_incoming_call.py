# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# 1. Add acceptCall/rejectCall/incomingCall to destructuring
c = c.replace(
    "  const { conversations, currentUser, sendMessage, sendSimulatedMessage, markMessagesAsRead, callStatus, startCall, endCall } = appContext;",
    "  const { conversations, currentUser, sendMessage, sendSimulatedMessage, markMessagesAsRead, callStatus, incomingCall, startCall, endCall, acceptCall, rejectCall } = appContext;"
)

# 2. Update handleStartCall to pass receiverId and callType
c = c.replace(
    "  const handleStartCall = (type = 'audio') => {\n    setCallType(type); setIsMuted(false); setIsSpeaker(false); setIsVideoOff(false); setCallState('calling');\n    setTimeout(() => setCallState('connected'), 3000);\n    startCall(activeConversation?.id ?? \"\", activeConversation?.participantName, activeConversation?.participantPhone);\n  };",
    "  const handleStartCall = (type = 'audio') => {\n    setCallType(type); setIsMuted(false); setIsSpeaker(false); setIsVideoOff(false); setCallState('calling');\n    setTimeout(() => setCallState('connected'), 3000);\n    const receiverId = currentUser?.role === 'guest' ? (remoteConv?.host_id) : (remoteConv?.guest_id);\n    startCall(activeConversation?.id ?? \"\", activeConversation?.participantName || otherUserName, activeConversation?.participantPhone, receiverId, type);\n  };"
)

# 3. Add incoming call UI just before closing PhoneFrame - after BottomNav
c = c.replace(
    "    </PhoneFrame>\n  );\n}",
    """      {/* Incoming Call UI */}
      {incomingCall && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #0d1f1a 0%, #061210 55%, #0a0d1a 100%)' }}>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #1a3330, #0d1f1a)', border: '2px solid rgba(62,207,178,0.4)', fontSize: 52 }}>
              &#128100;
            </div>
            <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'rgba(62,207,178,0.6)' }}>
              Incoming {incomingCall.call_type === 'video' ? 'Video' : 'Voice'} Call
            </div>
            <div className="text-[26px] mb-1" style={{ color: 'white', fontWeight: 800 }}>
              {incomingCall.caller_name}
            </div>
            <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Lala Kenya call</div>
          </div>
          <div className="flex items-center justify-center gap-16 pb-16">
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => rejectCall(incomingCall)}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#dc2626', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}>
                <PhoneOff size={26} color="white" />
              </button>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => { acceptCall(incomingCall); setCallState('connected'); setCallType(incomingCall.call_type || 'audio'); }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#16a34a', boxShadow: '0 8px 32px rgba(22,163,74,0.45)' }}>
                <Phone size={26} color="white" />
              </button>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Accept</span>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}"""
)

print("Done" if "acceptCall" in c and "incomingCall" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
