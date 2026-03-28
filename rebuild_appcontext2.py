# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add notifications + calls realtime after the first useEffect closing
# Find the incoming calls subscription and update it
old_sub = "    const sub = supabase.channel('incoming-calls-' + currentUser.id)"
if old_sub in c:
    # Update the existing realtime to add callConnected + ice candidates
    c = c.replace(
        "        if (payload.new.call_status === 'accepted') {\n          setCallStatus(prev => ({ ...prev, active: true }));\n        }",
        """        if (payload.new.call_status === 'accepted') {
          setCallStatus(prev => ({ ...prev, active: true }));
          setCallConnected(true);
          if (peerRef.current && payload.new.sdp_answer) {
            try {
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(payload.new.sdp_answer)));
              const { data: cands } = await supabase.from('call_ice_candidates').select('*').eq('call_id', payload.new.id).neq('user_id', currentUser.id);
              for (const cand of cands || []) { try { await peerRef.current.addIceCandidate(new RTCIceCandidate(cand.candidate)); } catch(e) {} }
            } catch(err) { console.error('Apply answer error:', err); }
          }
        }"""
    )
    c = c.replace(
        "        if (payload.new.call_status === 'rejected') {\n          setCallStatus({ active: false });\n        }",
        """        if (payload.new.call_status === 'rejected' || payload.new.call_status === 'ended') {
          setCallStatus({ active: false });
          setCallConnected(false);
          cleanupWebRTC();
        }"""
    )

# Add notifications + auto-expire useEffect after the realtime one
notif_effect = """
  useEffect(() => {
    if (!currentUser?.id) return;
    supabase.from('notifications').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setNotifications(data); });
    const sub = supabase.channel('notifications-' + currentUser.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + currentUser.id },
        (payload) => { setNotifications(prev => [payload.new, ...prev]); })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const autoExpire = async () => {
      await supabase.from('bookings').update({ booking_status: 'expired' }).eq('booking_status', 'inquiry').lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      await supabase.from('bookings').update({ booking_status: 'expired' }).eq('booking_status', 'accepted').lt('updated_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());
    };
    autoExpire();
    const t = setInterval(autoExpire, 60000);
    return () => clearInterval(t);
  }, [currentUser?.id]);
"""

# Add after the realtime useEffect
if "notifications-'" not in c:
    c = c.replace(
        "  }, [currentUser?.id]);",
        "  }, [currentUser?.id]);" + notif_effect,
        1
    )

print("Step2:", "notifications-'" in c and "autoExpire" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved step2")
