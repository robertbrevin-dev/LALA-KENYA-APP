import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import BackRefreshBar from '../components/BackRefreshBar';
import PhoneFrame from '../components/PhoneFrame';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function Messages() {
  const { t } = useLanguage();
  const { conversations } = useApp();
  const navigate = useNavigate();

  return (
    <PhoneFrame>
    <div className="relative flex flex-col flex-1 overflow-hidden" style={{ background: 'linear-gradient(170deg, #0e0b08 0%, #080608 60%, #060408 100%)' }}>
      <BackRefreshBar />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(232,184,109,0.1) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(232,184,109,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,109,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-6 pb-2 overflow-hidden">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[12px] font-bold tracking-[2px] mb-1" style={{ color: 'rgba(232,184,109,0.5)' }}>INBOX</p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{t('messages.title')}</h1>
          <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {conversations.length > 0 ? `${conversations.length} ${t("messages.conversations")}` : t('messages.no_messages')}
          </p>
        </motion.div>

        {conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-6"
          >
            {/* Animated chat bubble */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mb-8"
            >
              <div className="w-24 h-24 rounded-[28px] flex items-center justify-center text-[48px] relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(62,207,178,0.1), rgba(62,207,178,0.04))',
                  border: '1px solid rgba(62,207,178,0.2)',
                  boxShadow: '0 20px 60px rgba(62,207,178,0.08)',
                }}>
                💬
                <div className="absolute inset-0 rounded-[28px]" style={{ background: 'radial-gradient(circle at 40% 35%, rgba(62,207,178,0.12) 0%, transparent 60%)' }} />
              </div>
              {/* Ping dots */}
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: '#3ECFB2',
                    right: -4 + i * -10,
                    bottom: 8 + i * 4,
                    opacity: 0.4 + i * 0.2,
                  }}
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.div>

            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10 }}>
              No messages yet
            </h3>
            <p className="text-[13px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.35)', maxWidth: 220 }}>
              Book a property and connect directly with your host.
            </p>

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/home')}
              className="px-8 py-3.5 rounded-[16px] border-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(62,207,178,0.2), rgba(62,207,178,0.08))',
                color: '#3ECFB2',
                fontSize: '14px',
                fontWeight: 800,
                border: '1px solid rgba(62,207,178,0.3)',
                letterSpacing: '0.2px',
              }}
            >
              Find a Stay →
            </motion.button>
          </motion.div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3" style={{ scrollbarWidth: 'none' }}>
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(`/conversation/${conv.id}`)}
                className="flex items-center gap-4 p-4 rounded-[18px] cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[20px] flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(232,184,109,0.2), rgba(232,184,109,0.08))', border: '1px solid rgba(232,184,109,0.2)' }}>
                  🏠
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[14px] font-bold truncate" style={{ color: 'white' }}>{conv.participantName}</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(conv.lastMessageTime).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{conv.lastMessage}</div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(232,184,109,0.5)' }}>{conv.propertyTitle}</div>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: '#E8B86D', color: '#1a0800' }}>
                    {conv.unreadCount}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav type="guest" />
    </div>
    </PhoneFrame>
  );
}
