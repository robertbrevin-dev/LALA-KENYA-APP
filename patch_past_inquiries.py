with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add state
c = c.replace(
    "  const [history, setHistory] = useState<any[]>([]);",
    "  const [history, setHistory] = useState<any[]>([]);\n  const [pastInquiries, setPastInquiries] = useState<any[]>([]);"
)

# Set state after setHistory
c = c.replace(
    "        setBookings(upcoming);\n        setHistory(past);",
    "        setBookings(upcoming);\n        setHistory(past);\n        setPastInquiries(pastInquiries);"
)

# Add section after history section closing
old_end = """          {history.length > 0 && (
            <div className="mt-6">
              <div
                className="text-[18px] mb-3"
                style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}
              >
                Past Stays
              </div>"""

new_end = """          {pastInquiries.length > 0 && (
            <div className="mt-6">
              <div className="text-[18px] mb-3" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}>
                Past Inquiries
              </div>
              {pastInquiries.map((b, idx) => (
                <motion.div key={`pi-${b.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  className="rounded-[16px] p-4 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,107,107,0.15)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-[15px]" style={{ fontWeight: 700, color: 'var(--lala-white)' }}>{b.propertyTitle}</div>
                      <div className="text-[12px] mt-0.5" style={{ color: 'var(--lala-muted)' }}>{b.checkIn} — {b.checkOut}</div>
                    </div>
                    <div className="text-[11px] px-2 py-1 rounded-full uppercase" style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', fontWeight: 600 }}>
                      {b.status}
                    </div>
                  </div>
                  <div className="text-[13px]" style={{ color: '#FF6B6B' }}>
                    {b.status === 'expired' ? '⏰ Host did not respond in time' : b.status === 'declined' ? '✕ Host declined this inquiry' : '✕ Cancelled'}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {history.length > 0 && (
            <div className="mt-6">
              <div
                className="text-[18px] mb-3"
                style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}
              >
                Past Stays
              </div>"""

c = c.replace(old_end, new_end)

print("Done" if "pastInquiries.length" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
