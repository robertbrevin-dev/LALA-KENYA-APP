import { ReactNode } from 'react';
import PullToRefresh from './PullToRefresh';

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
}

export default function PhoneFrame({ children, className = '' }: PhoneFrameProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div 
        className={`w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col ${className}`}
        style={{
          background: 'var(--lala-night)',
          border: '1px solid var(--lala-border)',
          boxShadow: '0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          position: 'relative'
        }}
      >
        <PullToRefresh />
        {children}
      </div>
    </div>
  );
}
