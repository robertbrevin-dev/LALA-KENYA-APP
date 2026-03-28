# -*- coding: utf-8 -*-
with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add realtime subscription after the fetchBookings useEffect closing bracket
c = c.replace(
    "  }, [currentUser?.id]);",
    """  }, [currentUser?.id]);

  // Realtime: refresh bookings when status changes
  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = supabase.channel('trips-bookings-' + currentUser.id)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'bookings',
        filter: 'guest_id=eq.' + currentUser.id
      }, () => {
        // Re-fetch when any booking updates (e.g. host accepts)
        supabase.from('bookings').select('*').eq('guest_id', currentUser.id).order('check_in', { ascending: true })
          .then(({ data }) => {
            if (!data) return;
            const today = new Date().toISOString().slice(0, 10);
            const allMapped = (data || []).map((b: any) => ({
              id: b.id,
              propertyId: b.property_id,
              propertyTitle: b.property_title,
              propertyLocation: b.property_location,
              checkIn: b.check_in,
              checkOut: b.check_out,
              nights: b.nights,
              totalAmount: b.total_amount,
              status: b.booking_status,
              createdAt: b.created_at,
            }));
            const active = allMapped.filter(b => !['completed','cancelled','expired','declined','no_show'].includes(b.status));
            const hist = allMapped.filter(b => ['completed','cancelled','no_show'].includes(b.status));
            const past = allMapped.filter(b => ['expired','declined'].includes(b.status));
            setBookings(active);
            setHistory(hist);
            setPastInquiries(past);
          });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);""",
    1  # only replace first occurrence
)

print("Done" if "trips-bookings-" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
