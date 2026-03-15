with open('src/app/pages/HostBookings.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');",
    "  const [filter, setFilter] = useState<'all' | 'inquiry' | 'accepted' | 'paid' | 'checked_in' | 'completed' | 'cancelled'>('all');\n  const [countdown, setCountdown] = useState<{[key:string]:number}>({});"
)

c = c.replace(
    "  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.booking_status === filter);",
    """  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.booking_status === filter);

  useEffect(() => {
    const inquiries = bookings.filter(b => b.booking_status === 'inquiry');
    if (inquiries.length === 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        const next = { ...prev };
        inquiries.forEach(b => {
          const created = new Date(b.created_at).getTime();
          const elapsed = Math.floor((Date.now() - created) / 1000);
          const remaining = Math.max(0, 300 - elapsed);
          next[b.id] = remaining;
          if (remaining === 0 && b.booking_status === 'inquiry') {
            supabase.from('bookings').update({ booking_status: 'expired' }).eq('id', b.id).then(() => {
              setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, booking_status: 'expired' } : bk));
            });
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [bookings]);

  const handleAccept = async (booking: any) => {
    const { error } = await supabase.from('bookings').update({ booking_status: 'accepted' }).eq('id', booking.id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, booking_status: 'accepted' } : b));
      await supabase.from('notifications').insert({
        user_id: booking.guest_id,
        type: 'accepted',
        title: 'Booking Accepted!',
        body: 'Your inquiry for ' + booking.property_title + ' was accepted. You have 15 minutes to pay.',
        data: { booking_id: booking.id },
      });
      handleContactGuest(booking);
    }
  };

  const handleDecline = async (booking: any) => {
    const { error } = await supabase.from('bookings').update({ booking_status: 'declined' }).eq('id', booking.id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, booking_status: 'declined' } : b));
      await supabase.from('notifications').insert({
        user_id: booking.guest_id,
        type: 'declined',
        title: 'Booking Declined',
        body: 'Your inquiry for ' + booking.property_title + ' was declined. Keep searching!',
        data: { booking_id: booking.id },
      });
    }
  };"""
)

c = c.replace(
    "                  {booking.booking_status === 'pending' && ( \n                    <>\n                      <button onClick={() => handleUpdateStatus(booking.id, 'confirmed')}\n                        className=\"flex-1 min-w-[110px] py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]\"     \n                        style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', color: 'var(--lala-night)', fontWeight: 700 }}>\n                        ✓ Confirm\n                      </button>\n                      <button onClick={() => handleUpdateStatus(booking.id, 'cancelled')}\n                        className=\"flex-1 min-w-[110px] py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]\"     \n                        style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', fontWeight: 600 }}>\n                        ✕ Decline\n                      </button>\n                    </>\n                  )}",
    """                  {booking.booking_status === 'inquiry' && (
                    <div className="w-full">
                      <div style={{ textAlign:'center', fontSize:12, color:'#E8B86D', marginBottom:8, fontWeight:600 }}>
                        {countdown[booking.id] !== undefined
                          ? `${Math.floor(countdown[booking.id]/60)}:${String(countdown[booking.id]%60).padStart(2,'0')} to respond`
                          : 'New Inquiry'}
                      </div>
                      <div className="flex gap-2 w-full">
                        <button onClick={() => handleAccept(booking)}
                          className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                          style={{ background: 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 700 }}>
                          Accept
                        </button>
                        <button onClick={() => handleDecline(booking)}
                          className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                          style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', fontWeight: 600 }}>
                          Decline
                        </button>
                      </div>
                    </div>
                  )}"""
)

print("Done" if "handleAccept" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/HostBookings.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
