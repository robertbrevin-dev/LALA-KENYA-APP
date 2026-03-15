import { Property } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import VerifiedBadge from './VerifiedBadge';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const cardGradients = [
  'linear-gradient(145deg, #1a2535, #0d1520)',
  'linear-gradient(145deg, #1e1528, #120d1e)',
  'linear-gradient(145deg, #0d1e18, #151a28)',
  'linear-gradient(145deg, #1e1510, #280d0d)',
  'linear-gradient(145deg, #1a2030, #0d1822)',
  'linear-gradient(145deg, #1a1520, #200d18)',
];

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const navigate = useNavigate();
  const { toggleFavorite } = useApp();
  const gradient = cardGradients[parseInt(property.id) % cardGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/property/${property.id}`)}
      className="min-w-[200px] rounded-[20px] overflow-hidden flex-shrink-0 cursor-pointer relative"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(232,184,109,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Image area */}
      <div
        className="h-[120px] relative flex items-center justify-center text-[44px]"
        style={{ background: gradient }}
      >
        {/* Ambient glow overlay */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(232,184,109,0.08) 0%, transparent 70%)',
        }} />

        {property.image?.startsWith("http") ? <img src={property.image} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : <span style={{fontSize:32}}>{property.image || ""}</span>}

        {/* Badge */}
        {property.badge && (
          <div
            className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full text-[9px] uppercase font-bold tracking-wide"
            style={{
              background: 'rgba(8,6,8,0.85)',
              backdropFilter: 'blur(12px)',
              color: '#E8B86D',
              border: '1px solid rgba(232,184,109,0.25)',
            }}
          >
            {property.badge}
          </div>
        )}

        {/* Verified */}
        {property.verified && (
          <div
            className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-[8px] flex items-center gap-1"
            style={{
              background: 'rgba(62,207,178,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(62,207,178,0.25)',
            }}
          >
            <VerifiedBadge size="sm" />
          </div>
        )}

        {/* Heart */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }}
          className="absolute top-2.5 right-2.5 w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px] border-none cursor-pointer"
          style={{
            background: property.isFavorite ? 'rgba(255,80,80,0.2)' : 'rgba(8,6,8,0.8)',
            backdropFilter: 'blur(12px)',
            border: property.isFavorite ? '1px solid rgba(255,80,80,0.4)' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {property.isFavorite ? '❤️' : '🤍'}
        </motion.button>

        {/* Bottom shine */}
        <div className="absolute bottom-0 left-0 right-0 h-8"
          style={{ background: 'linear-gradient(to top, rgba(8,6,8,0.6), transparent)' }} />
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="text-[10px] mb-1 uppercase font-bold tracking-wide" style={{ color: '#3ECFB2' }}>
          📍 {property.location}
        </div>
        <div className="text-[13px] mb-2 font-bold leading-tight" style={{ color: 'white' }}>
          {property.title}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[15px] font-bold" style={{ color: '#E8B86D' }}>
              Ksh {property.price.toLocaleString()}
            </span>
            <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>/ night</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            ⭐ {property.rating}
          </div>
        </div>
      </div>

      {/* Bottom border shine */}
      <div className="absolute bottom-0 left-4 right-4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,109,0.15), transparent)' }} />
    </motion.div>
  );
}
