# -*- coding: utf-8 -*-
with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "sendNotification" not in c:
    c = c.replace("import { supabase }", "import { sendNotification } from '../utils/notify';\nimport { supabase }")

c = c.replace(
    "      const { error } = await supabase.from('bookings').update({ booking_status: 'checked_in' }).eq('id', booking.id);\n      if (!error) {\n        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'checked_in' } : b));",
    """      const { error } = await supabase.from('bookings').update({ booking_status: 'checked_in' }).eq('id', booking.id);
      if (!error) {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'checked_in' } : b));
        await sendNotification({ userId: booking.hostId || booking.host_id || '', type: 'checkin', bookingId: booking.id, propertyTitle: booking.propertyTitle, guestName: currentUser?.name, amount: Math.round((booking.totalAmount || 0) * 0.97) });"""
)

c = c.replace(
    "    const { error } = await supabase.from('bookings').update({ booking_status: 'completed' }).eq('id', booking.id);\n    if (!error) {\n      setBookings(prev => prev.filter(b => b.id !== booking.id));\n      setHistory(prev => [{ ...booking, status: 'completed' }, ...prev]);\n      await supabase.from('properties').update({ is_available: true }).eq('id', booking.propertyId);",
    """    const { error } = await supabase.from('bookings').update({ booking_status: 'completed' }).eq('id', booking.id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setHistory(prev => [{ ...booking, status: 'completed' }, ...prev]);
      await supabase.from('properties').update({ is_available: true }).eq('id', booking.propertyId);
      await sendNotification({ userId: booking.hostId || booking.host_id || '', type: 'checkout', bookingId: booking.id, propertyTitle: booking.propertyTitle, guestName: currentUser?.name, amount: Math.round((booking.totalAmount || 0) * 0.97) });
      await sendNotification({ userId: currentUser?.id || '', type: 'review_request', bookingId: booking.id, propertyTitle: booking.propertyTitle });"""
)

print("Done" if "sendNotification" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
