# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace(
    "  const [showCallUI, setShowCallUI] = useState(false);",
    "  const [showCallUI, setShowCallUI] = useState(false);\n  const [callType, setCallType] = useState('audio');\n  const [isMuted, setIsMuted] = useState(false);\n  const [isSpeaker, setIsSpeaker] = useState(false);\n  const [isVideoOff, setIsVideoOff] = useState(false);\n  const [callState, setCallState] = useState('calling');"
)
c = c.replace(
    "  const handleStartCall = () => {\n    startCall(activeConversation?.id ?? \"\", activeConversation?.participantName, activeConversation?.participantPhone);\n  };",
    "  const handleStartCall = (type = 'audio') => {\n    setCallType(type); setIsMuted(false); setIsSpeaker(false); setIsVideoOff(false); setCallState('calling');\n    setTimeout(() => setCallState('connected'), 3000);\n    startCall(activeConversation?.id ?? \"\", activeConversation?.participantName, activeConversation?.participantPhone);\n  };"
)
c = c.replace("onClick={handleStartCall}", "onClick={() => handleStartCall('audio')}")
print("Done" if "callState" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved - state vars added")
