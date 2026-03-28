# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# 1. Add callConnected to destructuring
c = c.replace(
    "const { conversations, currentUser, sendMessage, sendSimulatedMessage, markMessagesAsRead, callStatus, incomingCall, startCall, endCall, acceptCall, rejectCall } = appContext;",
    "const { conversations, currentUser, sendMessage, sendSimulatedMessage, markMessagesAsRead, callStatus, callConnected, incomingCall, startCall, endCall, acceptCall, rejectCall } = appContext;"
)

# 2. Add localDuration state
if "localDuration" not in c:
    c = c.replace(
        "  const [callState, setCallState] = useState('calling');",
        "  const [callState, setCallState] = useState('calling');\n  const [localDuration, setLocalDuration] = useState(0);"
    )

# 3. Fix sync to use callConnected
c = c.replace(
    "  }, [callStatus.active, (callStatus as any).connected]);",
    "  }, [callStatus.active, (callStatus as any).connected, callConnected]);"
)

c = c.replace(
    "    } else if ((callStatus as any).connected) {\n      setCallState('connected');",
    "    } else if ((callStatus as any).connected || callConnected) {\n      setCallState('connected');"
)

# 4. Add timer useEffect
if "localDuration" in c and "setInterval" not in c:
    c = c.replace(
        "  // Sync callState from realtime AppContext updates",
        """  // Timer counts up when connected
  useEffect(() => {
    if (callState !== 'connected') { setLocalDuration(0); return; }
    const t = setInterval(() => setLocalDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  // Sync callState from realtime AppContext updates"""
    )

# 5. Fix duration display
c = c.replace(
    "{callState === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') : formatCallDuration(callStatus.duration)}",
    "{callState === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') : formatCallDuration(localDuration)}"
)

# 6. Fix handleEndCall to reset
if "handleEndCall" in c:
    c = c.replace(
        "  const handleEndCall = () => {\n    endCall();",
        "  const handleEndCall = () => {\n    setLocalDuration(0);\n    setCallState('calling');\n    endCall();"
    )

# 7. Add fallback poll when calling
if "Fallback poll" not in c:
    c = c.replace(
        "  const handleEndCall = () => {",
        """  // Fallback poll: check call status every 2s
  useEffect(() => {
    if (callState !== 'calling' || !callStatus.callId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('calls').select('call_status').eq('id', callStatus.callId).maybeSingle();
      if (data?.call_status === 'accepted') setCallState('connected');
      if (data?.call_status === 'rejected' || data?.call_status === 'ended') { setCallState('calling'); endCall(); }
    }, 2000);
    return () => clearInterval(interval);
  }, [callState, callStatus.callId]);

  const handleEndCall = () => {"""
    )

print("Done" if "localDuration" in c and "Fallback poll" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
