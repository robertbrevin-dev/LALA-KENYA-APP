import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { FilterCategory, Property } from '../types';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

const filterCategories: FilterCategory[] = ['All', 'Apartment', 'Studio', 'Penthouse', 'Shared'];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
};

export default function Home() {
  const { properties, currentUser } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [profileOpen, setProfileOpen] = useState(false);
  const [seeAll, setSeeAll] = useState<null | 'nearby' | 'top'>(null);
  const [highlightedProperty, setHighlightedProperty] = useState<Property | null>(null);

  const filteredProperties = properties.filter((property) => {
    const matchesFilter = activeFilter === 'All' || property.category === activeFilter;
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const nearbyStays = filteredProperties.slice(0, 4);
  const topRated = properties.filter((p) => p.rating >= 4.9);

  useEffect(() => {
    if (!highlightedProperty) return;
    const id = setTimeout(() => setHighlightedProperty(null), 2000);
    return () => clearTimeout(id);
  }, [highlightedProperty]);

  return (
    <PhoneFrame>
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #0e0b08 0%, #080608 60%, #060408 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 35% at 50% 0%, rgba(232,184,109,0.12) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(232,184,109,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,109,0.022) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <BackRefreshBar />

        {/* ── HEADER ── */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-3">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{getGreeting()}</div>
            <div className="text-[22px] mt-0.5" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'white' }}>
              {currentUser ? currentUser.name.split(' ')[0] : 'Guest'} 👋
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/map')}
              className="w-[36px] h-[36px] rounded-[13px] flex items-center justify-center text-[16px] border-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,184,109,0.15)' }}
            >
              🗺️
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setProfileOpen(true)}
              className="w-[38px] h-[38px] rounded-full flex items-center justify-center border-none cursor-pointer overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #F7DC8A, #E8B86D, #C8843A)',
                border: '2px solid rgba(232,184,109,0.35)',
                boxShadow: '0 4px 16px rgba(232,184,109,0.3)',
                fontWeight: 800,
                color: '#1a0800',
                fontSize: 15,
                fontFamily: 'var(--font-playfair)',
              }}
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : currentUser ? currentUser.name[0] : '👤'}
            </motion.button>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className="relative z-10 mx-5 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-[16px] px-4 py-3 flex items-center gap-2.5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(232,184,109,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <span style={{ fontSize: 15, opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              placeholder="Search Kilimani, Westlands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px]"
              style={{ color: 'white', fontFamily: 'var(--font-dm-sans)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="border-none bg-transparent cursor-pointer text-[16px]"
                style={{ color: 'rgba(255,255,255,0.3)' }}>×</button>
            )}
          </motion.div>
        </div>

        {/* ── FILTER CHIPS ── */}
        <div className="relative z-10 flex gap-2 px-5 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {filterCategories.map((category, i) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setActiveFilter(category)}
              className="px-4 py-1.5 rounded-full text-[12px] whitespace-nowrap border-none cursor-pointer font-bold transition-all"
              style={{
                background: activeFilter === category
                  ? 'linear-gradient(135deg, #F7DC8A, #E8B86D)'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeFilter === category ? 'rgba(232,184,109,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: activeFilter === category ? '#1a0800' : 'rgba(255,255,255,0.5)',
                boxShadow: activeFilter === category ? '0 4px 16px rgba(232,184,109,0.25)' : 'none',
              }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="relative z-10 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Nearby Stays */}
          <div className="flex justify-between items-center px-5 mb-3">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 800, color: 'white' }}>Nearby Stays</h2>
            <motion.button whileTap={{ scale: 0.94 }} onClick={() => setSeeAll('nearby')}
              className="text-[12px] cursor-pointer border-none bg-transparent font-bold"
              style={{ color: '#E8B86D' }}>
              See all →
            </motion.button>
          </div>

          <div className="flex gap-3 px-5 mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none', paddingBottom: 4 }}>
            {nearbyStays.length === 0 ? (
              <div className="text-[13px] py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>No properties found</div>
            ) : nearbyStays.map((property, index) => (
              <div key={property.id} onMouseEnter={() => setHighlightedProperty(property)} onTouchStart={() => setHighlightedProperty(property)}>
                <PropertyCard property={property} index={index} />
              </div>
            ))}
          </div>

          {/* Top Rated */}
          <div className="flex justify-between items-center px-5 mb-3">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 800, color: 'white' }}>Top Rated</h2>
            <motion.button whileTap={{ scale: 0.94 }} onClick={() => setSeeAll('top')}
              className="text-[12px] cursor-pointer border-none bg-transparent font-bold"
              style={{ color: '#E8B86D' }}>
              See all →
            </motion.button>
          </div>

          <div className="flex gap-3 px-5 mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none', paddingBottom: 4 }}>
            {topRated.length === 0 ? (
              <div className="text-[13px] py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>No top rated properties yet</div>
            ) : topRated.map((property, index) => (
              <div key={property.id} onMouseEnter={() => setHighlightedProperty(property)} onTouchStart={() => setHighlightedProperty(property)}>
                <PropertyCard property={property} index={index} />
              </div>
            ))}
          </div>

          <div className="h-4" />
        </div>

        {/* ── PROFILE SHEET ── */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-end">
              <motion.div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={() => setProfileOpen(false)} />
              <motion.div
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative z-10 w-full rounded-t-[32px] p-6"
                style={{ background: 'linear-gradient(170deg, #131008, #0a0808)', border: '1px solid rgba(232,184,109,0.15)', borderBottom: 'none' }}>
                {/* Handle */}
                <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.12)' }} />

                {/* Avatar */}
                <div className="flex flex-col items-center mb-5">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3"
                    style={{ border: '2px solid rgba(232,184,109,0.3)', boxShadow: '0 8px 24px rgba(232,184,109,0.2)' }}>
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[28px]"
                        style={{ background: 'linear-gradient(135deg, #F7DC8A, #E8B86D, #C8843A)', color: '#1a0800', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>
                        {currentUser ? currentUser.name[0] : '👤'}
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 800, color: 'white' }}>
                    {currentUser ? currentUser.name : 'Guest'}
                  </div>
                  <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {currentUser ? currentUser.email : 'guest@lala.ke'}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => { setProfileOpen(false); navigate(currentUser ? '/profile' : '/signup'); }}
                    className="w-full py-3.5 rounded-[14px] border-none cursor-pointer font-bold text-[14px]"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                    View Profile
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => { setProfileOpen(false); navigate(currentUser ? '/host' : '/signup/host'); }}
                    className="w-full py-3.5 rounded-[14px] border-none cursor-pointer font-bold text-[14px]"
                    style={{ background: 'linear-gradient(135deg, rgba(62,207,178,0.15), rgba(62,207,178,0.05))', color: '#3ECFB2', border: '1px solid rgba(62,207,178,0.25)' }}>
                    🏠 Switch to Host Mode
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={async () => { setProfileOpen(false); await supabase.auth.signOut(); navigate('/signup'); }}
                    className="w-full py-3.5 rounded-[14px] border-none cursor-pointer font-bold text-[14px]"
                    style={{ background: 'transparent', color: 'rgba(255,107,107,0.7)', border: '1px solid rgba(255,107,107,0.12)' }}>
                    Logout
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SEE ALL OVERLAY ── */}
        <AnimatePresence>
          {seeAll && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30">
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={() => setSeeAll(null)} />
              <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-x-0 bottom-0 top-16 rounded-t-[32px] overflow-hidden"
                style={{ background: 'linear-gradient(170deg, #131008, #0a0808)', border: '1px solid rgba(232,184,109,0.15)', borderBottom: 'none' }}>
                <div className="p-5 pb-0">
                  <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-bold tracking-[2px]" style={{ color: 'rgba(232,184,109,0.5)' }}>BROWSE ALL</p>
                      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white' }}>
                        {seeAll === 'top' ? 'Top Rated' : 'Nearby Stays'}
                      </h2>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSeeAll(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer text-[18px]"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                      ×
                    </motion.button>
                  </div>
                </div>
                <div className="overflow-y-auto px-5 pb-8" style={{ scrollbarWidth: 'none', height: 'calc(100% - 110px)' }}>
                  <div className="grid grid-cols-2 gap-3">
                    {(seeAll === 'top' ? topRated : filteredProperties).map((property, index) => (
                      <div key={property.id} onTouchStart={() => setHighlightedProperty(property)}>
                        <PropertyCard property={property} index={index} />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FLOATING PROPERTY TOOLTIP ── */}
        <AnimatePresence>
          {highlightedProperty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="pointer-events-none absolute left-1/2 bottom-20 -translate-x-1/2 z-20"
            >
              <div className="px-3 py-2 rounded-[12px] text-[11px] whitespace-nowrap"
                style={{ background: 'rgba(8,6,8,0.92)', border: '1px solid rgba(232,184,109,0.2)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <div className="font-bold mb-0.5" style={{ color: 'white' }}>{highlightedProperty.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)' }}>📍 {highlightedProperty.location} · <span style={{ color: '#E8B86D', fontWeight: 700 }}>Ksh {highlightedProperty.price.toLocaleString()}</span>/night</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav type="guest" />
    </PhoneFrame>
  );
}
