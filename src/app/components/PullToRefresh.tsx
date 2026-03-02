import { useEffect, useState } from 'react';

export default function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let startY: number | null = null;
    let isTracking = false;

    const getY = (e: TouchEvent | MouseEvent) => {
      if ('touches' in e) {
        return e.touches[0]?.clientY ?? 0;
      }
      return (e as MouseEvent).clientY;
    };

    const handleStart = (e: TouchEvent | MouseEvent) => {
      // only start tracking when the page is at the very top
      if (window.scrollY > 0 || refreshing) return;
      startY = getY(e);
      isTracking = true;
    };

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isTracking || startY == null) return;
      const currentY = getY(e);
      const delta = currentY - startY;
      if (delta <= 0) {
        setPullDistance(0);
        return;
      }
      setPullDistance(Math.min(delta, 120));
    };

    const handleEnd = () => {
      if (!isTracking) return;
      if (pullDistance > 80 && !refreshing) {
        setRefreshing(true);
        setPullDistance(0);
        // simple and reliable: reload the app so all data refetches
        window.location.reload();
      } else {
        setPullDistance(0);
      }
      startY = null;
      isTracking = false;
    };

    window.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [pullDistance, refreshing]);

  if (!pullDistance && !refreshing) {
    return null;
  }

  const offset = refreshing ? 40 : pullDistance / 3;

  return (
    <div
      className="absolute left-0 right-0 z-40 flex justify-center"
      style={{ top: 0, pointerEvents: 'none' }}
    >
      <div
        className="mt-3 px-3 py-1.5 rounded-full text-[11px]"
        style={{
          transform: `translateY(${offset}px)`,
          background: 'rgba(0,0,0,0.75)',
          color: 'var(--lala-soft)',
          border: '1px solid var(--lala-border)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {refreshing ? 'Refreshing…' : 'Pull down to refresh'}
      </div>
    </div>
  );
}

