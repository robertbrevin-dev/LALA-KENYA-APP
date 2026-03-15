# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Sync local callState from AppContext callStatus
c = c.replace(
    "  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id, activeConversation?.participantId]);",
    """  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id, activeConversation?.participantId]);

  // Sync callState from realtime AppContext updates
  useEffect(() => {
    if (!callStatus.active) {
      setCallState('calling'); // reset
    } else if ((callStatus as any).callState === 'connected') {
      setCallState('connected');
    }
  }, [callStatus.active, (callStatus as any).callState]);

  // Auto missed call after 30s if no answer
  useEffect(() => {
    if (callState !== 'calling' || !callStatus.active) return;
    const timer = setTimeout(() => {
      handleEndCall();
      // TODO: save missed call message
    }, 30000);
    return () => clearTimeout(timer);
  }, [callState, callStatus.active]);"""
)

print("Done" if "Auto missed call" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
