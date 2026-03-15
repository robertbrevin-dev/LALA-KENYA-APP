import { motion } from 'motion/react';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import PropertyCard from '../components/PropertyCard';
import { useApp } from '../context/AppContext';
import BackRefreshBar from '../components/BackRefreshBar';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function Saved() {
  const { t } = useLanguage();
  const { properties } = useApp();
  const favoriteProperties = properties.filter(p => p.isFavorite);

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <BackRefreshBar />
        {/* Header */}
        <div className="px-6 pt-14 pb-5">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[28px] mb-2"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 900,
              color: 'var(--lala-white)'
            }}
          >
            Saved Properties
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[14px]"
            style={{ color: 'var(--lala-soft)' }}
          >
            {favoriteProperties.length} {favoriteProperties.length === 1 ? 'property' : 'properties'} saved
          </motion.p>
        </div>

        {/* Content */}
        <div className="px-6 pb-24">
          {favoriteProperties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-16"
            >
              <div className="text-[60px] mb-4">🔖</div>
              <p 
                className="text-[14px]"
                style={{ color: 'var(--lala-soft)' }}
              >
                You haven't saved any properties yet.<br />
                Tap the heart icon to save your favorites.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {favoriteProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
