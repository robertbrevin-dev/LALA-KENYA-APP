# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Move Fallback poll BEFORE the early return
fallback = """  // Fallback poll: check call status every 2s
  useEffect(() => {
    if (callState !== 'calling' || !callStatus.callId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('calls').select('call_status').eq('id', callStatus.callId).maybeSingle();
      if (data?.call_status === 'accepted') setCallState('connected');
      if (data?.call_status === 'rejected' || data?.call_status === 'ended') { setCallState('calling'); endCall(); }
    }, 2000);
    return () => clearInterval(interval);
  }, [callState, callStatus.callId]);"""

# Remove from current location
c = c.replace(fallback + "\n", "")

# Add timer useEffect + fallback poll before early return
insert_before = "  if (!activeConversation) {"
timer_and_poll = """  // Timer counts when connected
  useEffect(() => {
    if (callState !== 'connected') { setLocalDuration(0); return; }
    const t = setInterval(() => setLocalDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  // Fallback poll: check call status every 2s
  useEffect(() => {
    if (callState !== 'calling' || !callStatus.callId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('calls').select('call_status').eq('id', callStatus.callId).maybeSingle();
      if (data?.call_status === 'accepted') setCallState('connected');
      if (data?.call_status === 'rejected' || data?.call_status === 'ended') { setCallState('calling'); endCall(); }
    }, 2000);
    return () => clearInterval(interval);
  }, [callState, callStatus.callId]);

"""

if "Timer counts when connected" not in c:
    c = c.replace(insert_before, timer_and_poll + insert_before)

# Fix handleEndCall to reset state
c = c.replace(
    "  const handleEndCall = () => {\n    if (localStream) { localStream.getTracks().forEach(t => t.stop()); setLocalStream(null); }\n    endCall();",
    "  const handleEndCall = () => {\n    setLocalDuration(0);\n    setCallState('calling');\n    if (localStream) { localStream.getTracks().forEach(t => t.stop()); setLocalStream(null); }\n    endCall();"
)

# Fix duration display
c = c.replace(
    "formatCallDuration(callStatus.duration)",
    "formatCallDuration(localDuration)"
)

print("Done" if "Timer counts when connected" in c and "localDuration" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
