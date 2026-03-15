with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

old_btn = "property.instantBook ? '\u26a1 Book Instantly' : '\U0001f4e9 Request to Book'"
new_btn = "'Inquire'"
if old_btn in c:
    c = c.replace(old_btn, new_btn)
    print("Button text replaced")
else:
    c = c.replace("'Request to Book'", "'Inquire'")
    c = c.replace('"Request to Book"', '"Inquire"')
    print("Fallback button replace done")

c = c.replace(
    "onClick={handleBooking}",
    "onClick={() => { if (!currentUser) { navigate('/login'); return; } setInquireError(''); setShowInquireModal(true); }}",
    1
)
print("Button handler replaced" if "setShowInquireModal(true)" in c else "Handler FAILED")

MODAL = """
      {showInquireModal && (
        <div style={{ position:'absolute', inset:0, zIndex:60, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background:'linear-gradient(170deg,#061412,#03020a)', borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', border:'1px solid rgba(62,207,178,0.15)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:2, marginBottom:2 }}>SEND INQUIRY</div>
                <div style={{ fontSize:18, fontWeight:900, color:'white', fontFamily:'var(--font-playfair)' }}>{property.title}</div>
              </div>
              <button onClick={() => setShowInquireModal(false)} style={{ width:34, height:34, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.25)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:16 }}>x</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:1, marginBottom:6 }}>CHECK-IN DATE</div>
                <input type="date" value={checkIn ? format(checkIn,'yyyy-MM-dd') : ''} min={format(addDays(new Date(),1),'yyyy-MM-dd')}
                  onChange={e => setCheckIn(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(62,207,178,0.2)', color:'white', fontSize:13, boxSizing:'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:1, marginBottom:6 }}>CHECK-IN TIME</div>
                <input type="time" value={inquireTime} onChange={e => setInquireTime(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(62,207,178,0.2)', color:'white', fontSize:13, boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:1, marginBottom:6 }}>NIGHTS</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => setInquireNights(n => Math.max(1, n-1))} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.3)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:18, fontWeight:700 }}>-</button>
                  <span style={{ color:'white', fontWeight:700, fontSize:16, minWidth:20, textAlign:'center' }}>{inquireNights}</span>
                  <button onClick={() => setInquireNights(n => n+1)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.3)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:18, fontWeight:700 }}>+</button>
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:1, marginBottom:6 }}>GUESTS</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => setInquireGuests(n => Math.max(1, n-1))} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.3)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:18, fontWeight:700 }}>-</button>
                  <span style={{ color:'white', fontWeight:700, fontSize:16, minWidth:20, textAlign:'center' }}>{inquireGuests}</span>
                  <button onClick={() => setInquireGuests(n => Math.min(property.guests || 10, n+1))} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.3)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:18, fontWeight:700 }}>+</button>
                </div>
              </div>
            </div>
            <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(62,207,178,0.06)', border:'1px solid rgba(62,207,178,0.15)', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Ksh {property.price.toLocaleString()} x {inquireNights} night{inquireNights > 1 ? 's' : ''}</span>
                <span style={{ fontSize:13, color:'white' }}>Ksh {(property.price * inquireNights).toLocaleString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Platform fee (3%)</span>
                <span style={{ fontSize:13, color:'white' }}>Ksh {Math.round(property.price * inquireNights * 0.03).toLocaleString()}</span>
              </div>
              <div style={{ borderTop:'1px solid rgba(62,207,178,0.15)', paddingTop:8, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:14, fontWeight:700, color:'white' }}>Total</span>
                <span style={{ fontSize:14, fontWeight:700, color:'#E8B86D' }}>Ksh {(property.price * inquireNights).toLocaleString()}</span>
              </div>
            </div>
            {!!inquireError && (
              <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.2)', color:'#FF6B6B', fontSize:13, marginBottom:12 }}>{inquireError}</div>
            )}
            {inquireSuccess && (
              <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(62,207,178,0.1)', border:'1px solid rgba(62,207,178,0.2)', color:'#3ECFB2', fontSize:13, marginBottom:12 }}>Inquiry sent! Opening chat...</div>
            )}
            <button disabled={inquireLoading} onClick={handleInquire}
              style={{ width:'100%', padding:'14px', borderRadius:16, border:'none', cursor: inquireLoading ? 'not-allowed' : 'pointer', background: inquireLoading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#E8B86D,#C8843A)', color: inquireLoading ? 'rgba(255,255,255,0.3)' : '#1a0800', fontWeight:800, fontSize:15 }}>
              {inquireLoading ? 'Sending...' : 'Send Inquiry'}
            </button>
          </motion.div>
        </div>
      )}
"""

target = '    </PhoneFrame>\n  );\n}'
if target in c:
    c = c.replace(target, MODAL + target, 1)
    print("Modal added")
else:
    idx = c.rfind('</PhoneFrame>')
    print(f"PhoneFrame not found as expected, last at {idx}")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
