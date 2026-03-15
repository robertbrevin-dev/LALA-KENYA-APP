# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const [messagesLoaded, setMessagesLoaded] = useState(false);",
    "  const [messagesLoaded, setMessagesLoaded] = useState(false);\n  const [booking, setBooking] = useState<any>(null);\n  const [payCountdown, setPayCountdown] = useState<number>(0);\n  const [paying, setPaying] = useState(false);"
)

c = c.replace(
    "  }, [id, conversation]);",
    """  }, [id, conversation]);

  useEffect(() => {
    if (!activeConversation?.bookingId) return;
    supabase.from('bookings').select('*').eq('id', activeConversation.bookingId).maybeSingle()
      .then(({ data }) => { if (data) setBooking(data); });
  }, [activeConversation?.bookingId]);

  useEffect(() => {
    if (!booking || booking.booking_status !== 'accepted') return;
    const deadline = new Date(booking.updated_at || booking.created_at).getTime() + 30*60*1000;
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setPayCountdown(remaining);
      if (remaining === 0) {
        clearInterval(tick);
        supabase.from('bookings').update({ booking_status: 'expired' }).eq('id', booking.id)
          .then(() => setBooking((prev) => prev ? { ...prev, booking_status: 'expired' } : prev));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [booking?.id, booking?.booking_status]);

  const handlePay = async (type) => {
    if (!booking || paying) return;
    setPaying(true);
    const amount = type === 'full' ? Math.round(booking.total_amount * 1.03) : 1000;
    await supabase.from('bookings').update({ booking_status: 'payment_pending', payment_type: type, amount_paid: amount }).eq('id', booking.id);
    setBooking((prev) => ({ ...prev, booking_status: 'payment_pending' }));
    setTimeout(async () => {
      await supabase.from('bookings').update({ booking_status: 'paid' }).eq('id', booking.id);
      setBooking((prev) => ({ ...prev, booking_status: 'paid' }));
      await supabase.from('notifications').insert({ user_id: booking.host_id, type: 'paid', title: 'Payment Received!', body: 'Ksh ' + amount.toLocaleString() + ' for ' + booking.property_title, data: { booking_id: booking.id }, is_read: false });
      setPaying(false);
    }, 3000);
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    await supabase.from('bookings').update({ booking_status: 'cancelled' }).eq('id', booking.id);
    setBooking((prev) => ({ ...prev, booking_status: 'cancelled' }));
  };"""
)

CARD = """        {booking && currentUser?.role === 'guest' && ['accepted','payment_pending','paid'].includes(booking.booking_status) && (
          <div className="px-4 pt-4">
            <div className="rounded-[20px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1f1b, #061412)', border: '1px solid rgba(62,207,178,0.25)' }}>
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(62,207,178,0.15)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] uppercase tracking-widest" style={{ color: '#3ECFB2', fontWeight: 700 }}>Booking Request</div>
                  <div className="text-[11px] px-2.5 py-1 rounded-full uppercase" style={{ background: booking.booking_status === 'paid' ? 'rgba(62,207,178,0.15)' : 'rgba(232,184,109,0.15)', color: booking.booking_status === 'paid' ? '#3ECFB2' : '#E8B86D', fontWeight: 700 }}>
                    {booking.booking_status === 'paid' ? 'Paid' : booking.booking_status === 'payment_pending' ? 'Processing...' : 'Accepted'}
                  </div>
                </div>
                <div className="text-[17px]" style={{ fontWeight: 800, color: 'var(--lala-white)' }}>{booking.property_title}</div>
                <div className="text-[12px] mt-1" style={{ color: 'var(--lala-muted)' }}>{booking.check_in} to {booking.check_out} - {booking.nights} night{booking.nights !== 1 ? 's' : ''}</div>
              </div>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(62,207,178,0.1)' }}>
                <div className="flex justify-between text-[13px] mb-1.5"><span style={{ color: 'var(--lala-muted)' }}>Room rate</span><span style={{ color: 'var(--lala-soft)' }}>Ksh {Number(booking.total_amount).toLocaleString()}</span></div>
                <div className="flex justify-between text-[13px] mb-1.5"><span style={{ color: 'var(--lala-muted)' }}>Platform fee (3%)</span><span style={{ color: 'var(--lala-soft)' }}>Ksh {Math.round(Number(booking.total_amount)*0.03).toLocaleString()}</span></div>
                <div className="flex justify-between text-[15px] mt-2"><span style={{ color: 'var(--lala-white)', fontWeight: 700 }}>Total</span><span style={{ color: '#E8B86D', fontWeight: 800 }}>Ksh {Math.round(Number(booking.total_amount)*1.03).toLocaleString()}</span></div>
              </div>
              {booking.booking_status === 'accepted' && payCountdown > 0 && (
                <div className="px-4 py-2 text-center text-[12px]" style={{ color: payCountdown < 300 ? '#FF6B6B' : '#E8B86D' }}>
                  Pay within {Math.floor(payCountdown/60)}:{String(payCountdown%60).padStart(2,'0')} to confirm
                </div>
              )}
              {booking.booking_status === 'accepted' && (
                <div className="px-4 py-4 space-y-2.5">
                  <button onClick={() => handlePay('full')} disabled={paying} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 800 }}>
                    {paying ? 'Processing...' : 'Pay Full - Ksh ' + Math.round(Number(booking.total_amount)*1.03).toLocaleString()}
                  </button>
                  <button onClick={() => handlePay('deposit')} disabled={paying} className="w-full py-3 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'rgba(232,184,109,0.1)', color: '#E8B86D', fontWeight: 700, border: '1px solid rgba(232,184,109,0.25)' }}>
                    Pay Deposit - Ksh 1,000
                  </button>
                  <button onClick={handleCancelBooking} disabled={paying} className="w-full py-2.5 rounded-[14px] border-none cursor-pointer text-[13px]" style={{ background: 'transparent', color: 'rgba(255,107,107,0.7)', fontWeight: 600 }}>
                    Cancel Request
                  </button>
                </div>
              )}
              {booking.booking_status === 'payment_pending' && (
                <div className="px-4 py-4 text-center">
                  <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 700 }}>Check your phone</div>
                  <div className="text-[12px] mt-1" style={{ color: 'var(--lala-muted)' }}>M-Pesa STK push sent. Enter PIN to complete.</div>
                </div>
              )}
              {booking.booking_status === 'paid' && (
                <div className="px-4 py-4 text-center">
                  <div className="text-[14px]" style={{ color: '#3ECFB2', fontWeight: 700 }}>Booking Confirmed!</div>
                  <div className="text-[12px] mt-1" style={{ color: 'var(--lala-muted)' }}>Your stay is secured. See you on {booking.check_in}!</div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Messages */}"""

c = c.replace("        {/* Messages */}", CARD)
print("Done" if "handlePay" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
