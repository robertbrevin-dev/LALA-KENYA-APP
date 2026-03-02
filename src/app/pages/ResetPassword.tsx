import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm) {
      setError('Please fill in both fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col items-center justify-center px-8"
          style={{ background: 'var(--lala-night)', border: '1px solid var(--lala-border)', boxShadow: '0 60px 120px rgba(0,0,0,0.6)' }}>
          <BackRefreshBar />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="text-[80px] mb-6">✅</motion.div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: 'var(--lala-white)', textAlign: 'center', marginBottom: 12 }}>
            Password Updated!
          </h2>
          <p className="text-[14px] text-center mb-8" style={{ color: 'var(--lala-muted)', lineHeight: 1.7 }}>
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <button onClick={() => navigate('/login')}
            className="w-full py-4 rounded-[14px] border-none cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', color: 'var(--lala-night)', fontWeight: 700, fontSize: 15 }}>
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{ background: 'var(--lala-night)', border: '1px solid var(--lala-border)', boxShadow: '0 60px 120px rgba(0,0,0,0.6)' }}>
        <BackRefreshBar />

        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(232,184,109,0.12) 0%, transparent 70%)`
        }} />

        <div className="relative z-10 flex flex-col flex-1 px-8 pt-20 pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="text-[60px] mb-4">🔑</div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: 'var(--lala-white)' }}>
              Reset Password
            </h1>
            <p className="text-[14px] mt-2" style={{ color: 'var(--lala-muted)' }}>
              Enter your new password below
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4 mb-6">
            <div>
              <label className="text-[12px] mb-1.5 block" style={{ color: 'var(--lala-muted)', fontWeight: 500 }}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-4 rounded-[14px] text-[14px] outline-none"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}
              />
            </div>
            <div>
              <label className="text-[12px] mb-1.5 block" style={{ color: 'var(--lala-muted)', fontWeight: 500 }}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                className="w-full px-4 py-4 rounded-[14px] text-[14px] outline-none"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}
              />
            </div>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="px-4 py-3 rounded-[12px] text-[13px] mb-4"
              style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
              {error}
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onClick={handleReset}
            disabled={loading}
            className="w-full py-4 rounded-[14px] border-none cursor-pointer"
            style={{
              background: loading ? 'var(--lala-muted)' : 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
              color: 'var(--lala-night)', fontWeight: 700, fontSize: 15,
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Updating...' : 'Update Password'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
