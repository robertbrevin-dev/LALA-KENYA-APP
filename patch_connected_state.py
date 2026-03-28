# -*- coding: utf-8 -*-

# Fix AppContext - add separate callConnected state
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add callConnected state near callStatus
c = c.replace(
    "  const [callStatus, setCallStatus] = useState<CallStatus>({ active: false });",
    "  const [callStatus, setCallStatus] = useState<CallStatus>({ active: false });\n  const [callConnected, setCallConnected] = useState(false);"
)

# Set callConnected when accepted
c = c.replace(
    "        if (payload.new.call_status === 'accepted') {\n          setCallStatus(prev => ({ ...prev, active: true, connected: true }));\n        }",
    "        if (payload.new.call_status === 'accepted') {\n          setCallStatus(prev => ({ ...prev, active: true }));\n          setCallConnected(true);\n        }"
)

# Reset callConnected when call ends
c = c.replace(
    "        if (payload.new.call_status === 'rejected' || payload.new.call_status === 'ended') {\n          setCallStatus({ active: false });",
    "        if (payload.new.call_status === 'rejected' || payload.new.call_status === 'ended') {\n          setCallStatus({ active: false });\n          setCallConnected(false);"
)

# Also reset on endCall
c = c.replace(
    "  const endCall = async () => {",
    "  const endCall = async () => {\n    setCallConnected(false);"
)

# Export callConnected
c = c.replace(
    "    callStatus, incomingCall, loading,",
    "    callStatus, callConnected, incomingCall, loading,"
)

print("Done" if "callConnected" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved AppContext")

# Fix Conversation.tsx - use callConnected instead
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Import callConnected
c = c.replace(
    "const { conversations, currentUser, sendMessage, sendSimulatedMessage, markMessagesAsRead, callStatus, incomingCall, startCall, endCall, acceptCall, rejectCall } = appContext;",
    "const { conversations, currentUser, sendMessage, sendSimulatedMessage, markMessagesAsRead, callStatus, callConnected, incomingCall, startCall, endCall, acceptCall, rejectCall } = appContext;"
)

# Fix sync useEffect
c = c.replace(
    "  // Sync callState from realtime AppContext updates\n  useEffect(() => {\n    if (!callStatus.active) {\n      setCallState('calling');\n    } else if ((callStatus as any).connected) {\n      setCallState('connected');\n    }\n  }, [callStatus.active, (callStatus as any).connected]);",
    "  // Sync callState from realtime AppContext updates\n  useEffect(() => {\n    if (callConnected) {\n      setCallState('connected');\n    } else if (!callStatus.active) {\n      setCallState('calling');\n    }\n  }, [callConnected, callStatus.active]);"
)

print("Done" if "callConnected" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved Conversation")
