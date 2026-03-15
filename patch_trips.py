with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    """              {/* Contact Host */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <button
                  className="flex items-center gap-2 text-[14px] font-bold"
                  style={{ color: '#E8B86D' }}
                  onClick={() => handleContactHost(booking)} 
                >
                  <MessageCircle size={16} />
                  Contact Host
                </button>""",
    """              {/* Contact Host */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {booking.status === 'inquiry' ? (
                  <div className="flex items-center gap-2 text-[13px]" style={{ color: '#E8B86D' }}>
                    <span className="animate-pulse">⏳</span>
                    Waiting for host to respond...
                  </div>
                ) : booking.status === 'declined' ? (
                  <div className="text-[13px]" style={{ color: '#FF6B6B' }}>
                    ✕ Inquiry declined
                  </div>
                ) : booking.status === 'expired' ? (
                  <div className="text-[13px]" style={{ color: '#FF6B6B' }}>
                    ✕ Inquiry expired
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-2 text-[14px] font-bold"
                    style={{ color: '#E8B86D' }}
                    onClick={() => handleContactHost(booking)}
                  >
                    <MessageCircle size={16} />
                    Contact Host
                  </button>
                )}"""
)

print("Done" if "Waiting for host" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
