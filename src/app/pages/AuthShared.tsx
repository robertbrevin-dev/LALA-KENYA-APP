import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef } from 'react';

export type CountryCode = {
  abbr: string;
  name: string;
  flag: string;
  code: string;
};

export const COUNTRY_CODES: CountryCode[] = [
  // East Africa focus
  { abbr: 'KE', name: 'Kenya', flag: '🇰🇪', code: '+254' },
  { abbr: 'UG', name: 'Uganda', flag: '🇺🇬', code: '+256' },
  { abbr: 'TZ', name: 'Tanzania', flag: '🇹🇿', code: '+255' },
  { abbr: 'RW', name: 'Rwanda', flag: '🇷🇼', code: '+250' },
  { abbr: 'BI', name: 'Burundi', flag: '🇧🇮', code: '+257' },
  { abbr: 'ET', name: 'Ethiopia', flag: '🇪🇹', code: '+251' },
  { abbr: 'SS', name: 'South Sudan', flag: '🇸🇸', code: '+211' },
  // Wider Africa
  { abbr: 'NG', name: 'Nigeria', flag: '🇳🇬', code: '+234' },
  { abbr: 'GH', name: 'Ghana', flag: '🇬🇭', code: '+233' },
  { abbr: 'ZA', name: 'South Africa', flag: '🇿🇦', code: '+27' },
  { abbr: 'EG', name: 'Egypt', flag: '🇪🇬', code: '+20' },
  { abbr: 'CM', name: 'Cameroon', flag: '🇨🇲', code: '+237' },
  // Popular international
  { abbr: 'US', name: 'United States', flag: '🇺🇸', code: '+1' },
  { abbr: 'CA', name: 'Canada', flag: '🇨🇦', code: '+1' },
  { abbr: 'GB', name: 'United Kingdom', flag: '🇬🇧', code: '+44' },
  { abbr: 'DE', name: 'Germany', flag: '🇩🇪', code: '+49' },
  { abbr: 'FR', name: 'France', flag: '🇫🇷', code: '+33' },
  { abbr: 'IN', name: 'India', flag: '🇮🇳', code: '+91' },
  { abbr: 'CN', name: 'China', flag: '🇨🇳', code: '+86' },
  { abbr: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', code: '+971' },
];

export function GoogleIcon() {
  return (
    <div className="w-5 h-5 rounded-[6px] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 48 48" width="20" height="20">
        <path fill="#EA4335" d="M24 9.5c3.3 0 5.5 1.4 6.8 2.6l5-5C32.9 3.5 28.8 2 24 2 14.8 2 7 7.8 4 16l6.4 5C11.8 14.1 17.3 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46 24.5c0-1.6-.1-2.7-.4-4H24v7.6h12.6c-.3 1.9-1.8 4.8-5 6.7l7.7 6c4.5-4.1 6.7-10.1 6.7-16.3z" />
        <path fill="#FBBC05" d="M10.4 28.9C9.6 26.9 9.1 24.7 9.1 22.5s.5-4.4 1.3-6.4l-6.4-5C2.7 13.9 2 18 2 22.5S2.7 31.1 4 35l6.4-6.1z" />
        <path fill="#34A853" d="M24 47c6.5 0 12-2.1 16-5.9l-7.7-6c-2.1 1.4-4.9 2.4-8.3 2.4-6.7 0-12.3-4.5-14.3-10.6L4 35C7 43.2 14.8 47 24 47z" />
        <path fill="none" d="M2 2h44v44H2z" />
      </svg>
    </div>
  );
}

interface CountryPickerProps {
  visible: boolean;
  selected: CountryCode;
  onSelect: (c: CountryCode) => void;
  onClose: () => void;
  accentColor: string;
}

export function CountryPicker({
  visible,
  selected,
  onSelect,
  onClose,
  accentColor,
}: CountryPickerProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible || !listRef.current) return;
    const idx = COUNTRY_CODES.findIndex((c) => c.code === selected.code);
    if (idx >= 0) {
      const el = listRef.current.children[idx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'center' });
    }
  }, [visible, selected]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="w-full max-w-sm rounded-[20px] overflow-hidden"
            style={{
              background: '#05060a',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div
                className="text-[13px] font-black uppercase tracking-[0.22em]"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Select Country
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-[999px] flex items-center justify-center border-none cursor-pointer text-[14px]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                ✕
              </button>
            </div>

            <div
              ref={listRef}
              className="max-h-[360px] overflow-y-auto px-2 pb-3"
              style={{ scrollbarWidth: 'none' }}
            >
              {COUNTRY_CODES.map((c) => {
                const active = c.code === selected.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      onSelect(c);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] border-none cursor-pointer mb-1.5"
                    style={{
                      background: active
                        ? 'rgba(255,255,255,0.06)'
                        : 'transparent',
                      border: active
                        ? `1px solid ${accentColor}66`
                        : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span className="text-[20px]">{c.flag}</span>
                    <div className="flex-1 text-left">
                      <div
                        className="text-[13px] font-semibold"
                        style={{ color: 'white' }}
                      >
                        {c.name}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                      >
                        {c.code} · {c.abbr}
                      </div>
                    </div>
                    {active && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[14px]"
                        style={{
                          background: accentColor,
                          color: '#05060a',
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface OtpRowProps {
  otp: string[];
  onChange: (index: number, value: string) => void;
  idPrefix: string;
  accentColor: string;
}

export function OtpRow({ otp, onChange, idPrefix, accentColor }: OtpRowProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (i: number, val: string) => {
    const digit = val.slice(-1).replace(/\D/g, '');
    onChange(i, digit);
    if (digit && i < otp.length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {otp.map((val, i) => (
        <input
          key={`${idPrefix}-${i}`}
          ref={(el) => (inputsRef.current[i] = el)}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-9 h-11 text-center text-[18px] rounded-[10px] outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${
              val ? accentColor : 'rgba(255,255,255,0.12)'
            }`,
            color: 'white',
          }}
        />
      ))}
    </div>
  );
}

