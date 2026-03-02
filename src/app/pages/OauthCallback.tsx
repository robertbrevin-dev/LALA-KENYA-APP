import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';

export default function OauthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || '/home';

    // If this is in a popup, bounce the main app and close.
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.location.assign(next);
        window.close();
        return;
      }
    } catch {
      // ignore
    }

    // Fallback: just navigate in this window
    navigate(next, { replace: true });
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[14px]" style={{ color: 'var(--lala-muted)' }}>
          Completing sign in…
        </div>
      </div>
    </PhoneFrame>
  );
}

