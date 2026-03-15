with open('src/app/pages/HostBookings.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    """  const statusColor = (status: string) => {
    if (status === 'confirmed') return { bg: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)' };
    if (status === 'in_stay') return { bg: 'rgba(62,207,178,0.2)', color: 'var(--lala-teal)' };
    if (status === 'cancelled') return { bg: 'rgba(255,107,107,0.12)', color: '#FF6B6B' };
    if (status === 'completed') return { bg: 'rgba(62,207,178,0.2)', color: 'var(--lala-teal)' };
    return { bg: 'rgba(232,184,109,0.12)', color: 'var(--lala-gold)' };
  };""",
    """  const statusColor = (status: string) => {
    if (status === 'inquiry') return { bg: 'rgba(232,184,109,0.15)', color: '#E8B86D' };
    if (status === 'accepted') return { bg: 'rgba(62,207,178,0.12)', color: '#3ECFB2' };
    if (status === 'payment_pending') return { bg: 'rgba(232,184,109,0.12)', color: '#E8B86D' };
    if (status === 'paid') return { bg: 'rgba(62,207,178,0.15)', color: '#3ECFB2' };
    if (status === 'checked_in') return { bg: 'rgba(62,207,178,0.25)', color: '#3ECFB2' };
    if (status === 'completed') return { bg: 'rgba(62,207,178,0.1)', color: '#3ECFB2' };
    if (status === 'cancelled' || status === 'declined' || status === 'expired') return { bg: 'rgba(255,107,107,0.12)', color: '#FF6B6B' };
    if (status === 'no_show') return { bg: 'rgba(255,107,107,0.2)', color: '#FF6B6B' };
    return { bg: 'rgba(232,184,109,0.12)', color: '#E8B86D' };
  };"""
)
print("Done" if "payment_pending" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/HostBookings.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
