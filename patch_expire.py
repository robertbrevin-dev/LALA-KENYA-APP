with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace(
    '    async function fetchBookings() {\n      if (!currentUser?.id) {',
    "    async function fetchBookings() {\n      if (currentUser?.id) {\n        await supabase.from('bookings').update({ booking_status: 'expired' }).eq('guest_id', currentUser.id).eq('booking_status', 'inquiry').lt('created_at', new Date(Date.now() - 5*60*1000).toISOString());\n      }\n      if (!currentUser?.id) {"
)
print("Done" if "expired" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
