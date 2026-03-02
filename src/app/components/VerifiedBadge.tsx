interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function VerifiedBadge({ size = 'md', showText = false }: VerifiedBadgeProps) {
  const sizes = {
    sm: '14px',
    md: '16px',
    lg: '20px'
  };

  const textSizes = {
    sm: '11px',
    md: '12px',
    lg: '14px'
  };

  return (
    <div className="inline-flex items-center gap-1">
      <svg 
        width={sizes[size]} 
        height={sizes[size]} 
        viewBox="0 0 24 24" 
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" fill="#3ECFB2"/>
        <path 
          d="M7 12L10.5 15.5L17 9" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span 
          style={{
            fontSize: textSizes[size],
            color: 'var(--lala-teal)',
            fontWeight: 600
          }}
        >
          Verified
        </span>
      )}
    </div>
  );
}
