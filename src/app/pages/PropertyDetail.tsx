
import { useEffect, useState } from 'react';







import { useParams, useNavigate } from 'react-router-dom';







import { motion } from 'motion/react';







import { addDays, format } from 'date-fns';







import PhoneFrame from '../components/PhoneFrame';







import DatePicker from '../components/DatePicker';







import VerifiedBadge from '../components/VerifiedBadge';







import { useApp } from '../context/AppContext';







import BackRefreshBar from '../components/BackRefreshBar';







import BottomNav from '../components/BottomNav';







import { supabase } from '../../lib/supabase';

import { useLanguage } from '../context/LanguageContext.tsx';















export default function PropertyDetail() {

  const { t } = useLanguage();






  const { id } = useParams();







  const navigate = useNavigate();







  const { properties, currentUser, createConversation } = useApp();















  // ── ALL HOOKS FIRST — before any conditional return ──







  const [checkIn, setCheckIn] = useState<Date | null>(addDays(new Date(), 1));







  const [checkOut, setCheckOut] = useState<Date | null>(addDays(new Date(), 2));







  const [showMore, setShowMore] = useState(false);







  const [activeIdx, setActiveIdx] = useState(0);







  const [bookingLoading, setBookingLoading] = useState(false);







  const [activeBooking, setActiveBooking] = useState<any | null>(null);







  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [showInquireModal, setShowInquireModal] = useState(false);
  const [inquireTime, setInquireTime] = useState('14:00');
  const [inquireNights, setInquireNights] = useState(1);
  const [inquireGuests, setInquireGuests] = useState(1);
  const [inquireLoading, setInquireLoading] = useState(false);
  const [inquireError, setInquireError] = useState('');
  const [inquireSuccess, setInquireSuccess] = useState(false);















  const property = properties.find(p => p.id === id);















  useEffect(() => {







    async function loadBooking() {







      if (!currentUser?.id || !property?.id) { setActiveBooking(null); return; }







      setBookingLoading(true);







      const { data, error } = await supabase







        .from('bookings').select('*')







        .eq('guest_id', currentUser.id)







        .eq('property_id', property.id)







        .neq('booking_status', 'cancelled')







        .order('check_in', { ascending: false })







        .limit(1);







      if (!error && data && data.length > 0) setActiveBooking(data[0]);







      else setActiveBooking(null);







      setBookingLoading(false);







    }







    loadBooking();







  }, [currentUser?.id, property?.id]);















  // ── Now safe to return early ──







  if (!property) {







    return (







      <PhoneFrame>







        <div className="flex items-center justify-center h-full" style={{ background: '#080608' }}>







          <div style={{ color: 'white' }}>Property not found</div>







        </div>







      </PhoneFrame>







    );







  }















  const nights = checkIn && checkOut







    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))







    : 1;







  const roomRate = property.price * nights;







  const cleaningFee = property.cleaningFee || 0;







  const serviceFee = Math.round((roomRate + cleaningFee) * 0.1);







  const total = roomRate + cleaningFee + serviceFee;







  const todayStr = new Date().toISOString().slice(0, 10);















  const handleMessageHost = async () => {







    if (!currentUser) {







      if (confirm('Sign in to message the host?')) navigate('/login');







      return;







    }







    const mockBooking = {







      id: `booking-${Date.now()}`, propertyId: property.id, propertyTitle: property.title,







      propertyLocation: property.location, guestId: currentUser.id, guestName: currentUser.name,







      guestPhone: currentUser.phone, checkIn: new Date().toISOString(),







      checkOut: addDays(new Date(), 1).toISOString(), nights: 1,







      totalAmount: property.price, status: 'pending' as const, createdAt: new Date().toISOString(),







    };







    const conversationId = await createConversation(







      mockBooking, 'guest', property.title, property.hostId,







      '+2547' + Math.floor(Math.random() * 90000000 + 10000000)







    );







    navigate(`/conversation/${conversationId}`);







  };















  const handleCallHost = async () => {







    window.location.href = `tel:${'+2547' + Math.floor(Math.random() * 90000000 + 10000000)}`;







  };















  const handleInquire = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (!checkIn) { setInquireError('Please select a check-in date.'); return; }
    setInquireError('');
    setInquireLoading(true);
    try {
      const [hh, mm] = inquireTime.split(':').map(Number);
      const checkInTime = new Date(checkIn);
      checkInTime.setHours(hh, mm, 0, 0);
      const checkOutTime = new Date(checkInTime);
      checkOutTime.setDate(checkOutTime.getDate() + inquireNights);
      const checkInISO = checkInTime.toISOString();
      const checkOutISO = checkOutTime.toISOString();
      const totalAmount = property.price * inquireNights;
      const platformFee = parseFloat((totalAmount * 0.03).toFixed(2));
      const hostPayout = parseFloat((totalAmount - platformFee).toFixed(2));
      const { data: clashes } = await supabase
        .from('bookings').select('id')
        .eq('property_id', property.id)
        .in('booking_status', ['paid','checked_in'])
        .lt('check_in_time', checkOutISO)
        .gt('check_out_time', checkInISO);
      if (clashes && clashes.length > 0) {
        setInquireError('These dates are already taken. Please choose different dates.');
        setInquireLoading(false);
        return;
      }
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings').insert({
          property_id: property.id,
          guest_id: currentUser.id,
          host_id: property.hostId,
          booking_status: 'inquiry',
          check_in_time: checkInISO,
          check_out_time: checkOutISO,
          check_in: format(checkIn, 'yyyy-MM-dd'),
          check_out: format(checkOutTime, 'yyyy-MM-dd'),
          duration_nights: inquireNights,
          num_guests: inquireGuests,
          amount_paid: 0,
          amount_held: 0,
          platform_fee: platformFee,
          host_payout: hostPayout,
          nights: inquireNights,
          total_amount: totalAmount,
          property_title: property.title,
          property_location: property.location,
          guest_name: currentUser.name,
          guest_phone: currentUser.phone || '',
          base_amount: totalAmount,
          currency: 'KES',
        }).select('id').single();
      if (bookingErr || !booking) {
        setInquireError('Failed to send inquiry. Please try again.');
        setInquireLoading(false);
        return;
      }
      await supabase.from('notifications').insert({
        user_id: property.hostId,
        type: 'inquiry',
        title: 'New Booking Inquiry',
        body: currentUser.name + ' wants to book ' + property.title + ' for ' + inquireNights + ' night' + (inquireNights > 1 ? 's' : '') + ' starting ' + format(checkIn, 'MMM d'),
        data: { booking_id: booking.id, property_id: property.id, guest_id: currentUser.id },
      });
      const mockBooking = {
        id: booking.id,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        guestId: currentUser.id,
        guestName: currentUser.name,
        guestPhone: currentUser.phone || '',
        checkIn: format(checkInTime, 'yyyy-MM-dd'),
        checkOut: format(checkOutTime, 'yyyy-MM-dd'),
        nights: inquireNights,
        totalAmount: totalAmount,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      setShowInquireModal(false);
      setInquireSuccess(true);
      setTimeout(() => { navigate('/trips'); }, 1500);
    } catch (e) {
      setInquireError('Something went wrong. Please try again.');
    }
    setInquireLoading(false);
  };

  const handleBooking = async () => {







    if (!checkIn || !checkOut) return;







    if (!currentUser) { navigate('/login'); return; }







    setAvailabilityError(null);







    const checkInStr = format(checkIn, 'yyyy-MM-dd');







    const checkOutStr = format(checkOut, 'yyyy-MM-dd');







    const { data: clashes, error } = await supabase







      .from('bookings').select('id, check_in, check_out')







      .eq('property_id', property.id)







      .in('booking_status', ['inquiry','accepted','payment_pending','paid','checked_in'])







      .not('check_out', '<=', checkInStr)







      .not('check_in', '>=', checkOutStr);







    if (!error && clashes && clashes.length > 0) {







      setAvailabilityError('These dates are already taken. Please choose different dates.');







      return;







    }







    navigate(`/payment/${property.id}?checkIn=${checkInStr}&checkOut=${checkOutStr}&nights=${nights}`);







  };















  return (







    <PhoneFrame>







      {/* Background */}







      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>







        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #0e0b08 0%, #080608 40%, #060408 100%)' }} />







        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(232,184,109,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,109,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />







      </div>















      <BackRefreshBar />















      <div className="relative flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', zIndex: 1 }}>















        {/* HERO GALLERY */}







        {(() => {







          const allImgs = (property as any).images?.filter((u: string) => u?.startsWith('http')) ?? [];







          const imgs: string[] = allImgs.length ? allImgs : property.image?.startsWith('http') ? [property.image] : [];







          return (







            <div style={{ position: "relative", height: 260, background: "#0e0b08" }}>







              {imgs.length > 0 ? (







                <div







                  onScroll={(e) => { const el = e.currentTarget; setActiveIdx(Math.round(el.scrollLeft / el.clientWidth)); }} ref={(el) => { if (!el) return; let isDown = false; let startX = 0; let scrollLeft = 0; el.onmousedown = (e) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; }; el.onmouseleave = () => { isDown = false; }; el.onmouseup = () => { isDown = false; }; el.onmousemove = (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; const walk = (x - startX) * 2; el.scrollLeft = scrollLeft - walk; }; }}







                  style={{ display: "flex", overflowX: "auto", height: 260, scrollSnapType: "x mandatory", scrollbarWidth: "none" } as any}







                >







                  {imgs.map((src: string, i: number) => (







                    <motion.div key={i}







                      initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }}







                      transition={{ delay: i * 0.06, duration: 0.5 }}







                      style={{ minWidth: "100%", height: 260, scrollSnapAlign: "start", flexShrink: 0, position: "relative", overflow: "hidden" }}>







                      <img src={src} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />







                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 35%, rgba(8,6,8,0.8) 100%)" }} />







                    </motion.div>







                  ))}







                </div>







              ) : (







                <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, background: "linear-gradient(135deg, rgba(232,184,109,0.08), rgba(62,207,178,0.04))" }}>🏢</div>







              )}







              {imgs.length > 1 && (







                <>







                  <div style={{ position: "absolute", bottom: 38, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 10 }}>







                    {imgs.map((_: string, i: number) => (







                      <motion.div key={i}







                        animate={{ width: i === activeIdx ? 18 : 6, background: i === activeIdx ? "#E8B86D" : "rgba(255,255,255,0.4)" }}







                        style={{ height: 6, borderRadius: 3 }} transition={{ duration: 0.25 }} />







                    ))}







                  </div>







                  <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "white", fontWeight: 700, zIndex: 10 }}>







                    {activeIdx + 1} / {imgs.length}







                  </div>







                </>







              )}







              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(transparent, #080608)", zIndex: 5 }} />







              <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}







                onClick={() => navigate(-1)}







                style={{ position: "absolute", top: 56, left: 20, width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(232,184,109,0.2)", background: "rgba(8,6,8,0.8)", backdropFilter: "blur(16px)", cursor: "pointer", zIndex: 10, color: "white" }}>







                ←







              </motion.button>







            </div>







          );







        })()}















        {/* BODY */}







        <div className="px-5 py-4">















          {/* Tags */}







          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mb-3 flex-wrap">







            {property.verified && (







              <div className="text-[10px] px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 font-bold tracking-wide"







                style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.25)', color: '#3ECFB2' }}>







                <VerifiedBadge size="sm" /> Verified Host







              </div>







            )}







            {property.instantBook && (







              <div className="text-[10px] px-3 py-1.5 rounded-full uppercase font-bold tracking-wide"







                style={{ background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.25)', color: '#E8B86D' }}>







                ⚡ Instant Book







              </div>







            )}







            {property.responseTime && (







              <div className="text-[10px] px-3 py-1.5 rounded-full font-medium"







                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>







                🕐 {property.responseTime}







              </div>







            )}







          </motion.div>















          {/* Title */}







          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}







            className="leading-tight mb-1.5"







            style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 900, color: 'white' }}>







            {property.title}







          </motion.h1>







          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}







            className="text-[12px] mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>







            📍 {property.location} · 2.1km from CBD







          </motion.div>















          {/* Stats */}







          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}







            className="flex gap-2 mb-5">







            {[







              { value: property.rating, label: '⭐ Rating' },







              { value: property.reviews, label: 'Reviews' },







              { value: property.guests, label: 'Guests' },







              { value: property.beds, label: 'Beds' },







            ].map((stat, i) => (







              <div key={i} className="flex-1 py-3 rounded-[14px] text-center"







                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>







                <div className="text-[16px] font-bold" style={{ color: 'white' }}>{stat.value}</div>







                <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</div>







              </div>







            ))}







          </motion.div>















          {/* Date Picker */}







          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-5">







            <div className="text-[13px] font-bold mb-2.5" style={{ color: 'white' }}>







              <span style={{ color: '#E8B86D' }}>📅</span> Select Dates







            </div>







            <DatePicker checkIn={checkIn} checkOut={checkOut} onCheckInChange={setCheckIn} onCheckOutChange={setCheckOut} />







          </motion.div>















          {/* Active booking */}







          {currentUser && (







            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-5">







              {bookingLoading ? (







                <div className="rounded-[16px] p-4 text-[12px]"







                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>







                  {t('property.checking_stays')}…







                </div>







              ) : activeBooking ? (







                <div className="rounded-[16px] p-4 relative overflow-hidden"







                  style={{ background: 'linear-gradient(135deg, rgba(232,184,109,0.07), rgba(255,255,255,0.02))', border: '1px solid rgba(232,184,109,0.15)' }}>







                  <div className="flex items-center justify-between mb-2">







                    <div className="text-[10px] px-2.5 py-1 rounded-full uppercase font-bold"







                      style={{ background: 'rgba(232,184,109,0.12)', color: activeBooking.booking_status === 'cancelled' ? '#FF6B6B' : '#E8B86D', border: '1px solid rgba(232,184,109,0.2)' }}>







                      {activeBooking.booking_status}







                    </div>







                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Your stay</div>







                  </div>







                  <div className="text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>







                    📅 {activeBooking.check_in} → {activeBooking.check_out} ({activeBooking.nights} {activeBooking.nights === 1 ? 'night' : 'nights'})







                  </div>







                  <div className="text-[12px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>







                    Total: <span style={{ color: '#E8B86D', fontWeight: 700 }}>Ksh {activeBooking.total_amount?.toLocaleString()}</span>







                  </div>







                  <div className="flex flex-wrap gap-2">







                    {activeBooking.booking_status === 'confirmed' && activeBooking.check_in > todayStr && (







                      <button onClick={async () => {







                        const { error } = await supabase.from('bookings').update({ booking_status: 'cancelled' }).eq('id', activeBooking.id);







                        if (!error) setActiveBooking({ ...activeBooking, booking_status: 'cancelled' });







                      }} className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[11px] font-bold"







                        style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>







                        Cancel booking







                      </button>







                    )}







                    {activeBooking.booking_status === 'confirmed' && activeBooking.check_in <= todayStr && activeBooking.check_out > todayStr && (







                      <button onClick={async () => {







                        const { error } = await supabase.from('bookings').update({ booking_status: 'in_stay' }).eq('id', activeBooking.id);







                        if (!error) setActiveBooking({ ...activeBooking, booking_status: 'in_stay' });







                      }} className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[11px] font-bold"







                        style={{ background: 'rgba(62,207,178,0.12)', color: '#3ECFB2', border: '1px solid rgba(62,207,178,0.25)' }}>







                        Check in







                      </button>







                    )}







                    {activeBooking.booking_status === 'in_stay' && activeBooking.check_out <= todayStr && (







                      <button onClick={async () => {







                        const { error } = await supabase.from('bookings').update({ booking_status: 'completed' }).eq('id', activeBooking.id);







                        if (!error) setActiveBooking({ ...activeBooking, booking_status: 'completed' });







                      }} className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[11px] font-bold"







                        style={{ background: 'rgba(62,207,178,0.12)', color: '#3ECFB2', border: '1px solid rgba(62,207,178,0.25)' }}>







                        Check out







                      </button>







                    )}







                  </div>







                </div>







              ) : null}







            </motion.div>







          )}















          {/* Availability error */}







          {availabilityError && (







            <div className="mb-4 text-[12px] px-3 py-2.5 rounded-[12px]"







              style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>







              ⚠️ {availabilityError}







            </div>







          )}















          {/* Price Breakdown */}







          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}







            className="rounded-[18px] p-4 mb-5 relative overflow-hidden"







            style={{ background: 'linear-gradient(135deg, rgba(232,184,109,0.07), rgba(255,255,255,0.02))', border: '1px solid rgba(232,184,109,0.14)' }}>







            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,109,0.2), transparent)' }} />







            <div className="text-[13px] font-bold mb-3" style={{ color: 'white' }}>💰 Price Details</div>







            <div className="flex justify-between text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>







              <span>Ksh {property.price.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>







              <span>Ksh {roomRate.toLocaleString()}</span>







            </div>







            {cleaningFee > 0 && (







              <div className="flex justify-between text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>







                <span>{t('property.cleaning_fee')}</span><span>Ksh {cleaningFee.toLocaleString()}</span>







              </div>







            )}







            <div className="flex justify-between text-[12px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>







              <span>{t('property.service_fee')}</span><span>Ksh {serviceFee.toLocaleString()}</span>







            </div>







            <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>







              <span className="text-[14px] font-bold" style={{ color: 'white' }}>Total</span>







              <span className="text-[16px] font-bold" style={{ color: '#E8B86D' }}>Ksh {total.toLocaleString()}</span>







            </div>







          </motion.div>















          {/* Amenities */}







          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-5">







            <div className="text-[13px] font-bold mb-2.5" style={{ color: 'white' }}>✨ What this place offers</div>







            <div className="flex flex-wrap gap-2">







              {property.amenities.map((amenity, index) => (







                <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px]"







                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>







                  {amenity}







                </div>







              ))}







            </div>







          </motion.div>















          {/* Description */}







          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-5">







            <div className="text-[13px] font-bold mb-2" style={{ color: 'white' }}>🏠 About this space</div>







            <div className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{property.description}</div>







          </motion.div>















          {/* Host Info */}







          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}







            className="rounded-[18px] p-4 mb-5"







            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>







            <div className="flex items-center gap-3 mb-4">







              <div className="w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold flex-shrink-0"







                style={{ background: 'linear-gradient(145deg, #F7DC8A, #E8B86D, #C8843A)', color: '#1a0800', boxShadow: '0 8px 20px rgba(232,184,109,0.3)' }}>







                {property.hostName[0]}







              </div>







              <div className="flex-1">







                <div className="text-[14px] font-bold flex items-center gap-1.5 mb-0.5" style={{ color: 'white' }}>







                  {property.hostName} {property.verified && <VerifiedBadge size="sm" />}







                </div>







                <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>







                  Joined {property.hostJoined} · {property.hostProperties} properties







                </div>







              </div>







              {property.responseRate && (







                <div className="text-right">







                  <div className="text-[13px] font-bold" style={{ color: '#E8B86D' }}>{property.responseRate}%</div>







                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>response</div>







                </div>







              )}







            </div>







            <div className="flex gap-2">







              <button onClick={handleMessageHost}







                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] border-none cursor-pointer text-[12px] font-bold"







                style={{ background: currentUser ? 'rgba(62,207,178,0.15)' : 'rgba(255,255,255,0.05)', color: currentUser ? '#3ECFB2' : 'rgba(255,255,255,0.3)', border: `1px solid ${currentUser ? 'rgba(62,207,178,0.3)' : 'rgba(255,255,255,0.08)'}` }}>







                💬 Message







              </button>







              <button onClick={handleCallHost}







                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] border-none cursor-pointer text-[12px] font-bold"







                style={{ background: 'rgba(232,184,109,0.12)', color: '#E8B86D', border: '1px solid rgba(232,184,109,0.25)' }}>







                📞 Call







              </button>







            </div>







          </motion.div>















          {/* House Rules */}







          {property.houseRules && property.houseRules.length > 0 && (







            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mb-5">







              <div className="text-[13px] font-bold mb-2.5" style={{ color: 'white' }}>📋 House Rules</div>







              <div className="rounded-[16px] p-4"







                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>







                {property.houseRules.slice(0, showMore ? undefined : 3).map((rule, index) => (







                  <div key={index} className="flex items-start gap-2 mb-2 last:mb-0 text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>







                    <span style={{ color: '#E8B86D', fontSize: 8, marginTop: 5 }}>◆</span>







                    <span>{rule}</span>







                  </div>







                ))}







                {property.houseRules.length > 3 && (







                  <button onClick={() => setShowMore(!showMore)}







                    className="text-[12px] mt-2 border-none bg-transparent cursor-pointer font-bold"







                    style={{ color: '#E8B86D' }}>







                    {showMore ? 'Show less' : `Show all ${property.houseRules.length} rules`}







                  </button>







                )}







              </div>







            </motion.div>







          )}















          {/* Cancellation Policy */}







          {property.cancellationPolicy && (







            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-28">







              <div className="text-[13px] font-bold mb-2.5" style={{ color: 'white' }}>🛡️ Cancellation Policy</div>







              <div className="rounded-[16px] p-4 text-[12px] leading-relaxed"







                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>







                {property.cancellationPolicy}







              </div>







            </motion.div>







          )}







        </div>







      </div>















      {/* BOOK FOOTER */}







      <div className="relative px-5 pt-4 pb-6"







        style={{ background: 'rgba(8,6,8,0.97)', borderTop: '1px solid rgba(232,184,109,0.1)', backdropFilter: 'blur(20px)' }}>







        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,109,0.2), transparent)' }} />







        <div className="flex items-center gap-4">







          <div>







            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: '#E8B86D' }}>







              Ksh {total.toLocaleString()}







            </div>







            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>







              {nights} {nights === 1 ? 'night' : 'nights'} total







            </div>







          </div>







          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { if (!currentUser) { navigate('/login'); return; } setInquireError(''); setShowInquireModal(true); }}







            className="flex-1 py-4 px-4 rounded-[16px] border-none cursor-pointer relative overflow-hidden"







            style={{ background: 'linear-gradient(135deg, #F7DC8A, #E8B86D, #C8843A)', boxShadow: '0 12px 32px rgba(232,184,109,0.4)' }}>







            <div className="absolute inset-0 rounded-[16px]" style={{ background: 'linear-gradient(105deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />







            <span className="relative font-bold" style={{ fontSize: 15, color: '#1a0800' }}>







              {'Inquire'}







            </span>







          </motion.button>







        </div>







      </div>







      <BottomNav />







    
      {showInquireModal && (
        <div style={{ position:'absolute', inset:0, zIndex:60, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background:'linear-gradient(170deg,#061412,#03020a)', borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', border:'1px solid rgba(62,207,178,0.15)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:2, marginBottom:2 }}>SEND INQUIRY</div>
                <div style={{ fontSize:18, fontWeight:900, color:'white', fontFamily:'var(--font-playfair)' }}>{property.title}</div>
              </div>
              <button onClick={() => setShowInquireModal(false)} style={{ width:34, height:34, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.25)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:16 }}>x</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:1, marginBottom:6 }}>CHECK-IN DATE</div>
                <input type="date" value={checkIn ? format(checkIn,'yyyy-MM-dd') : ''} min={format(addDays(new Date(),1),'yyyy-MM-dd')}
                  onChange={e => setCheckIn(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(62,207,178,0.2)', color:'white', fontSize:13, boxSizing:'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:1, marginBottom:6 }}>CHECK-IN TIME</div>
                <input type="time" value={inquireTime} onChange={e => setInquireTime(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(62,207,178,0.2)', color:'white', fontSize:13, boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:1, marginBottom:6 }}>NIGHTS</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => setInquireNights(n => Math.max(1, n-1))} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.3)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:18, fontWeight:700 }}>-</button>
                  <span style={{ color:'white', fontWeight:700, fontSize:16, minWidth:20, textAlign:'center' }}>{inquireNights}</span>
                  <button onClick={() => setInquireNights(n => n+1)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.3)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:18, fontWeight:700 }}>+</button>
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(62,207,178,0.6)', letterSpacing:1, marginBottom:6 }}>GUESTS</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => setInquireGuests(n => Math.max(1, n-1))} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.3)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:18, fontWeight:700 }}>-</button>
                  <span style={{ color:'white', fontWeight:700, fontSize:16, minWidth:20, textAlign:'center' }}>{inquireGuests}</span>
                  <button onClick={() => setInquireGuests(n => Math.min(property.guests || 10, n+1))} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid rgba(62,207,178,0.3)', background:'rgba(62,207,178,0.08)', color:'#3ECFB2', cursor:'pointer', fontSize:18, fontWeight:700 }}>+</button>
                </div>
              </div>
            </div>
            <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(62,207,178,0.06)', border:'1px solid rgba(62,207,178,0.15)', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Ksh {property.price.toLocaleString()} x {inquireNights} night{inquireNights > 1 ? 's' : ''}</span>
                <span style={{ fontSize:13, color:'white' }}>Ksh {(property.price * inquireNights).toLocaleString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Platform fee (3%)</span>
                <span style={{ fontSize:13, color:'white' }}>Ksh {Math.round(property.price * inquireNights * 0.03).toLocaleString()}</span>
              </div>
              <div style={{ borderTop:'1px solid rgba(62,207,178,0.15)', paddingTop:8, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:14, fontWeight:700, color:'white' }}>Total</span>
                <span style={{ fontSize:14, fontWeight:700, color:'#E8B86D' }}>Ksh {(property.price * inquireNights).toLocaleString()}</span>
              </div>
            </div>
            {!!inquireError && (
              <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.2)', color:'#FF6B6B', fontSize:13, marginBottom:12 }}>{inquireError}</div>
            )}
            {inquireSuccess && (
              <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(62,207,178,0.1)', border:'1px solid rgba(62,207,178,0.2)', color:'#3ECFB2', fontSize:13, marginBottom:12 }}>Inquiry sent! Opening chat...</div>
            )}
            <button disabled={inquireLoading} onClick={handleInquire}
              style={{ width:'100%', padding:'14px', borderRadius:16, border:'none', cursor: inquireLoading ? 'not-allowed' : 'pointer', background: inquireLoading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#E8B86D,#C8843A)', color: inquireLoading ? 'rgba(255,255,255,0.3)' : '#1a0800', fontWeight:800, fontSize:15 }}>
              {inquireLoading ? 'Sending...' : 'Send Inquiry'}
            </button>
          </motion.div>
        </div>
      )}
</PhoneFrame>







  );







}







