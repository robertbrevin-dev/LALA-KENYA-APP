import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, differenceInDays, isBefore, startOfDay } from 'date-fns';

interface DatePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date) => void;
  onCheckOutChange: (date: Date) => void;
  minNights?: number;
}

export default function DatePicker({ 
  checkIn, 
  checkOut, 
  onCheckInChange, 
  onCheckOutChange,
  minNights = 1 
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);

  const today = startOfDay(new Date());
  const daysToShow = 60;
  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  const handleDateClick = (date: Date) => {
    if (selectingCheckIn) {
      onCheckInChange(date);
      setSelectingCheckIn(false);
      // Auto-set checkout to next day if not set
      if (!checkOut || isBefore(checkOut, addDays(date, minNights))) {
        onCheckOutChange(addDays(date, minNights));
      }
    } else {
      if (checkIn && differenceInDays(date, checkIn) >= minNights) {
        onCheckOutChange(date);
        setIsOpen(false);
        setSelectingCheckIn(true);
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  };

  const isDateDisabled = (date: Date) => {
    if (selectingCheckIn) return false;
    if (!checkIn) return true;
    return differenceInDays(date, checkIn) < minNights;
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-[16px] p-4 cursor-pointer"
        style={{
          background: 'var(--lala-card)',
          border: '1px solid var(--lala-border)'
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div 
              className="text-[11px] mb-1 uppercase"
              style={{
                color: 'var(--lala-muted)',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              Check-in
            </div>
            <div 
              className="text-[15px]"
              style={{
                color: checkIn ? 'var(--lala-white)' : 'var(--lala-muted)',
                fontWeight: 600
              }}
            >
              {checkIn ? format(checkIn, 'MMM dd') : 'Add date'}
            </div>
          </div>

          <div 
            className="w-[1px] h-10"
            style={{ background: 'var(--lala-border)' }}
          />

          <div className="flex-1">
            <div 
              className="text-[11px] mb-1 uppercase"
              style={{
                color: 'var(--lala-muted)',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              Check-out
            </div>
            <div 
              className="text-[15px]"
              style={{
                color: checkOut ? 'var(--lala-white)' : 'var(--lala-muted)',
                fontWeight: 600
              }}
            >
              {checkOut ? format(checkOut, 'MMM dd') : 'Add date'}
            </div>
          </div>

          {nights > 0 && (
            <>
              <div 
                className="w-[1px] h-10"
                style={{ background: 'var(--lala-border)' }}
              />
              <div className="flex-shrink-0">
                <div 
                  className="text-[11px] mb-1 uppercase"
                  style={{
                    color: 'var(--lala-muted)',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
                  }}
                >
                  Nights
                </div>
                <div 
                  className="text-[15px]"
                  style={{
                    color: 'var(--lala-gold)',
                    fontWeight: 700
                  }}
                >
                  {nights}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-[16px] p-4 z-50 max-h-[320px] overflow-y-auto"
            style={{
              background: 'var(--lala-card)',
              border: '1px solid var(--lala-border)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              scrollbarWidth: 'none'
            }}
          >
            <div 
              className="text-[13px] mb-3 text-center"
              style={{
                color: 'var(--lala-gold)',
                fontWeight: 600
              }}
            >
              {selectingCheckIn ? 'Select check-in date' : 'Select check-out date'}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div 
                  key={i}
                  className="text-center text-[11px] py-1"
                  style={{ 
                    color: 'var(--lala-muted)',
                    fontWeight: 600
                  }}
                >
                  {day}
                </div>
              ))}
              
              {dates.map((date, i) => {
                const isCheckIn = checkIn && date.getTime() === checkIn.getTime();
                const isCheckOut = checkOut && date.getTime() === checkOut.getTime();
                const inRange = isDateInRange(date);
                const disabled = isDateDisabled(date);

                return (
                  <button
                    key={i}
                    onClick={() => !disabled && handleDateClick(date)}
                    disabled={disabled}
                    className="aspect-square rounded-[8px] text-[13px] flex items-center justify-center border-none cursor-pointer transition-all"
                    style={{
                      background: isCheckIn || isCheckOut ? 'var(--lala-gold)' : 
                                 inRange ? 'rgba(232,184,109,0.15)' : 
                                 'transparent',
                      color: isCheckIn || isCheckOut ? 'var(--lala-night)' :
                             disabled ? 'var(--lala-muted)' :
                             'var(--lala-white)',
                      fontWeight: isCheckIn || isCheckOut ? 700 : 500,
                      opacity: disabled ? 0.3 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
