with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  useEffect(() => {\n    const bookingId = remoteConv?.booking_id;\n    if (!bookingId) return;\n    supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle()\n      .then(({ data }) => { if (data) setBooking(data); });\n  }, [remoteConv?.booking_id]);",
    "  useEffect(() => {\n    const bookingId = remoteConv?.booking_id;\n    if (!bookingId) return;\n    const fetchBooking = () => supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle()\n      .then(({ data }) => { if (data) setBooking(data); });\n    fetchBooking();\n    const sub = supabase.channel('booking:' + bookingId)\n      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: 'id=eq.' + bookingId }, (payload) => { setBooking(payload.new); })\n      .subscribe();\n    return () => { supabase.removeChannel(sub); };\n  }, [remoteConv?.booking_id]);"
)

print("Done" if "postgres_changes" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
