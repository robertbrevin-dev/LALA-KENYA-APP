# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# 1. Add local duration state + timer after callState useState
c = c.replace(
    "  const [callState, setCallState] = useState('calling');",
    "  const [callState, setCallState] = useState('calling');\n  const [localDuration, setLocalDuration] = useState(0);"
)

# 2. Add timer useEffect after the sync useEffect
c = c.replace(
    "  // Auto missed call after 30s if no answer",
    """  // Timer: count up when connected
  useEffect(() => {
    if (callState !== 'connected') { setLocalDuration(0); return; }
    const t = setInterval(() => setLocalDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  // Auto missed call after 30s if no answer"""
)

# 3. Use localDuration instead of callStatus.duration
c = c.replace(
    "{callState === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') : formatCallDuration(callStatus.duration)}",
    "{callState === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') : formatCallDuration(localDuration)}"
)

# 4. Reset duration on end call
c = c.replace(
    "  const handleEndCall = () => {\n    endCall();",
    "  const handleEndCall = () => {\n    setLocalDuration(0);\n    setCallState('calling');\n    endCall();"
)

# 5. Host accept inside conversation also sets connected + resets duration
c = c.replace(
    "acceptCall(incomingCall); setCallState('connected'); setCallType(incomingCall.call_type || 'audio');",
    "acceptCall(incomingCall); setCallState('connected'); setLocalDuration(0); setCallType(incomingCall.call_type || 'audio');"
)

print("Done" if "localDuration" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
