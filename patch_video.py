# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add video ref after state vars
c = c.replace(
    "  const [callState, setCallState] = useState('calling');",
    "  const [callState, setCallState] = useState('calling');\n  const localVideoRef = React.useRef<HTMLVideoElement>(null);\n  const [localStream, setLocalStream] = React.useState<MediaStream|null>(null);"
)

# Start camera when video call begins
c = c.replace(
    "    startCall(activeConversation?.id ?? \"\", callerName, activeConversation?.participantPhone, receiverId, type);",
    """    startCall(activeConversation?.id ?? "", callerName, activeConversation?.participantPhone, receiverId, type);
    if (type === 'video') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }).catch(err => console.error('Camera error:', err));
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => console.error('Mic error:', err));
    }"""
)

# Stop camera on end call
c = c.replace(
    "  const handleEndCall = () => {\n    endCall();\n  };",
    "  const handleEndCall = () => {\n    if (localStream) { localStream.getTracks().forEach(t => t.stop()); setLocalStream(null); }\n    endCall();\n  };"
)

# Replace video placeholder with real video element
c = c.replace(
    """            {callType === 'video' && callState === 'connected' && (
              <div className="absolute top-16 right-4 w-24 h-32 rounded-[12px] flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 24 }}>
                &#9654;
              </div>
            )}""",
    """            {callType === 'video' && (
              <video ref={localVideoRef} autoPlay muted playsInline
                className="absolute top-16 right-4 w-24 h-32 rounded-[12px] object-cover"
                style={{ border: '1px solid rgba(255,255,255,0.2)', display: isVideoOff ? 'none' : 'block' }} />
            )}"""
)

print("Done" if "localVideoRef" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
