import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { FilterCategory, Property } from '../types';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

const filterCategories: FilterCategory[] = [
  'All',
  'Apartment',
  'Studio',
  'Penthouse',
  'Shared',
];

export default function Home() {
  const { properties, currentUser } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<FilterCategory>('All');
  const [profileOpen, setProfileOpen] = useState(false);
  const [seeAll, setSeeAll] = useState<null | 'nearby' | 'top'>(null);
   const [highlightedProperty, setHighlightedProperty] = useState<Property | null>(null);

  // guests are allowed to browse the list; currentUser may be null

  const filteredProperties = properties.filter((property) => {
    const matchesFilter =
      activeFilter === 'All' || property.category === activeFilter;
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const nearbyStays = filteredProperties.slice(0, 4);
  const topRated = properties.filter((p) => p.rating >= 4.9);

  // auto-hide the small property popup after a short delay
  useEffect(() => {
    if (!highlightedProperty) return;
    const id = setTimeout(() => setHighlightedProperty(null), 2000);
    return () => clearTimeout(id);
  }, [highlightedProperty]);

  // Modal, no outside-click logic needed; backdrop handles close.

  return (
    <PhoneFrame>
      <div className="relative flex-1 flex flex-col">
        <BackRefreshBar />

        {/* Nav Bar */}
        <div className="flex items-center justify-between px-6 py-2 pb-4">
        <div>
          <div
            className="text-[13px]"
            style={{ color: 'var(--lala-soft)' }}
          >
            Good evening,
          </div>
          <div
            className="text-[22px] mt-0.5"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 700,
              color: 'var(--lala-white)',
            }}
          >
            {currentUser ? currentUser.name : 'Guest'} 👋
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/map')}
            className="w-[36px] h-[36px] rounded-[14px] flex items-center justify-center text-[16px] border-none cursor-pointer"
            style={{
              background: 'var(--lala-card)',
              color: 'var(--lala-gold)',
              border: '1px solid var(--lala-border)',
            }}
          >
            🗺️
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-[42px] h-[42px] rounded-[21px] flex items-center justify-center text-[16px] border-none cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
              fontWeight: 700,
              color: 'var(--lala-night)',
              border: '2px solid rgba(232,184,109,0.3)',
            }}
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : currentUser ? currentUser.name[0] : '👤'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mx-6 mb-5">
        <div
          className="rounded-[16px] px-4 py-3.5 flex items-center gap-2.5 text-[14px]"
          style={{
            background: 'var(--lala-card)',
            border: '1px solid var(--lala-border)',
            color: 'var(--lala-muted)',
          }}
        >
          <span className="text-[16px]">🔍</span>
          <input
            type="text"
            placeholder="Search Kilimani, Westlands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none"
            style={{
              color: 'var(--lala-white)',
              fontFamily: 'var(--font-dm-sans)',
            }}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div
        className="flex gap-2.5 px-6 mb-5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {filterCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className="px-4 py-2 rounded-[40px] text-[13px] whitespace-nowrap border-none cursor-pointer transition-all"
            style={{
              background:
                activeFilter === category
                  ? 'var(--lala-gold)'
                  : 'var(--lala-card)',
              border: `1px solid ${
                activeFilter === category
                  ? 'var(--lala-gold)'
                  : 'var(--lala-border)'
              }`,
              color:
                activeFilter === category
                  ? 'var(--lala-night)'
                  : 'var(--lala-soft)',
              fontWeight: activeFilter === category ? 600 : 500,
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Section Header */}
        <div className="flex justify-between items-center px-6 mb-4">
          <div
            className="text-[18px]"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 700,
              color: 'var(--lala-white)',
            }}
          >
            Nearby Stays
          </div>
          <button
            onClick={() => setSeeAll('nearby')}
            className="text-[13px] cursor-pointer border-none bg-transparent"
            style={{
              color: 'var(--lala-gold)',
              fontWeight: 500,
            }}
          >
            See all →
          </button>
        </div>

        {/* Property Cards Scroll */}
        <div
          className="flex gap-4 px-6 mb-6 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {nearbyStays.map((property, index) => (
            <div
              key={property.id}
              onMouseEnter={() => setHighlightedProperty(property)}
              onTouchStart={() => setHighlightedProperty(property)}
            >
              <PropertyCard property={property} index={index} />
            </div>
          ))}
        </div>

        {/* Top Rated Section */}
        <div className="flex justify-between items-center px-6 mb-4">
          <div
            className="text-[18px]"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 700,
              color: 'var(--lala-white)',
            }}
          >
            Top Rated
          </div>
          <button
            onClick={() => setSeeAll('top')}
            className="text-[13px] cursor-pointer border-none bg-transparent"
            style={{
              color: 'var(--lala-gold)',
              fontWeight: 500,
            }}
          >
            See all →
          </button>
        </div>

        <div
          className="flex gap-4 px-6 mb-6 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {topRated.map((property, index) => (
            <div
              key={property.id}
              onMouseEnter={() => setHighlightedProperty(property)}
              onTouchStart={() => setHighlightedProperty(property)}
            >
              <PropertyCard property={property} index={index} />
            </div>
          ))}
        </div>

        <div className="h-4" /> {/* Bottom spacing */}
      </div>

      {/* Profile sheet, kept fully inside the phone frame */}
      {profileOpen && (
        <div className="absolute inset-0 z-40">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setProfileOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div
              className="w-full max-w-sm rounded-[16px] p-5"
              style={{ background: 'var(--lala-deep)', border: '1px solid var(--lala-border)' }}
            >
              <div className="flex flex-col items-center mb-4">
                <div
                  className="w-40 h-40 rounded-full overflow-hidden mb-3"
                  style={{ border: '2px solid var(--lala-border)' }}
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-[56px]"
                      style={{
                        background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
                        color: 'var(--lala-night)',
                        fontWeight: 800,
                      }}
                    >
                      {currentUser ? currentUser.name[0] : '👤'}
                    </div>
                  )}
                </div>
                <div
                  className="text-[18px]"
                  style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}
                >
                  {currentUser ? currentUser.name : 'Guest'}
                </div>
                <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>
                  {currentUser ? currentUser.email : 'guest@lala.ke'}
                </div>
              </div>
              <div className="grid gap-2">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (currentUser) {
                      navigate('/profile');
                    } else {
                      navigate('/signup');
                    }
                  }}
                  className="w-full py-3 rounded-[12px] border-none cursor-pointer"
                  style={{
                    background: 'var(--lala-card)',
                    border: '1px solid var(--lala-border)',
                    color: 'var(--lala-white)',
                  }}
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (currentUser) {
                      navigate('/host');
                    } else {
                      navigate('/signup/host');
                    }
                  }}
                  className="w-full py-3 rounded-[12px] border-none cursor-pointer"
                  style={{
                    background: 'var(--lala-card)',
                    border: '1px solid var(--lala-border)',
                    color: 'var(--lala-white)',
                  }}
                >
                  Switch to Host Mode
                </button>
                  <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await supabase.auth.signOut();
                    navigate('/signup');
                  }}
                  className="w-full py-3 rounded-[12px] border-none cursor-pointer"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--lala-border)',
                    color: '#FF6B6B',
                    fontWeight: 700,
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* See-all overlay for full property lists */}
      {seeAll && (
        <div className="absolute inset-0 z-30">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSeeAll(null)}
          />
          <div className="absolute inset-0 p-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="text-[22px]"
                  style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}
                >
                  {seeAll === 'top' ? 'Top Rated' : 'Nearby Stays'}
                </div>
                <button
                  onClick={() => setSeeAll(null)}
                  className="px-3 py-1 rounded-[10px] border-none cursor-pointer"
                  style={{
                    background: 'var(--lala-card)',
                    border: '1px solid var(--lala-border)',
                    color: 'var(--lala-white)',
                  }}
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(seeAll === 'top' ? topRated : filteredProperties).map((property, index) => (
                  <div
                    key={property.id}
                    onMouseEnter={() => setHighlightedProperty(property)}
                    onTouchStart={() => setHighlightedProperty(property)}
                  >
                    <PropertyCard property={property} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating property info popup while scrolling */}
      {highlightedProperty && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute left-1/2 bottom-20 -translate-x-1/2"
        >
          <div
            className="px-3 py-2 rounded-[14px] text-[12px]"
            style={{
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid var(--lala-border)',
              color: 'var(--lala-soft)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: 'var(--lala-white)',
                marginBottom: 2,
              }}
            >
              {highlightedProperty.title}
            </div>
            <div className="text-[11px]">
              📍 {highlightedProperty.location} · Ksh{' '}
              {highlightedProperty.price.toLocaleString()}/night
            </div>
          </div>
        </motion.div>
      )}
    </div>
    <BottomNav type="guest" />
  </PhoneFrame>
  );
}
