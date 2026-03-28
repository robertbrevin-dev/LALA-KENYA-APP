# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "        if (payload.new.call_status === 'accepted') {\n          setCallStatus(prev => ({ ...prev, active: true }));\n          setCallConnected(true);\n        }",
    """        if (payload.new.call_status === 'accepted') {
          setCallStatus(prev => ({ ...prev, active: true }));
          setCallConnected(true);
          // Apply SDP answer on caller side
          if (peerRef.current && payload.new.sdp_answer) {
            try {
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(payload.new.sdp_answer)));
              const { data: cands } = await supabase.from('call_ice_candidates').select('*').eq('call_id', payload.new.id).neq('user_id', currentUser.id);
              for (const cand of cands || []) { try { await peerRef.current.addIceCandidate(new RTCIceCandidate(cand.candidate)); } catch(e) {} }
            } catch(err) { console.error('Apply answer error:', err); }
          }
        }"""
)

print("Done" if "Apply answer error" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
