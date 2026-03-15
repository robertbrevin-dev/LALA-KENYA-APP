# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const handleStartCall = (type = 'audio') => {\n    setCallType(type); setIsMuted(false); setIsSpeaker(false); setIsVideoOff(false); setCallState('calling');\n    setTimeout(() => setCallState('connected'), 3000);\n    const receiverId = currentUser?.role === 'guest' ? (remoteConv?.host_id) : (remoteConv?.guest_id);\n    startCall(activeConversation?.id ?? \"\", activeConversation?.participantName || otherUserName, activeConversation?.participantPhone, receiverId, type);\n  };",
    """  const handleStartCall = (type = 'audio') => {
    setCallType(type); setIsMuted(false); setIsSpeaker(false); setIsVideoOff(false); setCallState('calling');
    const receiverId = currentUser?.role === 'guest' ? remoteConv?.host_id : remoteConv?.guest_id;
    const callerName = otherUserName || activeConversation?.participantName || '';
    console.log('Starting call - receiverId:', receiverId, 'remoteConv:', remoteConv);
    if (!receiverId) {
      console.error('No receiverId found!');
      return;
    }
    startCall(activeConversation?.id ?? "", callerName, activeConversation?.participantPhone, receiverId, type);
    setTimeout(() => setCallState('connected'), 3000);
  };"""
)

print("Done" if "No receiverId" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
