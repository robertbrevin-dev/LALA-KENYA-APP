# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# 1. Add incomingCall state after callStatus state
c = c.replace(
    "  const [callStatus, setCallStatus] = useState<CallStatus>({ active: false });",
    "  const [callStatus, setCallStatus] = useState<CallStatus>({ active: false });\n  const [incomingCall, setIncomingCall] = useState<any>(null);"
)

# 2. Replace startCall with real Supabase version
c = c.replace(
    "  const startCall = (conversationId: string, participantName: string, participantPhone?: string) => {\n    // If phone number is available, redirect to phone dialer\n    if (participantPhone) {\n      window.location.href = `tel:${participantPhone}`;\n    } else {\n      // Fallback to in-app call simulation if no phone number\n      setCallStatus({ active: true, conversationId, participantName, duration: 0 });\n    }\n  };\n  const endCall = () => setCallStatus({ active: false });",
    """  const startCall = async (conversationId: string, participantName: string, participantPhone?: string, receiverId?: string, callType: string = 'audio') => {
    if (!currentUser) return;
    const { data: callRow } = await supabase.from('calls').insert({
      conversation_id: conversationId,
      caller_id: currentUser.id,
      receiver_id: receiverId,
      call_type: callType,
      call_status: 'ringing',
      started_at: new Date().toISOString(),
    }).select().single();
    setCallStatus({ active: true, conversationId, participantName, duration: 0, callId: callRow?.id, callType });
  };
  const endCall = async () => {
    if (callStatus.callId) {
      await supabase.from('calls').update({ call_status: 'ended', ended_at: new Date().toISOString() }).eq('id', callStatus.callId);
    }
    setCallStatus({ active: false });
  };
  const acceptCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'accepted' }).eq('id', call.id);
    setCallStatus({ active: true, conversationId: call.conversation_id, participantName: call.caller_name || 'Caller', duration: 0, callId: call.id, callType: call.call_type });
    setIncomingCall(null);
  };
  const rejectCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'rejected', ended_at: new Date().toISOString() }).eq('id', call.id);
    setIncomingCall(null);
  };"""
)

# 3. Add realtime listener for incoming calls - add after the existing useEffect for conversations
c = c.replace(
    "  const endCall = () => setCallStatus({ active: false });",
    ""
)

# 4. Add incomingCall listener useEffect before the return
c = c.replace(
    "      callStatus, loading, toggleFavorite, refreshUser, addBooking, sendMessage,",
    "      callStatus, incomingCall, loading, toggleFavorite, refreshUser, addBooking, sendMessage,"
)
c = c.replace(
    "      sendSimulatedMessage, createConversation, startCall, endCall,",
    "      sendSimulatedMessage, createConversation, startCall, endCall, acceptCall, rejectCall,"
)

print("Done" if "acceptCall" in c and "incomingCall" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
