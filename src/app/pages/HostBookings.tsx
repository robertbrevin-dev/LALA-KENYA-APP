import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

export default function HostBookings() {
  const navigate = useNavigate();
  const { currentUser, loading: appLoading, createConversation } = useApp();
  const user = currentUser;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const todayStr = new Date().toISOString().slice(0, 10);

  // Protect route: wait for auth, then require a user
  useEffect(() => {
    if (!appLoading && !user) {
      navigate('/login');
    }
  }, [appLoading, user, navigate]);

  useEffect(() => {
    async function fetchBookings() {
      if (!user?.id) {
        setBookings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setBookings(data || []);
      setLoading(false);
    }
    fetchBookings();
  }, [user?.id]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.booking_status === filter);

  const handleContactGuest = (booking: any) => {
    const conv = {
      id: booking.id,
      propertyId: booking.property_id,
      propertyTitle: booking.property_title,
      propertyLocation: booking.property_location,
      guestId: booking.guest_id,
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      nights: booking.nights,
      totalAmount: booking.total_amount,
      status: booking.booking_status,
      createdAt: booking.created_at,
    };
    const conversationId = createConversation(conv, 'guest', booking.guest_name, booking.guest_id);
    navigate(`/conversation/${conversationId}`);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ booking_status: newStatus })
      .eq('id', bookingId);

    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b));
    }
  };

  const statusColor = (status: string) => {
    if (status === 'confirmed') return { bg: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)' };
    if (status === 'in_stay') return { bg: 'rgba(62,207,178,0.2)', color: 'var(--lala-teal)' };
    if (status === 'cancelled') return { bg: 'rgba(255,107,107,0.12)', color: '#FF6B6B' };
    if (status === 'completed') return { bg: 'rgba(62,207,178,0.2)', color: 'var(--lala-teal)' };
    return { bg: 'rgba(232,184,109,0.12)', color: 'var(--lala-gold)' };
  };

  // Host-side lifecycle helpers, mirroring guest behaviour
  const canHostCheckIn = (b: any) =>
    b.booking_status === 'confirmed' &&
    b.check_in <= todayStr &&
    b.check_out > todayStr;

  const canHostCheckOut = (b: any) =>
    b.booking_status === 'in_stay' &&
    b.check_out <= todayStr;

  const canHostCancel = (b: any) =>
    b.booking_status === 'confirmed' &&
    b.check_in > todayStr;

  // While auth is resolving, show a simple loading state
  if (appLoading && !user) {
    return (
      <PhoneFrame>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <BackRefreshBar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[14px]" style={{ color: 'var(--lala-muted)' }}>
              Loading…
            </div>
          </div>
        </div>
        <BottomNav type="host" />
      </PhoneFrame>
    );
  }

  // If no user and not loading, navigation effect will handle redirect
  if (!user) {
    return null;
  }

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <BackRefreshBar />
        {/* Header */}
        <div className="px-6 pt-14 pb-5">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-[28px] mb-1"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>
            All Bookings
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-[14px] mb-4" style={{ color: 'var(--lala-soft)' }}>
            {bookings.length} total bookings
          </motion.p>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f as any)}
                className="px-4 py-2 rounded-[20px] text-[12px] whitespace-nowrap border-none cursor-pointer"
                style={{
                  background: filter === f ? 'var(--lala-gold)' : 'var(--lala-card)',
                  color: filter === f ? 'var(--lala-night)' : 'var(--lala-muted)',
                  fontWeight: filter === f ? 700 : 500,
                  border: filter === f ? 'none' : '1px solid var(--lala-border)',
                }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-24">
          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--lala-muted)' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[20px] p-10 text-center" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="text-[48px] mb-3">📭</div>
              <div className="text-[15px]" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>No bookings yet</div>
              <div className="text-[13px] mt-1" style={{ color: 'var(--lala-muted)' }}>Bookings will appear here</div>
            </div>
          ) : (
            filtered.map((booking, index) => (
              <motion.div key={booking.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[16px] p-4 mb-3"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>

                {/* Guest Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-[18px] flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', fontWeight: 700, color: 'var(--lala-night)' }}>
                    {booking.guest_name?.[0] || 'G'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] mb-0.5" style={{ fontWeight: 600, color: 'var(--lala-white)' }}>
                      {booking.guest_name}
                    </div>
                    <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>
                      {booking.property_title}
                    </div>
                  </div>
                  <div className="text-[11px] px-2.5 py-1 rounded-[20px] uppercase"
                    style={{ background: statusColor(booking.booking_status).bg, color: statusColor(booking.booking_status).color, fontWeight: 600 }}>
                    {booking.booking_status}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  {[
                    { label: 'Check-in', value: booking.check_in },
                    { label: 'Check-out', value: booking.check_out },
                    { label: 'Duration', value: `${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}` },
                    { label: 'Phone', value: booking.guest_phone || 'N/A' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-[13px]">
                      <span style={{ color: 'var(--lala-muted)' }}>{row.label}</span>
                      <span style={{ color: 'var(--lala-soft)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-3 mb-3" style={{ borderTop: '1px solid var(--lala-border)', borderBottom: '1px solid var(--lala-border)' }}>
                  <span className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>Total Amount</span>
                  <span className="text-[16px]" style={{ fontWeight: 700, color: 'var(--lala-gold)' }}>
                    Ksh {booking.total_amount?.toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleContactGuest(booking)}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                    style={{ background: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)', fontWeight: 600 }}>
                    <MessageCircle size={14} /> Message
                  </button>

                  {booking.booking_status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        className="flex-1 min-w-[110px] py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                        style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', color: 'var(--lala-night)', fontWeight: 700 }}>
                        ✓ Confirm
                      </button>
                      <button onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        className="flex-1 min-w-[110px] py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                        style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', fontWeight: 600 }}>
                        ✕ Decline
                      </button>
                    </>
                  )}

                  {canHostCancel(booking) && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      className="flex-1 min-w-[110px] py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                      style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', fontWeight: 600 }}>
                      ✕ Cancel
                    </button>
                  )}

                  {canHostCheckIn(booking) && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'in_stay')}
                      className="flex-1 min-w-[110px] py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                      style={{ background: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)', fontWeight: 600 }}>
                      ✓ Check In
                    </button>
                  )}

                  {canHostCheckOut(booking) && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'completed')}
                      className="flex-1 min-w-[110px] py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                      style={{ background: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)', fontWeight: 600 }}>
                      ✓ Check Out
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <BottomNav type="host" />
    </PhoneFrame>
  );
}
