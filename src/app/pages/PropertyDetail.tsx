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

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, currentUser } = useApp();
  
  const property = properties.find(p => p.id === id);
  
  const [checkIn, setCheckIn] = useState<Date | null>(addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState<Date | null>(addDays(new Date(), 2));
  const [showMore, setShowMore] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  if (!property) {
    return (
      <PhoneFrame>
        <div className="flex items-center justify-center h-full">
          <div style={{ color: 'var(--lala-white)' }}>Property not found</div>
        </div>
      </PhoneFrame>
    );
  }

  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 1;
  const roomRate = property.price * nights;
  const cleaningFee = property.cleaningFee || 0;
  const serviceFee = Math.round((roomRate + cleaningFee) * 0.1);
  const total = roomRate + cleaningFee + serviceFee;

  // Load any existing booking for this guest & property
  useEffect(() => {
    async function loadBooking() {
      if (!currentUser?.id) {
        setActiveBooking(null);
        return;
      }
      setBookingLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_id', currentUser.id)
        .eq('property_id', property.id)
        .neq('booking_status', 'cancelled')
        .order('check_in', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0) {
        setActiveBooking(data[0]);
      } else {
        setActiveBooking(null);
      }
      setBookingLoading(false);
    }
    loadBooking();
  }, [currentUser?.id, property.id]);

  const handleBooking = async () => {
    if (checkIn && checkOut) {
      // Require an account for checkout
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setAvailabilityError(null);
      const checkInStr = format(checkIn, 'yyyy-MM-dd');
      const checkOutStr = format(checkOut, 'yyyy-MM-dd');

      // Prevent double-booking: look for overlapping bookings for this property
      const { data: clashes, error } = await supabase
        .from('bookings')
        .select('id, check_in, check_out')
        .eq('property_id', property.id)
        .in('booking_status', ['pending', 'confirmed', 'in_stay', 'completed'])
        .not('check_out', '<=', checkInStr)
        .not('check_in', '>=', checkOutStr);

      if (!error && clashes && clashes.length > 0) {
        setAvailabilityError('These dates are already taken for this property. Please choose different dates.');
        return;
      }

      navigate(`/payment/${property.id}?checkIn=${checkInStr}&checkOut=${checkOutStr}&nights=${nights}`);
    }
  };

  return (
    <PhoneFrame>
      <BackRefreshBar />
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Hero Image */}
        <div 
          className="h-[260px] relative flex items-center justify-center text-[60px]"
          style={{
            background: `linear-gradient(180deg, 
              rgba(232,184,109,0.12) 0%, 
              rgba(62,207,178,0.06) 50%,
              var(--lala-night) 100%)`
          }}
        >
          {property.image}
          
          {/* Gradient Overlay */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[100px]"
            style={{
              background: 'linear-gradient(transparent, var(--lala-night))'
            }}
          />

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="absolute top-[60px] left-5 w-[38px] h-[38px] rounded-[12px] flex items-center justify-center text-[16px] border-none cursor-pointer z-10"
            style={{
              background: 'rgba(13,15,20,0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            ←
          </motion.button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Tags */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mb-3 flex-wrap"
          >
            {property.verified && (
              <div 
                className="text-[11px] px-3 py-1.5 rounded-[20px] uppercase flex items-center gap-1.5"
                style={{
                  background: 'rgba(62,207,178,0.12)',
                  border: '1px solid rgba(62,207,178,0.2)',
                  color: 'var(--lala-teal)',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
              >
                <VerifiedBadge size="sm" />
                Verified Host
              </div>
            )}
            {property.instantBook && (
              <div 
                className="text-[11px] px-3 py-1.5 rounded-[20px] uppercase"
                style={{
                  background: 'rgba(232,184,109,0.12)',
                  border: '1px solid rgba(232,184,109,0.2)',
                  color: 'var(--lala-gold)',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
              >
                ⚡ Instant Book
              </div>
            )}
            {property.responseTime && (
              <div 
                className="text-[11px] px-3 py-1.5 rounded-[20px]"
                style={{
                  background: 'var(--lala-card)',
                  border: '1px solid var(--lala-border)',
                  color: 'var(--lala-soft)',
                  fontWeight: 500
                }}
              >
                Response: {property.responseTime}
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[24px] mb-2 leading-tight"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 900,
              color: 'var(--lala-white)'
            }}
          >
            {property.title}
          </motion.h1>

          {/* Address */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[13px] mb-4"
            style={{ color: 'var(--lala-soft)' }}
          >
            📍 {property.location} · 2.1km from CBD
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mb-5 p-4 rounded-[16px]"
            style={{
              background: 'var(--lala-card)',
              border: '1px solid var(--lala-border)'
            }}
          >
            <div className="flex-1 text-center">
              <div 
                className="text-[18px] mb-0.5"
                style={{
                  fontWeight: 700,
                  color: 'var(--lala-white)'
                }}
              >
                {property.rating}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>
                ⭐ Rating
              </div>
            </div>
            
            <div className="w-px" style={{ background: 'var(--lala-border)' }} />
            
            <div className="flex-1 text-center">
              <div 
                className="text-[18px] mb-0.5"
                style={{
                  fontWeight: 700,
                  color: 'var(--lala-white)'
                }}
              >
                {property.reviews}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>
                Reviews
              </div>
            </div>
            
            <div className="w-px" style={{ background: 'var(--lala-border)' }} />
            
            <div className="flex-1 text-center">
              <div 
                className="text-[18px] mb-0.5"
                style={{
                  fontWeight: 700,
                  color: 'var(--lala-white)'
                }}
              >
                {property.guests}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>
                Guests
              </div>
            </div>
            
            <div className="w-px" style={{ background: 'var(--lala-border)' }} />
            
            <div className="flex-1 text-center">
              <div 
                className="text-[18px] mb-0.5"
                style={{
                  fontWeight: 700,
                  color: 'var(--lala-white)'
                }}
              >
                {property.beds}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>
                Beds
              </div>
            </div>
          </motion.div>

          {/* Date Picker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-5"
          >
            <div 
              className="text-[14px] mb-2.5"
              style={{
                fontWeight: 600,
                color: 'var(--lala-white)'
              }}
            >
              Select Dates
            </div>
            <DatePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
            />
          </motion.div>

          {/* Existing booking panel for this property */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-5"
            >
              {bookingLoading ? (
                <div
                  className="rounded-[16px] p-4 text-[13px]"
                  style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-soft)' }}
                >
                  Checking your stays for this property…
                </div>
              ) : activeBooking ? (
                <div
                  className="rounded-[16px] p-4 text-[13px]"
                  style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}
                >
                  <div
                    className="flex items-center justify-between mb-2"
                  >
                    <div
                      className="text-[12px] px-2.5 py-1 rounded-[20px] uppercase"
                      style={{
                        background:
                          activeBooking.booking_status === 'in_stay'
                            ? 'rgba(62,207,178,0.2)'
                            : activeBooking.booking_status === 'completed'
                              ? 'rgba(62,207,178,0.15)'
                              : 'rgba(232,184,109,0.12)',
                        color:
                          activeBooking.booking_status === 'cancelled'
                            ? '#FF6B6B'
                            : 'var(--lala-gold)',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {activeBooking.booking_status}
                    </div>
                    <div
                      className="text-[12px]"
                      style={{ color: 'var(--lala-muted)' }}
                    >
                      Your stay on this property
                    </div>
                  </div>
                  <div
                    className="text-[13px] mb-2"
                    style={{ color: 'var(--lala-soft)' }}
                  >
                    📅 {activeBooking.check_in} → {activeBooking.check_out} ({activeBooking.nights}{' '}
                    {activeBooking.nights === 1 ? 'night' : 'nights'})
                  </div>
                  <div
                    className="text-[13px] mb-3"
                    style={{ color: 'var(--lala-soft)' }}
                  >
                    Total paid: <span style={{ color: 'var(--lala-gold)', fontWeight: 600 }}>Ksh {activeBooking.total_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Guest-side lifecycle buttons, same rules as Trips */}
                    {activeBooking.booking_status === 'confirmed' &&
                      activeBooking.check_in > new Date().toISOString().slice(0, 10) && (
                        <button
                          onClick={async () => {
                            const { error } = await supabase
                              .from('bookings')
                              .update({ booking_status: 'cancelled' })
                              .eq('id', activeBooking.id);
                            if (!error) {
                              setActiveBooking({ ...activeBooking, booking_status: 'cancelled' });
                            }
                          }}
                          className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                          style={{
                            background: 'rgba(255,107,107,0.12)',
                            border: '1px solid rgba(255,107,107,0.25)',
                            color: '#FF6B6B',
                          }}
                        >
                          Cancel booking
                        </button>
                      )}
                    {activeBooking.booking_status === 'confirmed' &&
                      activeBooking.check_in <= new Date().toISOString().slice(0, 10) &&
                      activeBooking.check_out > new Date().toISOString().slice(0, 10) && (
                        <button
                          onClick={async () => {
                            const { error } = await supabase
                              .from('bookings')
                              .update({ booking_status: 'in_stay' })
                              .eq('id', activeBooking.id);
                            if (!error) {
                              setActiveBooking({ ...activeBooking, booking_status: 'in_stay' });
                            }
                          }}
                          className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                          style={{
                            background: 'var(--lala-card)',
                            border: '1px solid var(--lala-border)',
                            color: 'var(--lala-white)',
                          }}
                        >
                          Check in
                        </button>
                      )}
                    {activeBooking.booking_status === 'in_stay' &&
                      activeBooking.check_out <= new Date().toISOString().slice(0, 10) && (
                        <button
                          onClick={async () => {
                            const { error } = await supabase
                              .from('bookings')
                              .update({ booking_status: 'completed' })
                              .eq('id', activeBooking.id);
                            if (!error) {
                              setActiveBooking({ ...activeBooking, booking_status: 'completed' });
                            }
                          }}
                          className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px]"
                          style={{
                            background: 'var(--lala-card)',
                            border: '1px solid var(--lala-border)',
                            color: 'var(--lala-white)',
                          }}
                        >
                          Check out
                        </button>
                      )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {availabilityError && (
            <div
              className="mb-4 text-[12px] px-3 py-2 rounded-[10px]"
              style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}
            >
              {availabilityError}
            </div>
          )}

          {/* Price Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-[16px] p-4 mb-5"
            style={{
              background: 'var(--lala-card)',
              border: '1px solid var(--lala-border)'
            }}
          >
            <div 
              className="text-[13px] mb-3"
              style={{
                fontWeight: 600,
                color: 'var(--lala-white)'
              }}
            >
              Price Details
            </div>
            <div className="flex justify-between text-[13px] mb-2" style={{ color: 'var(--lala-soft)' }}>
              <span>Ksh {property.price.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
              <span>Ksh {roomRate.toLocaleString()}</span>
            </div>
            {cleaningFee > 0 && (
              <div className="flex justify-between text-[13px] mb-2" style={{ color: 'var(--lala-soft)' }}>
                <span>Cleaning fee</span>
                <span>Ksh {cleaningFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px] mb-3" style={{ color: 'var(--lala-soft)' }}>
              <span>Service fee</span>
              <span>Ksh {serviceFee.toLocaleString()}</span>
            </div>
            <div 
              className="flex justify-between text-[15px] pt-3"
              style={{
                borderTop: '1px solid var(--lala-border)',
                fontWeight: 700,
                color: 'var(--lala-white)'
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--lala-gold)' }}>Ksh {total.toLocaleString()}</span>
            </div>
          </motion.div>

          {/* Amenities */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-5"
          >
            <div 
              className="text-[14px] mb-2.5"
              style={{
                fontWeight: 600,
                color: 'var(--lala-white)'
              }}
            >
              What this place offers
            </div>
            <div className="flex flex-wrap gap-2.5">
              {property.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px]"
                  style={{
                    background: 'var(--lala-card)',
                    border: '1px solid var(--lala-border)',
                    color: 'var(--lala-soft)'
                  }}
                >
                  {amenity}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-5"
          >
            <div 
              className="text-[14px] mb-2.5"
              style={{
                fontWeight: 600,
                color: 'var(--lala-white)'
              }}
            >
              About this space
            </div>
            <div className="text-[13px] leading-relaxed" style={{ color: 'var(--lala-soft)' }}>
              {property.description}
            </div>
          </motion.div>

          {/* Host Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-[16px] p-4 mb-5"
            style={{
              background: 'var(--lala-card)',
              border: '1px solid var(--lala-border)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-[18px] flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
                  fontWeight: 700,
                  color: 'var(--lala-night)'
                }}
              >
                {property.hostName[0]}
              </div>
              <div className="flex-1">
                <div 
                  className="text-[14px] mb-0.5 flex items-center gap-1.5"
                  style={{
                    fontWeight: 600,
                    color: 'var(--lala-white)'
                  }}
                >
                  Hosted by {property.hostName}
                  {property.verified && <VerifiedBadge size="sm" />}
                </div>
                <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>
                  Joined {property.hostJoined} · {property.hostProperties} properties
                </div>
              </div>
            </div>
            {property.responseRate && (
              <div className="flex gap-4">
                <div>
                  <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>Response rate</div>
                  <div 
                    className="text-[14px]"
                    style={{
                      fontWeight: 600,
                      color: 'var(--lala-white)'
                    }}
                  >
                    {property.responseRate}%
                  </div>
                </div>
                <div>
                  <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>Response time</div>
                  <div 
                    className="text-[14px]"
                    style={{
                      fontWeight: 600,
                      color: 'var(--lala-white)'
                    }}
                  >
                    {property.responseTime}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* House Rules */}
          {property.houseRules && property.houseRules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mb-5"
            >
              <div 
                className="text-[14px] mb-2.5"
                style={{
                  fontWeight: 600,
                  color: 'var(--lala-white)'
                }}
              >
                House Rules
              </div>
              <div 
                className="rounded-[16px] p-4"
                style={{
                  background: 'var(--lala-card)',
                  border: '1px solid var(--lala-border)'
                }}
              >
                {property.houseRules.slice(0, showMore ? undefined : 3).map((rule, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 mb-2 last:mb-0 text-[13px]"
                    style={{ color: 'var(--lala-soft)' }}
                  >
                    <span>•</span>
                    <span>{rule}</span>
                  </div>
                ))}
                {property.houseRules.length > 3 && (
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-[12px] mt-2 border-none bg-transparent cursor-pointer"
                    style={{
                      color: 'var(--lala-gold)',
                      fontWeight: 600
                    }}
                  >
                    {showMore ? 'Show less' : `Show all ${property.houseRules.length} rules`}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Cancellation Policy */}
          {property.cancellationPolicy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-20"
            >
              <div 
                className="text-[14px] mb-2.5"
                style={{
                  fontWeight: 600,
                  color: 'var(--lala-white)'
                }}
              >
                Cancellation Policy
              </div>
              <div 
                className="rounded-[16px] p-4 text-[13px] leading-relaxed"
                style={{
                  background: 'var(--lala-card)',
                  border: '1px solid var(--lala-border)',
                  color: 'var(--lala-soft)'
                }}
              >
                {property.cancellationPolicy}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Book Footer */}
      <div 
        className="sticky bottom-0 px-6 pt-4 pb-8 flex items-center justify-between gap-4"
        style={{
          background: 'var(--lala-deep)',
          borderTop: '1px solid var(--lala-border)'
        }}
      >
        <div>
          <div 
            className="text-[22px] mb-0"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 700,
              color: 'var(--lala-gold)'
            }}
          >
            Ksh {total.toLocaleString()}
          </div>
          <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>
            {nights} {nights === 1 ? 'night' : 'nights'} total
          </div>
        </div>

        <button
          onClick={handleBooking}
          className="flex-1 py-[15px] px-4 rounded-[14px] border-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
            color: 'var(--lala-night)',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.3px',
            boxShadow: '0 8px 24px rgba(232,184,109,0.25)'
          }}
        >
          {property.instantBook ? 'Book Instantly →' : 'Request to Book →'}
        </button>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
