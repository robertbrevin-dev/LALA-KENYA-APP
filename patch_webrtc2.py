# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add ICE candidate listener + answer listener in the realtime useEffect
c = c.replace(
    "        if (payload.new.call_status === 'accepted') {\n          setCallStatus(prev => ({ ...prev, active: true, connected: true }));\n        }",
    """        if (payload.new.call_status === 'accepted') {
          setCallStatus(prev => ({ ...prev, active: true, connected: true }));
          // WebRTC: caller applies answer
          if (peerRef.current && payload.new.sdp_answer) {
            try {
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(payload.new.sdp_answer)));
              // Apply ICE candidates
              const { data: cands } = await supabase.from('call_ice_candidates').select('*').eq('call_id', payload.new.id).neq('user_id', currentUser.id);
              for (const cand of cands || []) {
                try { await peerRef.current.addIceCandidate(new RTCIceCandidate(cand.candidate)); } catch(e) {}
              }
            } catch(err) { console.error('Apply answer error:', err); }
          }
        }"""
)

# Add ICE candidate realtime listener
c = c.replace(
    "      .on('postgres_changes', {\n        event: 'UPDATE', schema: 'public', table: 'calls',\n        filter: 'caller_id=eq.' + currentUser.id",
    """      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'call_ice_candidates',
        filter: 'user_id=neq.' + currentUser.id
      }, async (payload) => {
        if (peerRef.current && payload.new.candidate) {
          try { await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.new.candidate)); } catch(e) {}
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'calls',
        filter: 'caller_id=eq.' + currentUser.id"""
)

print("Done" if "call_ice_candidates" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
