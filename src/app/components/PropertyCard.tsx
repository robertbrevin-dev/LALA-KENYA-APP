import { Property } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import VerifiedBadge from './VerifiedBadge';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const navigate = useNavigate();
  const { toggleFavorite } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/property/${property.id}`)}
      className="min-w-[220px] rounded-[20px] overflow-hidden flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
      style={{
        background: 'var(--lala-card)',
        border: '1px solid var(--lala-border)'
      }}
    >
      {/* Image */}
      <div 
        className="h-[130px] relative flex items-center justify-center text-[40px]"
        style={{
          background: property.id === '1' ? 'linear-gradient(135deg, #1a2a3a, #2a3a2a)' :
                     property.id === '2' ? 'linear-gradient(135deg, #2a1a3a, #3a2a1a)' :
                     property.id === '3' ? 'linear-gradient(135deg, #1a3a2a, #2a2a3a)' :
                     property.id === '4' ? 'linear-gradient(135deg, #2a1a1a, #3a2a1a)' :
                     property.id === '5' ? 'linear-gradient(135deg, #1a2a3a, #2a3a2a)' :
                     'linear-gradient(135deg, #1a1a2a, #2a2a3a)'
        }}
      >
        {property.image}
        
        {/* Badge */}
        {property.badge && (
          <div 
            className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-[20px] text-[10px] uppercase"
            style={{
              background: 'rgba(13,15,20,0.85)',
              backdropFilter: 'blur(10px)',
              color: 'var(--lala-gold)',
              fontWeight: 700,
              letterSpacing: '0.5px',
              border: '1px solid rgba(232,184,109,0.2)'
            }}
          >
            {property.badge}
          </div>
        )}

        {/* Verified Badge */}
        {property.verified && (
          <div 
            className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-[8px] flex items-center gap-1"
            style={{
              background: 'rgba(62,207,178,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(62,207,178,0.3)'
            }}
          >
            <VerifiedBadge size="sm" />
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="absolute top-2.5 right-2.5 w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] border-none cursor-pointer"
          style={{
            background: 'rgba(13,15,20,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {property.isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Body */}
      <div className="p-3 px-3.5">
        <div 
          className="text-[11px] mb-1 uppercase"
          style={{
            color: 'var(--lala-teal)',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          📍 {property.location}
        </div>
        
        <div 
          className="text-[14px] mb-2"
          style={{
            color: 'var(--lala-white)',
            fontWeight: 600
          }}
        >
          {property.title}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span 
              className="text-[16px]"
              style={{
                color: 'var(--lala-gold)',
                fontWeight: 700
              }}
            >
              Ksh {property.price.toLocaleString()}
            </span>
            <span 
              className="text-[11px] ml-1"
              style={{ color: 'var(--lala-muted)' }}
            >
              / night
            </span>
          </div>
          
          <div 
            className="flex items-center gap-1 text-[12px]"
            style={{ color: 'var(--lala-soft)' }}
          >
            ⭐ {property.rating}
          </div>
        </div>
      </div>
    </motion.div>
  );
}