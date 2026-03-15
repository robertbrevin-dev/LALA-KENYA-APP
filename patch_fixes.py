# -*- coding: utf-8 -*-

# 1. Fix CallStatus type
with open('src/app/types/index.ts', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace(
    "export interface CallStatus {\n  active: boolean;\n  conversationId?: string;\n  participantName?: string;\n  duration?: number;\n}",
    "export interface CallStatus {\n  active: boolean;\n  conversationId?: string;\n  participantName?: string;\n  duration?: number;\n  callId?: string;\n  callType?: string;\n}"
)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/types/index.ts', 'wb').write(out.encode('utf-8'))
print("types fixed")

# 2. Add acceptCall/rejectCall to AppContext
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Check if they exist
if 'const acceptCall' not in c:
    c = c.replace(
        "  const endCall = async () => {",
        """  const acceptCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'accepted' }).eq('id', call.id);
    setCallStatus({ active: true, conversationId: call.conversation_id, participantName: call.caller_name || 'Caller', duration: 0, callId: call.id, callType: call.call_type });
    setIncomingCall(null);
  };
  const rejectCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'rejected', ended_at: new Date().toISOString() }).eq('id', call.id);
    setIncomingCall(null);
  };
  const endCall = async () => {"""
    )
    print("acceptCall/rejectCall added")
else:
    print("acceptCall already exists")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("AppContext saved")
