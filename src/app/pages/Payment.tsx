import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import PhoneFrame from '../components/PhoneFrame';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import BackRefreshBar from '../components/BackRefreshBar';
import BottomNav from '../components/BottomNav';
import { GUEST_SERVICE_FEE_RATE } from '../config/pricing';

export default function Payment() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { properties, currentUser, loading: appLoading } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  // Once auth is resolved and there is no user, send to login
  useEffect(() => {
    if (!appLoading && !currentUser) {
      navigate('/login');
    }
  }, [appLoading, currentUser, navigate]);
  
  const property = properties.find(p => p.id === propertyId);

  // While auth is still resolving, show a lightweight loading screen
  if (appLoading && !currentUser) {
    return (
      <PhoneFrame>
        <BackRefreshBar />
        <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--lala-white)' }}>
          Loading…
        </div>
      </PhoneFrame>
    );
  }

  // If there is still no user once loading is done, navigation effect will redirect
  if (!currentUser) {
    return null;
  }

  const hasPhoneNumber = (currentUser.phone || '').replace(/\D/g, '').length >= 9;

  if (!property) {
    return (
      <PhoneFrame>
        <BackRefreshBar />
        <div className="flex items-center justify-center h-full">
          <div style={{ color: 'var(--lala-white)' }}>Property not found</div>
        </div>
      </PhoneFrame>
    );
  }

  // Booking checkout requires a phone number (needed for M-Pesa STK Push)
  if (!hasPhoneNumber) {
    return (
      <PhoneFrame>
        <BackRefreshBar />
        <div className="flex-1 overflow-y-auto px-6 pt-14 pb-24" style={{ scrollbarWidth: 'none' }}>
          <div className="text-[22px] mb-2" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>
            Add your phone number
          </div>
          <div className="text-[13px] mb-5" style={{ color: 'var(--lala-muted)', lineHeight: 1.6 }}>
            To pay with M-Pesa and book instantly, your account must have a phone number saved.
          </div>

          <div className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
            <div className="text-[13px]" style={{ color: 'var(--lala-soft)' }}>
              Property: <span style={{ color: 'var(--lala-white)', fontWeight: 600 }}>{property.title}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile/personal')}
            className="w-full py-4 rounded-[14px] border-none cursor-pointer mb-3"
            style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', color: 'var(--lala-night)', fontWeight: 800 }}
          >
            Add phone number →
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-[14px] border-none cursor-pointer"
            style={{ background: 'transparent', border: '1px solid var(--lala-border)', color: 'var(--lala-soft)', fontWeight: 600 }}
          >
            ← Back
          </button>
        </div>
        <BottomNav />
      </PhoneFrame>
    );
  }

  const nights = parseInt(searchParams.get('nights') || '1');
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  
  const roomRate = property.price * nights;
  const cleaningFee = property.cleaningFee || 0;
  const baseSubtotal = roomRate + cleaningFee;
  const serviceFee = Math.round(baseSubtotal * GUEST_SERVICE_FEE_RATE);
  const mpesaFee = 0;
  const total = baseSubtotal + serviceFee + mpesaFee;

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate M-Pesa STK Push
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment successful! Booking confirmed.');
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }, 2500);
  };

  return (
    <PhoneFrame>
      <BackRefreshBar />
      {/* Header */}
      <div 
        className="px-6 pt-14 pb-6 text-center"
        style={{ borderBottom: '1px solid var(--lala-border)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-[30px] mb-4"
          style={{ background: '#00a651' }}
        >
          <span className="text-[18px]">📱</span>
          <span 
            className="text-[18px]"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '1px'
            }}
          >
            M-PESA
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div 
            className="text-[22px] mb-1.5"
            style={{
              fontFamily: 'var(--font-playfair)',
              color: 'var(--lala-white)',
              fontWeight: 700
            }}
          >
            Confirm Payment
          </div>
          <div 
            className="text-[13px]"
            style={{ color: 'var(--lala-muted)' }}
          >
            Secure checkout via M-Pesa STK Push
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'none' }}>
        {/* Payment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[20px] p-5 mb-5"
          style={{
            background: 'var(--lala-card)',
            border: '1px solid var(--lala-border)'
          }}
        >
          {/* Property Info */}
          <div className="flex gap-3.5 items-center mb-4">
            <div 
              className="w-[60px] h-[60px] rounded-[14px] flex items-center justify-center text-[26px] flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(232,184,109,0.2), rgba(62,207,178,0.1))'
              }}
            >
              {property.image?.startsWith("http") ? <img src={property.image} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }} /> : null}
            </div>
            <div>
              <div 
                className="text-[15px] mb-1"
                style={{
                  fontWeight: 600,
                  color: 'var(--lala-white)'
                }}
              >
                {property.title}
              </div>
              <div 
                className="text-[12px]"
                style={{ color: 'var(--lala-muted)' }}
              >
                {checkInStr && checkOutStr ? (
                  <>
                    📅 {format(new Date(checkInStr), 'MMM dd')} – {format(new Date(checkOutStr), 'MMM dd')} · {nights} {nights === 1 ? 'night' : 'nights'}
                  </>
                ) : (
                  `📅 {nights} ${nights === 1 ? 'night' : 'nights'}`
                )}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div 
            className="pt-4"
            style={{ borderTop: '1px solid var(--lala-border)' }}
          >
            <div className="flex justify-between text-[13px] mb-2.5" style={{ color: 'var(--lala-soft)' }}>
              <span>Room rate ({nights} {nights === 1 ? 'night' : 'nights'})</span>
              <span>Ksh {roomRate.toLocaleString()}</span>
            </div>
            {cleaningFee > 0 && (
              <div className="flex justify-between text-[13px] mb-2.5" style={{ color: 'var(--lala-soft)' }}>
                <span>Cleaning fee</span>
                <span>Ksh {cleaningFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px] mb-2.5" style={{ color: 'var(--lala-soft)' }}>
              <span>Service fee</span>
              <span>Ksh {serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px] mb-2.5" style={{ color: 'var(--lala-soft)' }}>
              <span>M-Pesa fee</span>
              <span>Ksh {mpesaFee}</span>
            </div>
            
            <div 
              className="flex justify-between text-[16px] pt-2.5 mt-1"
              style={{
                borderTop: '1px solid var(--lala-border)',
                fontWeight: 700,
                color: 'var(--lala-white)'
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--lala-gold)' }}>Ksh {total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Phone Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div 
            className="text-[13px] mb-2"
            style={{
              color: 'var(--lala-soft)',
              fontWeight: 500
            }}
          >
            Your Safaricom Number
          </div>
          
          <div 
            className="rounded-[14px] p-4 flex items-center gap-3 mb-5"
            style={{
              background: 'var(--lala-card)',
              border: '1px solid var(--lala-border)'
            }}
          >
            <div 
              className="text-[14px] pr-3"
              style={{
                fontWeight: 600,
                color: 'var(--lala-gold)',
                borderRight: '1px solid var(--lala-border)'
              }}
            >
              🇰🇪 +254
            </div>
            <div 
              className="text-[16px]"
              style={{
                fontWeight: 600,
                color: 'var(--lala-white)',
                letterSpacing: '1px'
              }}
            >
              {(currentUser.phone || '').replace('+254', '')}
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 rounded-[14px] border-none cursor-pointer mb-3"
            style={{
              background: isProcessing ? 'var(--lala-muted)' : '#00a651',
              color: 'white',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '15px',
              fontWeight: 700,
              boxShadow: isProcessing ? 'none' : '0 8px 24px rgba(0,166,81,0.25)',
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Processing...' : `Pay Ksh ${total.toLocaleString()} with M-Pesa`}
          </button>

          {/* Secure Notice */}
          <div 
            className="text-center text-[12px] flex items-center justify-center gap-1.5"
            style={{ color: 'var(--lala-muted)' }}
          >
            🔒 Secured by Safaricom Daraja API
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 mt-3 rounded-[14px] border-none cursor-pointer"
            style={{
              background: 'transparent',
              color: 'var(--lala-soft)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            ← Back to Property
          </button>
        </motion.div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
