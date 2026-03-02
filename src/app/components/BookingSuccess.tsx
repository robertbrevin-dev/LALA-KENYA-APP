import { motion } from 'motion/react';

interface BookingSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    propertyTitle: string;
    checkIn: string;
    checkOut: string;
    total: number;
    confirmationCode: string;
  };
}

export default function BookingSuccess({ isOpen, onClose, bookingDetails }: BookingSuccessProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[360px] w-full rounded-[24px] p-6 text-center"
        style={{
          background: 'var(--lala-card)',
          border: '1px solid var(--lala-border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-[40px]"
          style={{
            background: 'linear-gradient(135deg, var(--lala-teal), #2AA893)',
            boxShadow: '0 10px 30px rgba(62,207,178,0.3)'
          }}
        >
          ✓
        </motion.div>

        {/* Title */}
        <h2 
          className="text-[24px] mb-2"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontWeight: 900,
            color: 'var(--lala-white)'
          }}
        >
          Booking Confirmed!
        </h2>

        <p 
          className="text-[14px] mb-5"
          style={{ color: 'var(--lala-soft)' }}
        >
          Your reservation has been successfully confirmed.
        </p>

        {/* Booking Details */}
        <div 
          className="rounded-[16px] p-4 mb-5 text-left"
          style={{
            background: 'var(--lala-deep)',
            border: '1px solid var(--lala-border)'
          }}
        >
          <div 
            className="text-[12px] mb-2"
            style={{ color: 'var(--lala-muted)' }}
          >
            Confirmation Code
          </div>
          <div 
            className="text-[20px] mb-4 tracking-wider"
            style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'var(--lala-gold)'
            }}
          >
            {bookingDetails.confirmationCode}
          </div>

          <div 
            className="text-[13px] mb-1.5"
            style={{
              fontWeight: 600,
              color: 'var(--lala-white)'
            }}
          >
            {bookingDetails.propertyTitle}
          </div>
          
          <div 
            className="text-[12px] mb-2"
            style={{ color: 'var(--lala-soft)' }}
          >
            {bookingDetails.checkIn} – {bookingDetails.checkOut}
          </div>

          <div 
            className="text-[16px] pt-2"
            style={{
              borderTop: '1px solid var(--lala-border)',
              fontWeight: 700,
              color: 'var(--lala-gold)'
            }}
          >
            Ksh {bookingDetails.total.toLocaleString()}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-[14px] border-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
            color: 'var(--lala-night)',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '15px',
            fontWeight: 700
          }}
        >
          View My Bookings
        </button>
      </motion.div>
    </motion.div>
  );
}
