import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type React from 'react'

export const COUNTRY_CODES = [
  { code: '+254', flag: '🇰🇪', name: 'Kenya',          abbr: 'KE' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda',         abbr: 'UG' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania',       abbr: 'TZ' },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda',         abbr: 'RW' },
  { code: '+257', flag: '🇧🇮', name: 'Burundi',        abbr: 'BI' },
  { code: '+211', flag: '🇸🇸', name: 'South Sudan',    abbr: 'SS' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia',       abbr: 'ET' },
  { code: '+252', flag: '🇸🇴', name: 'Somalia',        abbr: 'SO' },
  { code: '+253', flag: '🇩🇯', name: 'Djibouti',       abbr: 'DJ' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria',        abbr: 'NG' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana',          abbr: 'GH' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa',   abbr: 'ZA' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt',          abbr: 'EG' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco',        abbr: 'MA' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia',        abbr: 'TN' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon',       abbr: 'CM' },
  { code: '+243', flag: '🇨🇩', name: 'DR Congo',       abbr: 'CD' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia',         abbr: 'ZM' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe',       abbr: 'ZW' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique',     abbr: 'MZ' },
  { code: '+265', flag: '🇲🇼', name: 'Malawi',         abbr: 'MW' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar',     abbr: 'MG' },
  { code: '+225', flag: '🇨🇮', name: 'Ivory Coast',    abbr: 'CI' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal',        abbr: 'SN' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan',          abbr: 'SD' },
  { code: '+267', flag: '🇧🇼', name: 'Botswana',       abbr: 'BW' },
  { code: '+266', flag: '🇱🇸', name: 'Lesotho',        abbr: 'LS' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom', abbr: 'GB' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',        abbr: 'DE' },
  { code: '+33',  flag: '🇫🇷', name: 'France',         abbr: 'FR' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy',          abbr: 'IT' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain',          abbr: 'ES' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands',    abbr: 'NL' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden',         abbr: 'SE' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway',         abbr: 'NO' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark',        abbr: 'DK' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland',    abbr: 'CH' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium',        abbr: 'BE' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland',         abbr: 'PL' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal',       abbr: 'PT' },
  { code: '+30',  flag: '🇬🇷', name: 'Greece',         abbr: 'GR' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia',         abbr: 'RU' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine',        abbr: 'UA' },
  { code: '+1',   flag: '🇺🇸', name: 'United States',  abbr: 'US' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada',         abbr: 'CA' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil',         abbr: 'BR' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico',         abbr: 'MX' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina',      abbr: 'AR' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia',       abbr: 'CO' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile',          abbr: 'CL' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru',           abbr: 'PE' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela',      abbr: 'VE' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador',        abbr: 'EC' },
  { code: '+91',  flag: '🇮🇳', name: 'India',          abbr: 'IN' },
  { code: '+86',  flag: '🇨🇳', name: 'China',          abbr: 'CN' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan',          abbr: 'JP' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea',    abbr: 'KR' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore',      abbr: 'SG' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia',       abbr: 'MY' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines',    abbr: 'PH' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand',       abbr: 'TH' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia',      abbr: 'ID' },
  { code: '+971', flag: '🇦🇪', name: 'UAE',            abbr: 'AE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia',   abbr: 'SA' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar',          abbr: 'QA' },
  { code: '+972', flag: '🇮🇱', name: 'Israel',         abbr: 'IL' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey',         abbr: 'TR' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan',       abbr: 'PK' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh',     abbr: 'BD' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia',      abbr: 'AU' },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand',    abbr: 'NZ' },
]

export type CountryCode = typeof COUNTRY_CODES[0]

export const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export interface CountryPickerProps {
  visible: boolean;
  selected: CountryCode;
  onSelect: (c: CountryCode) => void;
  onClose: () => void;
  accentColor?: string;
}

export function CountryPicker({ visible, selected, onSelect, onClose, accentColor = '#E8B86D' }: CountryPickerProps) {
  const [search, setSearch] = useState('')
  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search) ||
    c.abbr.toLowerCase().includes(search.toLowerCase())
  )
  const eastAfrica = ['KE','UG','TZ','RW','BI','SS','ET','SO','DJ']
  const isEA = (c: CountryCode) => eastAfrica.includes(c.abbr)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="absolute inset-0 z-[200] flex flex-col rounded-[44px] overflow-hidden"
          style={{ background: '#0D0F14' }}>
          <div className="px-6 pt-14 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[20px] font-black" style={{ fontFamily: 'var(--font-playfair)', color: 'white' }}>
                  🌍 Select Country
                </h2>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Choose your country code
                </p>
              </div>
              <button onClick={() => { onClose(); setSearch(''); }}
                className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer text-[14px] font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>✕</button>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-[14px]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <span className="text-[16px]">🔍</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search country name or +code..."
                autoFocus
                className="flex-1 bg-transparent outline-none border-none text-[13px]"
                style={{ color: 'white' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="border-none bg-transparent cursor-pointer text-[14px]"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>✕</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
            {!search && (
              <div className="text-[10px] font-black px-2 mb-2 mt-1"
                style={{ color: accentColor, letterSpacing: 1.5 }}>⭐ EAST AFRICA</div>
            )}
            {filtered.map((c, i) => {
              const isSel = selected.abbr === c.abbr && selected.code === c.code;
              const showRestOfWorldHeader = !search && i === 9 && !isEA(c);
              return (
                <div key={`${c.abbr}-${i}`}>
                  {showRestOfWorldHeader && (
                    <div className="text-[10px] font-black px-2 mb-2 mt-4"
                      style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5 }}>🌐 WORLD</div>
                  )}
                  <button
                    onClick={() => { onSelect(c); onClose(); setSearch(''); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] border-none cursor-pointer text-left mb-1"
                    style={{
                      background: isSel ? `${accentColor}15` : 'transparent',
                      border: isSel ? `1px solid ${accentColor}35` : '1px solid transparent',
                    }}>
                    <span className="text-[26px] leading-none">{c.flag}</span>
                    <span className="flex-1 text-[14px] font-medium" style={{ color: 'white' }}>{c.name}</span>
                    <span className="text-[13px] font-bold tabular-nums"
                      style={{ color: isSel ? accentColor : 'rgba(255,255,255,0.35)' }}>{c.code}</span>
                    {isSel && <span className="text-[14px]" style={{ color: accentColor }}>✓</span>}
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <div className="text-[40px] mb-3">🌍</div>
                <div className="text-[14px]">No country found for "{search}"</div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export interface OtpRowProps {
  otp: string[];
  onChange: (i: number, val: string) => void;
  idPrefix: string;
  accentColor?: string;
}

export function OtpRow({ otp, onChange, idPrefix, accentColor = '#E8B86D' }: OtpRowProps) {
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0)
      (document.getElementById(`${idPrefix}-${i - 1}`) as HTMLInputElement)?.focus();
  }
  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    onChange(i, val.slice(-1));
    if (val && i < 5)
      (document.getElementById(`${idPrefix}-${i + 1}`) as HTMLInputElement)?.focus();
  }
  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoComplete="one-time-code"
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className="w-12 h-14 text-center rounded-[14px] text-[22px] font-black outline-none"
          style={{
            background: digit ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
            border: digit ? `2px solid ${accentColor}70` : '1.5px solid rgba(255,255,255,0.1)',
            color: accentColor,
            transition: 'all 0.15s',
          }}
        />
      ))}
    </div>
  )
}
