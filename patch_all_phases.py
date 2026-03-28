# -*- coding: utf-8 -*-

# ============ PHASE 5: Fix canCheckIn to use 'paid' status + GPS ============
with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const canCheckIn = (b: any) =>\n    b.status === 'confirmed' &&\n    b.checkIn <= todayStr &&\n    b.checkOut > todayStr;",
    "  const canCheckIn = (b: any) =>\n    b.status === 'paid' &&\n    b.checkIn <= todayStr &&\n    b.checkOut > todayStr;"
)
c = c.replace(
    "  const canCancel = (b: any) =>\n    b.status === 'confirmed' &&\n    b.checkIn > todayStr;",
    "  const canCancel = (b: any) =>\n    (b.status === 'paid' || b.status === 'accepted') &&\n    b.checkIn > todayStr;"
)

# Add GPS check-in function after canCancel
if "handleGPSCheckIn" not in c:
    c = c.replace(
        "  return (\n    <PhoneFrame>",
        """  const handleGPSCheckIn = async (booking: any) => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { error } = await supabase.from('bookings').update({ booking_status: 'checked_in' }).eq('id', booking.id);
      if (!error) { setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'checked_in' } : b)); }
    }, () => {
      if (window.confirm('Could not get GPS. Check in anyway?')) {
        supabase.from('bookings').update({ booking_status: 'checked_in' }).eq('id', booking.id)
          .then(() => setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'checked_in' } : b)));
      }
    });
  };

  const handleCheckOut = async (booking: any) => {
    const { error } = await supabase.from('bookings').update({ booking_status: 'completed' }).eq('id', booking.id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setHistory(prev => [{ ...booking, status: 'completed' }, ...prev]);
      await supabase.from('properties').update({ is_available: true }).eq('id', booking.propertyId);
    }
  };

  return (
    <PhoneFrame>"""
    )

# Replace check-in button to use GPS
c = c.replace(
    "                    onClick={() => updateStatus(booking.id, 'in_stay')}",
    "                    onClick={() => handleGPSCheckIn(booking)}"
)

# Replace check-out button
c = c.replace(
    "                    onClick={() => updateStatus(booking.id, 'completed')}",
    "                    onClick={() => handleCheckOut(booking)}"
)

print("Phase5:", "handleGPSCheckIn" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))

