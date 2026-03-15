import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function Trips() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { createConversation, properties, currentUser } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [pastInquiries, setPastInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function fetchBookings() {
      if (currentUser?.id) {
        await supabase.from('bookings').update({ booking_status: 'expired' }).eq('guest_id', currentUser.id).eq('booking_status', 'inquiry').lt('created_at', new Date(Date.now() - 5*60*1000).toISOString());
      }
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
          createdAt: b.created_at,
        }));
        const statusOrder: Record<string, number> = {
          'inquiry': 0, 'accepted': 1, 'payment_pending': 2,
          'paid': 3, 'checked_in': 4, 'completed': 5,
        };
        const upcoming = allMapped
          .filter((b: any) =>
            !['cancelled', 'declined', 'expired', 'no_show'].includes(b.status)
          )
          .sort((a: any, b: any) => {
            const oa = statusOrder[a.status] ?? 99;
            const ob = statusOrder[b.status] ?? 99;
            if (oa !== ob) return oa - ob;
            return ((b.createdAt || '') as string).localeCompare((a.createdAt || '') as string);
          });
        const pastInquiries = allMapped
          .filter((b: any) => ['cancelled', 'declined', 'expired'].includes(b.status))
          .sort((a: any, b: any) => ((b.createdAt || '') as string).localeCompare((a.createdAt || '') as string));
        const past = allMapped
          .filter(
            (b: any) =>
              b.status === 'completed' ||
              ((b.checkOut as string) < today &&
                (b.status === 'in_stay' || b.status === 'confirmed' || b.status === 'completed'))
          )
          .sort((a: any, b: any) => ((b.checkOut || '') as string).localeCompare((a.checkOut || '') as string));
        setBookings(upcoming);
        setHistory(past);
        setPastInquiries(pastInquiries);
      }
      setLoading(false);
    }
    fetchBookings();
  }, [currentUser?.id]);

  const handleContactHost = async (booking: any) => {
    const property = properties.find((p: any) => p.id === booking.propertyId);
    if (property) {
      const conversationId = await createConversation(
        booking,
        'host',
        property.title,
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
                  {['paid','checked_in','completed'].includes(booking.status) ? 'Total paid' : 'Total amount'}
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
                {booking.status === 'inquiry' ? (
                  <div className="flex items-center gap-2 text-[13px]" style={{ color: '#E8B86D' }}>
                    <span className="animate-pulse">⏳</span>
                    Waiting for host to respond...
                  </div>
                ) : booking.status === 'declined' || booking.status === 'expired' ? (
                  <div className="text-[13px]" style={{ color: '#FF6B6B' }}>
                    ✕ Inquiry {booking.status}
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-2 text-[14px] font-bold"
                    style={{ color: '#E8B86D' }}
                    onClick={() => handleContactHost(booking)}
                  >
                    <MessageCircle size={16} />
                    Contact Host
                  </button>
                )}
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

          {pastInquiries.length > 0 && (
            <div className="mt-6">
              <div className="text-[18px] mb-3" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}>
                Past Inquiries
              </div>
              {pastInquiries.map((b, idx) => (
                <motion.div key={`pi-${b.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  className="rounded-[16px] p-4 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,107,107,0.15)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-[15px]" style={{ fontWeight: 700, color: 'var(--lala-white)' }}>{b.propertyTitle}</div>
                      <div className="text-[12px] mt-0.5" style={{ color: 'var(--lala-muted)' }}>{b.checkIn} — {b.checkOut}</div>
                    </div>
                    <div className="text-[11px] px-2 py-1 rounded-full uppercase" style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', fontWeight: 600 }}>
                      {b.status}
                    </div>
                  </div>
                  <div className="text-[13px]" style={{ color: '#FF6B6B' }}>
                    {b.status === 'expired' ? '⏰ Host did not respond in time' : b.status === 'declined' ? '✕ Host declined this inquiry' : '✕ Cancelled'}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
