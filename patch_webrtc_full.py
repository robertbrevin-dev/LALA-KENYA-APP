# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# 1. Add React import if needed
if "import React" not in c:
    c = c.replace("import {", "import React, {", 1)

# 2. Add peerRef and helpers after callConnected
c = c.replace(
    "  const [callConnected, setCallConnected] = useState(false);",
    """  const [callConnected, setCallConnected] = useState(false);
  const peerRef = React.useRef<RTCPeerConnection | null>(null);
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const createPeer = () => new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] });
  const cleanupWebRTC = () => {
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
  };"""
)
print("1:", "createPeer" in c)

# 3. Update startCall - add WebRTC offer after setCallStatus
c = c.replace(
    "    setCallStatus({ active: true, conversationId, participantName, duration: 0, callId: callRow?.id, callType });\n  };",
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
    }
  };"""
)
print("2:", "sdp_offer" in c)

# 4. Update acceptCall - add WebRTC answer
c = c.replace(
    "    setCallConnected(true);\n    setIncomingCall(null);\n  };",
    """    setCallConnected(true);
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
        await supabase.from('calls').update({ sdp_answer: JSON.stringify(answer) }).eq('id', call.id);
        const { data: cands } = await supabase.from('call_ice_candidates').select('*').eq('call_id', call.id).neq('user_id', currentUser?.id);
        for (const cand of (cands || [])) { try { await peer.addIceCandidate(new RTCIceCandidate(cand.candidate)); } catch(e) {} }
      }
    } catch(err) { console.error('WebRTC answer error:', err); }
  };"""
)
print("3:", "sdp_answer" in c)

# 5. Update endCall - add cleanup
c = c.replace(
    "  const endCall = async () => {\n    setCallConnected(false);",
    "  const endCall = async () => {\n    setCallConnected(false);\n    cleanupWebRTC();"
)
print("4:", "cleanupWebRTC" in c)

# 6. Add answer listener in realtime (caller side)
c = c.replace(
    "        if (payload.new.call_status === 'accepted') {\n          setCallStatus(prev => ({ ...prev, active: true, connected: true }));",
    """        if (payload.new.call_status === 'accepted') {
          setCallStatus(prev => ({ ...prev, active: true, connected: true }));
          if (peerRef.current && payload.new.sdp_answer) {
            try {
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(payload.new.sdp_answer)));
              const { data: cands } = await supabase.from('call_ice_candidates').select('*').eq('call_id', payload.new.id).neq('user_id', currentUser.id);
              for (const cand of (cands || [])) { try { await peerRef.current.addIceCandidate(new RTCIceCandidate(cand.candidate)); } catch(e) {} }
            } catch(err) { console.error('Apply answer error:', err); }
          }"""
)
print("5:", "Apply answer error" in c)

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
