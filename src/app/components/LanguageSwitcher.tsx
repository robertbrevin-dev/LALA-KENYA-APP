import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, LANGUAGES, LanguageConfig } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
  style?: React.CSSProperties;
  showFlag?: boolean;
  showNativeName?: boolean;
  compact?: boolean;
}

export function LanguageSwitcher({ 
  className = '', 
  style = {}, 
  showFlag = true,
  showNativeName = true,
  compact = false 
}: LanguageSwitcherProps) {
  const { language, setLanguage, t, currentLanguageConfig } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (lang: LanguageConfig) => {
    setLanguage(lang.code);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-[12px] border-none cursor-pointer ${className}`}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          fontSize: '13px',
          ...style
        }}
      >
        {showFlag && <span className="text-[16px]">{currentLanguageConfig.flag}</span>}
        <span className="font-medium">
          {showNativeName ? currentLanguageConfig.nativeName : currentLanguageConfig.name}
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {isOpen ? '▲' : '▼'}
        </span>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 z-50 min-w-[200px] rounded-[16px] overflow-hidden"
              style={{
                background: '#0D0F14',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}
            >
              <div className="p-2">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] px-3 py-2 mb-1"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {t('lang.select_language')}
                </div>
                {LANGUAGES.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLanguageSelect(lang)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] border-none cursor-pointer mb-1"
                    style={{
                      background: lang.code === language 
                        ? 'rgba(232,184,109,0.15)' 
                        : 'transparent',
                      border: lang.code === language 
                        ? '1px solid rgba(232,184,109,0.3)' 
                        : '1px solid transparent'
                    }}
                  >
                    {showFlag && <span className="text-[18px]">{lang.flag}</span>}
                    <div className="flex-1 text-left">
                      <div className="text-[13px] font-medium" style={{ color: 'white' }}>
                        {showNativeName ? lang.nativeName : lang.name}
                      </div>
                      <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {lang.name}
                      </div>
                    </div>
                    {lang.code === language && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: '#E8B86D', color: '#0D0F14' }}>
                        ✓
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] border-none cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          fontSize: '13px'
        }}
      >
        {showFlag && <span className="text-[18px]">{currentLanguageConfig.flag}</span>}
        <span className="font-medium">
          {showNativeName ? currentLanguageConfig.nativeName : currentLanguageConfig.name}
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.3)' }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 z-50 w-80 rounded-[20px] overflow-hidden"
              style={{
                background: '#0D0F14',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[12px] font-black uppercase tracking-[0.22em]"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {t('lang.select_language')}
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-[999px] flex items-center justify-center border-none cursor-pointer text-[14px]"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.6)'
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-2">
                  {LANGUAGES.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLanguageSelect(lang)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] border-none cursor-pointer"
                      style={{
                        background: lang.code === language 
                          ? 'rgba(232,184,109,0.15)' 
                          : 'rgba(255,255,255,0.02)',
                        border: lang.code === language 
                          ? '1px solid rgba(232,184,109,0.3)' 
                          : '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      {showFlag && <span className="text-[24px]">{lang.flag}</span>}
                      <div className="flex-1 text-left">
                        <div className="text-[14px] font-semibold" style={{ color: 'white' }}>
                          {showNativeName ? lang.nativeName : lang.name}
                        </div>
                        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {lang.name}
                        </div>
                      </div>
                      {lang.code === language && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold"
                          style={{ background: '#E8B86D', color: '#0D0F14' }}>
                          ✓
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
