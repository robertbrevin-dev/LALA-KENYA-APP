with open('src/app/pages/HostBookings.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

import re
# Replace the entire pending block with inquiry block
c = re.sub(
    r"\{booking\.booking_status === 'pending' && \(.*?\)\}",
    """{booking.booking_status === 'inquiry' && (
                    <div className="w-full mt-2">
                      <div style={{ textAlign:'center', fontSize:12, color:'#E8B86D', marginBottom:8, fontWeight:600 }}>
                        {countdown[booking.id] !== undefined
                          ? `${Math.floor(countdown[booking.id]/60)}:${String(countdown[booking.id]%60).padStart(2,'0')} to respond`
                          : 'New Inquiry'}
                      </div>
                      <div className="flex gap-2 w-full">
                        <button onClick={() => handleAccept(booking)}
                          className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                          style={{ background: 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 700 }}>
                          Accept
                        </button>
                        <button onClick={() => handleDecline(booking)}
                          className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                          style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', fontWeight: 600 }}>
                          Decline
                        </button>
                      </div>
                    </div>
                  )}""",
    c, flags=re.DOTALL
)

print("Done" if "handleAccept" in c and "booking_status === 'inquiry'" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/HostBookings.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
