# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Update startCall to add WebRTC offer
c = c.replace(
    "    setCallStatus({ active: true, conversationId, participantName, duration: 0, callId: callRow?.id, callType });",
    """    setCallStatus({ active: true, conversationId, participantName, duration: 0, callId: callRow?.id, callType });
    if (callRow?.id && receiverId) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        const peer = createPeer();
        peerRef.current = peer;
        stream.getTracks().forEach(t => peer.addTrack(t, stream));
        peer.onicecandidate = async (e) => {
          if (e.candidate) await supabase.from('call_ice_candidates').insert({ call_id: callRow.id, user_id: currentUser.id, candidate: e.candidate.toJSON() });
        };
        peer.ontrack = (e) => { const a = document.getElementById('remote-audio') as HTMLAudioElement; if (a) { a.srcObject = e.streams[0]; a.play().catch(()=>{}); } };
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        await supabase.from('calls').update({ sdp_offer: JSON.stringify(offer) }).eq('id', callRow.id);
      } catch(err) { console.error('WebRTC offer error:', err); }
    }"""
)

# Update acceptCall with WebRTC answer
c = c.replace(
    "  const acceptCall = async (call: any) => {\n    await supabase.from('calls').update({ call_status: 'accepted' }).eq('id', call.id);",
    """  const acceptCall = async (call: any) => {"""
)

# Find and replace full acceptCall
if "WebRTC answer" not in c:
    c = c.replace(
        "  const acceptCall = async (call: any) => {",
        """  const acceptCall = async (call: any) => {
    setCallStatus({ active: true, conversationId: call.conversation_id, participantName: call.caller_name || 'Caller', duration: 0, callId: call.id, callType: call.call_type });
    setCallConnected(true);
    setIncomingCall(null);
    try {
      const { data: callData } = await supabase.from('calls').select('sdp_offer').eq('id', call.id).maybeSingle();
      await supabase.from('calls').update({ call_status: 'accepted' }).eq('id', call.id);
      if (callData?.sdp_offer) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        const peer = createPeer();
        peerRef.current = peer;
        stream.getTracks().forEach(t => peer.addTrack(t, stream));
        peer.onicecandidate = async (e) => {
          if (e.candidate) await supabase.from('call_ice_candidates').insert({ call_id: call.id, user_id: currentUser?.id, candidate: e.candidate.toJSON() });
        };
        peer.ontrack = (e) => { const a = document.getElementById('remote-audio') as HTMLAudioElement; if (a) { a.srcObject = e.streams[0]; a.play().catch(()=>{}); } };
        await peer.setRemoteDescription(new RTCSessionDescription(JSON.parse(callData.sdp_offer)));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await supabase.from('calls').update({ sdp_answer: JSON.stringify(answer) }).eq('id', call.id);
        const { data: cands } = await supabase.from('call_ice_candidates').select('*').eq('call_id', call.id).neq('user_id', currentUser?.id);
        for (const cand of cands || []) { try { await peer.addIceCandidate(new RTCIceCandidate(cand.candidate)); } catch(e) {} }
      }
    } catch(err) { console.error('WebRTC answer error:', err); }
    // WEBRTC_ACCEPT_END"""
    )

# Update endCall with WebRTC cleanup
c = c.replace(
    "  const endCall = async () => {",
    """  const endCall = async () => {
    setCallConnected(false);
    cleanupWebRTC();"""
)

# Update exports
c = c.replace(
    "      callStatus, incomingCall, loading, toggleFavorite, refreshUser, addBooking, sendMessage,",
    "      callStatus, callConnected, incomingCall, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, loading, toggleFavorite, refreshUser, addBooking, sendMessage,"
)

print("Step3:", "WebRTC offer" in c and "callConnected" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved step3")
