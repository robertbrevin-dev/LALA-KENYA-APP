# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

OLD = "const startCall = (conversationId: string, participantName: string, participantPhone?: string) => {\n\n\n\n    // If phone number is available, redirect to phone dialer\n\n\n\n    if (participantPhone) {\n\n\n\n      window.location.href = `tel:${participantPhone}`;\n\n\n\n    } else {\n\n\n\n      // Fallback to in-app call simulation if no phone number\n\n\n\n      setCallStatus({ active: true, conversationId, participantName, duration: 0 });\n\n\n\n    }\n\n\n\n  };"

NEW = """const startCall = async (conversationId: string, participantName: string, participantPhone?: string, receiverId?: string, callType: string = 'audio') => {
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
  const acceptCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'accepted' }).eq('id', call.id);
    setCallStatus({ active: true, conversationId: call.conversation_id, participantName: call.caller_name || 'Caller', duration: 0, callId: call.id, callType: call.call_type });
    setIncomingCall(null);
  };
  const rejectCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'rejected', ended_at: new Date().toISOString() }).eq('id', call.id);
    setIncomingCall(null);
  };
  const endCall = async () => {
    if (callStatus.callId) {
      await supabase.from('calls').update({ call_status: 'ended', ended_at: new Date().toISOString() }).eq('id', callStatus.callId);
    }
    setCallStatus({ active: false });
  };"""

if OLD in c:
    c = c.replace(OLD, NEW)
    print("Replaced OK")
else:
    print("NOT FOUND")

print("acceptCall present:", "const acceptCall" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
