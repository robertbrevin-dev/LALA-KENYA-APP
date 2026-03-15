// ─── LALA Kenya — Shared Auth Utilities ───────────────────────────────
// Place at: src/app/pages/AuthShared.tsx

import { useState } from 'react';

// 70 countries — East Africa first, then world regions
export const COUNTRY_CODES = [
  // East Africa first
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+211', country: 'South Sudan', flag: '🇸🇸' },
  // West Africa
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+225', country: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'DRC', flag: '🇨🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+246', country: 'Sao Tome', flag: '🇸🇹' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  // North Africa
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  // Major world countries
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
];

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

export const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M19.6 10.23c0-.71-.06-1.4-.18-2.07H10v3.91h5.47a4.68 4.68 0 01-2.02 3.07v2.54h3.27c1.91-1.76 3.01-4.36 3.01-7.45z" fill="#4285F4"/>
    <path d="M10 20c2.7 0 4.97-.89 6.62-2.4l-3.27-2.54c-.9.61-2.05.96-3.35.96-2.58 0-4.76-1.74-5.54-4.09H.91v2.62A9.996 9.996 0 0010 20z" fill="#34A853"/>
    <path d="M4.46 13.93a6.02 6.02 0 010-3.86V7.45H.91A9.996 9.996 0 000 10c0 1.61.39 3.14 1.08 4.55l3.38-2.62z" fill="#FBBC05"/>
    <path d="M10 3.96c1.46 0 2.77.5 3.8 1.48l2.9-2.9C14.97 1.56 12.7.67 10 .67A9.996 9.996 0 00.91 7.45l3.55 2.62C4.76 7.72 6.94 3.96 10 3.96z" fill="#EA4335"/>
  </svg>
);

interface CountryPickerProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export const CountryPicker = ({ value, onChange, disabled }: CountryPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent text-white"
        style={{ 
          borderColor: 'rgba(255,255,255,0.2)',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <img 
          src={`https://flagcdn.com/w40/${selectedCountry.country.toLowerCase().replace(/\s+/g, '-')}.png`} 
          alt={selectedCountry.country} 
          style={{ width: 20, height: 14, objectFit: "cover", borderRadius: 2 }} 
          onError={(e) => {
            // Fallback to emoji if flag fails to load
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="hidden">{selectedCountry.flag}</span>
        <span className="text-white">{selectedCountry.code}</span>
        <span className="text-gray-400">▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg mt-1">
          <div className="p-1">
            {COUNTRY_CODES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country.code);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-800 text-white text-left"
              >
                <img 
                  src={`https://flagcdn.com/w40/${country.country.toLowerCase().replace(/\s+/g, '-')}.png`} 
                  alt={country.country} 
                  style={{ width: 20, height: 14, objectFit: "cover", borderRadius: 2 }}
                  onError={(e) => {
                    // Fallback to emoji if flag fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden">{country.flag}</span>
                <span className="text-white">{country.code}</span>
                <span className="text-gray-400 text-sm">{country.country}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface OtpRowProps {
  otp: string[];
  onChange: (index: number, value: string) => void;
  idPrefix: string;
  accentColor: string;
}

export const OtpRow = ({ otp, onChange, idPrefix, accentColor }: OtpRowProps) => (
  <div className="flex gap-2">
    {otp.map((digit, i) => (
      <input
        key={i}
        id={`${idPrefix}-${i}`}
        type="text"
        maxLength={1}
        value={digit}
        onChange={(e) => onChange(i, e.target.value)}
        className="w-12 h-12 text-center border rounded-lg"
        style={{ borderColor: accentColor }}
      />
    ))}
  </div>
);
