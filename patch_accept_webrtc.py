# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    """  const acceptCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'accepted' }).eq('id', call.id);
    setCallStatus({ active: true, conversationId: call.conversation_id, participantName: call.caller_name || 'Caller', duration: 0, callId: call.id, callType: call.call_type });
    setIncomingCall(null);
  };""",
    """  const acceptCall = async (call: any) => {
    setCallStatus({ active: true, conversationId: call.conversation_id, participantName: call.caller_name || 'Caller', duration: 0, callId: call.id, callType: call.call_type });
    setCallConnected(true);
    setIncomingCall(null);
    try {
      const { data: callData } = await supabase.from('calls').select('sdp_offer').eq('id', call.id).maybeSingle();
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
        await supabase.from('calls').update({ sdp_answer: JSON.stringify(answer), call_status: 'accepted' }).eq('id', call.id);
        const { data: cands } = await supabase.from('call_ice_candidates').select('*').eq('call_id', call.id).neq('user_id', currentUser?.id);
        for (const cand of cands || []) { try { await peer.addIceCandidate(new RTCIceCandidate(cand.candidate)); } catch(e) {} }
      }
    } catch(err) { console.error('WebRTC answer error:', err); }
  };"""
)

print("Done" if "WebRTC answer error" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
