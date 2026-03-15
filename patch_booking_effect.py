with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

import re
c = re.sub(
    r"  useEffect\(\(\) => \{\n    if \(!activeConversation\?\.bookingId\) return;\n    supabase\.from\('bookings'\)\.select\('\*'\)\.eq\('id', activeConversation\.bookingId\)\.maybeSingle\(\)\n      \.then\(\(\{ data \}\) => \{ if \(data\) setBooking\(data\); \}\).*?\n  \}, \[activeConversation\?\.bookingId\]\);",
    """  useEffect(() => {
    const bookingId = remoteConv?.booking_id;
    if (!bookingId) return;
    supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle()
      .then(({ data }) => { if (data) setBooking(data); });
  }, [remoteConv?.booking_id]);""",
    c, flags=re.DOTALL
)

print("Done" if "remoteConv?.booking_id" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
