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
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function fetchBookings() {
      if (!currentUser?.id) {
        setBookings([]);
        setHistory([]);
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
        setHistory([]);
      } else {
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
        }));
        const upcoming = allMapped.filter(
          (b: any) => b.status !== 'cancelled' && (b.checkIn as string) >= today
        );
        const past = allMapped
          .filter(
            (b: any) =>
              b.status === 'completed' ||
              ((b.checkOut as string) < today &&
                (b.status === 'in_stay' || b.status === 'confirmed' || b.status === 'completed'))
          )
          .sort((a: any, b: any) => (b.checkOut as string).localeCompare(a.checkOut as string));
        setBookings(upcoming);
        setHistory(past);
      }
      setLoading(false);
    }
    fetchBookings();
  }, [currentUser?.id]);

  const handleContactHost = (booking: any) => {
    const property = properties.find((p: any) => p.id === booking.propertyId);
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
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', background: '#0a0808' }}>
        {/* Header */}
        <div style={{ padding: '56px 24px 20px', background: 'linear-gradient(180deg, #100c08 0%, #0a0808 100%)', borderBottom: '1px solid rgba(232,184,109,0.08)' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[28px] mb-2"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 900,
              color: 'white'
            }}
          >
            My Trips
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[14px]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {loading ? 'Loading…' : `${bookings.length} upcoming ${bookings.length === 1 ? 'trip' : 'trips'}`}
          </motion.p>
        </div>

        {/* Content */}
        <div className="px-6 pb-24">
          {!loading && bookings.length === 0 && (
            <div className="text-center mt-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                📍 {booking.propertyLocation}
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="text-[13px]"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  📅 {booking.checkIn} – {booking.checkOut} ({booking.nights} {booking.nights === 1 ? 'night' : 'nights'})
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div 
                  className="text-[12px]"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Total paid
                </div>
                <div 
                  className="text-[16px]"
                  style={{
                    fontWeight: 700,
                    color: '#E8B86D'
                  }}
                >
                  Ksh {Number(booking.totalAmount).toLocaleString()}
                </div>
              </div>

              {/* Contact Host */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <button
                  className="flex items-center gap-2 text-[14px] font-bold"
                  style={{ color: '#E8B86D' }}
                  onClick={() => handleContactHost(booking)}
                >
                  <MessageCircle size={16} />
                  Contact Host
                </button>
                {canCheckIn(booking) && (
                  <button
                    onClick={() => updateStatus(booking.id, 'in_stay')}
                    className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,184,109,0.1)', color: 'var(--lala-white)' }}
                  >
                    Check In
                  </button>
                )}
                {canCheckOut(booking) && (
                  <button
                    onClick={() => updateStatus(booking.id, 'completed')}
                    className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,184,109,0.1)', color: 'var(--lala-white)' }}
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

          {history.length > 0 && (
            <div className="mt-6">
              <div
                className="text-[18px] mb-3"
                style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}
              >
                Past Stays
              </div>
              {history.map((stay, idx) => (
                <motion.div
                  key={`hist-${stay.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-[16px] p-4 mb-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,184,109,0.1)' }}
                >
                  <div
                    className="text-[14px] mb-1"
                    style={{ fontWeight: 700, color: 'var(--lala-white)' }}
                  >
                    {stay.propertyTitle}
                  </div>
                  <div
                    className="text-[12px] mb-2"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    📍 {stay.propertyLocation}
                  </div>
                  <div
                    className="text-[12px]"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Stayed: {stay.checkIn} – {stay.checkOut} ({stay.nights} {stay.nights === 1 ? 'night' : 'nights'})
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/property/${stay.propertyId}`)}
                      className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,184,109,0.1)', color: 'var(--lala-white)' }}
                    >
                      Book Again
                    </button>
                    <button
                      onClick={() => navigate(`/property/${stay.propertyId}`)}
                      className="text-[12px] border-none bg-transparent cursor-pointer"
                      style={{ color: '#E8B86D', fontWeight: 700 }}
                    >
                      View details →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
