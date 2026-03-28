# -*- coding: utf-8 -*-
with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix canCheckIn to use 'paid' status
c = c.replace(
    "b.status === 'confirmed' &&",
    "b.status === 'paid' &&"
)
c = c.replace(
    "  const canCancel = (b: any) =>\n    b.status === 'confirmed' &&",
    "  const canCancel = (b: any) =>\n    (b.status === 'paid' || b.status === 'accepted') &&"
)

# Add GPS checkin + checkout + realtime if not there
if "handleGPSCheckIn" not in c:
    c = c.replace(
        "  return (\n    <PhoneFrame>",
        """  const handleGPSCheckIn = async (booking: any) => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(async () => {
      const { error } = await supabase.from('bookings').update({ booking_status: 'checked_in' }).eq('id', booking.id);
      if (!error) {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'checked_in' } : b));
        const { sendNotification } = await import('../utils/notify');
        await sendNotification({ userId: booking.hostId || booking.host_id || '', type: 'checkin', bookingId: booking.id, propertyTitle: booking.propertyTitle, guestName: currentUser?.name, amount: Math.round((booking.totalAmount || 0) * 0.97) });
      }
    }, async () => {
      if (window.confirm('Could not get GPS. Check in anyway?')) {
        await supabase.from('bookings').update({ booking_status: 'checked_in' }).eq('id', booking.id);
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'checked_in' } : b));
      }
    });
  };

  const handleCheckOut = async (booking: any) => {
    const { error } = await supabase.from('bookings').update({ booking_status: 'completed' }).eq('id', booking.id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setHistory(prev => [{ ...booking, status: 'completed' }, ...prev]);
      await supabase.from('properties').update({ is_available: true }).eq('id', booking.propertyId);
      const { sendNotification } = await import('../utils/notify');
      await sendNotification({ userId: booking.hostId || '', type: 'checkout', bookingId: booking.id, propertyTitle: booking.propertyTitle, guestName: currentUser?.name, amount: Math.round((booking.totalAmount || 0) * 0.97) });
      await sendNotification({ userId: currentUser?.id || '', type: 'review_request', bookingId: booking.id, propertyTitle: booking.propertyTitle });
    }
  };

  return (
    <PhoneFrame>"""
    )

# Replace check-in/out button handlers
c = c.replace("onClick={() => updateStatus(booking.id, 'in_stay')}", "onClick={() => handleGPSCheckIn(booking)}")
c = c.replace("onClick={() => updateStatus(booking.id, 'completed')}", "onClick={() => handleCheckOut(booking)}")

# Add realtime subscription
if "trips-bookings-" not in c:
    c = c.replace(
        "  }, [currentUser?.id]);",
        """  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = supabase.channel('trips-bookings-' + currentUser.id)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: 'guest_id=eq.' + currentUser.id }, () => {
        supabase.from('bookings').select('*').eq('guest_id', currentUser.id).order('check_in', { ascending: true })
          .then(({ data }) => {
            if (!data) return;
            const today = new Date().toISOString().slice(0, 10);
            const allMapped = data.map((b: any) => ({ id: b.id, propertyId: b.property_id, propertyTitle: b.property_title, propertyLocation: b.property_location, checkIn: b.check_in, checkOut: b.check_out, nights: b.nights, totalAmount: b.total_amount, status: b.booking_status, createdAt: b.created_at, hostId: b.host_id }));
            setBookings(allMapped.filter(b => !['completed','cancelled','expired','declined','no_show'].includes(b.status)));
            setHistory(allMapped.filter(b => ['completed','cancelled','no_show'].includes(b.status)));
            setPastInquiries(allMapped.filter(b => ['expired','declined'].includes(b.status)));
          });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);""",
    1
    )

print("Trips:", "handleGPSCheckIn" in c and "trips-bookings-" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))
print("Saved Trips.tsx")
