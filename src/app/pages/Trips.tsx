import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

export default function Trips() {
  const navigate = useNavigate();
  const { createConversation, properties, currentUser } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function fetchBookings() {
      if (!currentUser?.id) {
        setBookings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_id', currentUser.id)
        .order('check_in', { ascending: true });
      if (error) {
        console.error(error);
        setBookings([]);
      } else {
        const today = new Date().toISOString().slice(0, 10);
        const mapped = (data || [])
          .filter(b => (b.check_in as string) >= today)
          .map(b => ({
            id: b.id,
            propertyId: b.property_id,
            propertyTitle: b.property_title,
            propertyLocation: b.property_location,
            checkIn: b.check_in,
            checkOut: b.check_out,
            nights: b.nights,
            totalAmount: b.total_amount,
            status: b.booking_status,
          }));
        setBookings(mapped);
      }
      setLoading(false);
    }
    fetchBookings();
  }, [currentUser?.id]);

  const handleContactHost = (booking: any) => {
    const property = properties.find(p => p.id === booking.propertyId);
    if (property) {
      const conversationId = createConversation(
        booking,
        'host',
        property.hostName,
        property.hostId
      );
      navigate(`/conversation/${conversationId}`);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  // Guest actions: allow booking in advance, then handle stay lifecycle by date
  const canCheckIn = (b: any) =>
    b.status === 'confirmed' &&
    b.checkIn <= todayStr &&
    b.checkOut > todayStr;

  const canCheckOut = (b: any) =>
    b.status === 'in_stay' &&
    b.checkOut <= todayStr;

  const canCancel = (b: any) =>
    b.status === 'confirmed' &&
    b.checkIn > todayStr;

  return (
    <PhoneFrame>
      <BackRefreshBar />
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Header */}
        <div className="px-6 pt-14 pb-5">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[28px] mb-2"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 900,
              color: 'var(--lala-white)'
            }}
          >
            My Trips
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[14px]"
            style={{ color: 'var(--lala-soft)' }}
          >
            {loading ? 'Loading…' : `${bookings.length} upcoming ${bookings.length === 1 ? 'trip' : 'trips'}`}
          </motion.p>
        </div>

        {/* Content */}
        <div className="px-6 pb-24">
          {!loading && bookings.length === 0 && (
            <div className="text-center mt-10" style={{ color: 'var(--lala-muted)' }}>
              No upcoming trips yet.
            </div>
          )}
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-[16px] p-4 mb-3"
              style={{
                background: 'var(--lala-card)',
                border: '1px solid var(--lala-border)'
              }}
            >
              {/* Status Badge */}
              <div 
                className="inline-flex text-[10px] px-2.5 py-1 rounded-[20px] uppercase mb-3"
                style={{
                  background: booking.status === 'confirmed' 
                    ? 'rgba(62,207,178,0.12)' 
                    : 'rgba(232,184,109,0.12)',
                  color: booking.status === 'confirmed' 
                    ? 'var(--lala-teal)' 
                    : 'var(--lala-gold)',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
              >
                {booking.status}
              </div>

              {/* Property Title */}
              <div 
                className="text-[16px] mb-1"
                style={{
                  fontWeight: 700,
                  color: 'var(--lala-white)'
                }}
              >
                {booking.propertyTitle}
              </div>

              {/* Location */}
              <div 
                className="text-[13px] mb-3"
                style={{ color: 'var(--lala-muted)' }}
              >
                📍 {booking.propertyLocation}
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="text-[13px]"
                  style={{ color: 'var(--lala-soft)' }}
                >
                  📅 {booking.checkIn} – {booking.checkOut} ({booking.nights} {booking.nights === 1 ? 'night' : 'nights'})
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--lala-border)' }}>
                <div 
                  className="text-[12px]"
                  style={{ color: 'var(--lala-muted)' }}
                >
                  Total paid
                </div>
                <div 
                  className="text-[16px]"
                  style={{
                    fontWeight: 700,
                    color: 'var(--lala-gold)'
                  }}
                >
                  Ksh {Number(booking.totalAmount).toLocaleString()}
                </div>
              </div>

              {/* Contact Host */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <button
                  className="flex items-center gap-2 text-[14px] font-bold"
                  style={{ color: 'var(--lala-gold)' }}
                  onClick={() => handleContactHost(booking)}
                >
                  <MessageCircle size={16} />
                  Contact Host
                </button>
                {canCheckIn(booking) && (
                  <button
                    onClick={() => updateStatus(booking.id, 'in_stay')}
                    className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                    style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}
                  >
                    Check In
                  </button>
                )}
                {canCheckOut(booking) && (
                  <button
                    onClick={() => updateStatus(booking.id, 'completed')}
                    className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                    style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}
                  >
                    Check Out
                  </button>
                )}
                {canCancel(booking) && (
                  <button
                    onClick={() => updateStatus(booking.id, 'cancelled')}
                    className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                    style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
