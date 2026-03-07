import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import { supabase } from '../../lib/supabase';

export default function OauthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || '/home';
    const code = params.get('code');

    const complete = async () => {
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            // continue navigation; App will show auth UI
          }
        } catch {
          // ignore and continue
        }
      }

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
    };

    complete();
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

