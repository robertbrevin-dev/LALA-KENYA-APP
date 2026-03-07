import { Outlet } from 'react-router-dom';

export default function Root() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Outlet />
    </div>
  );
}
