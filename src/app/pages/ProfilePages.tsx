import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

export function PersonalInformation() {
  const navigate = useNavigate();
  const { currentUser, updateUserAvatar, removeUserAvatar } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
    }
  }, [currentUser?.id]);

  const handleSave = async () => {
    if (!currentUser?.id) {
      setError('Sign in required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const nextName = name.trim();
      const nextPhone = phone.trim();

      // Persist to profile table (for app queries)
      const { error: profErr } = await supabase.from('profiles').upsert(
        {
          id: currentUser.id,
          full_name: nextName,
          email,
          phone: nextPhone,
        },
        { onConflict: 'id' }
      );
      if (profErr) throw profErr;

      // Persist to Auth metadata (so AppContext currentUser picks it up)
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: nextName, phone: nextPhone },
      });
      if (authErr) throw authErr;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const openCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (e) {
      setError('Camera unavailable. Use Upload from gallery/files.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth || 320, video.videoHeight || 320);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sx = ((video.videoWidth || size) - size) / 2;
    const sy = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const url = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(url);
    stopCamera();
  };

  const handleFilePick = (file: File) => {
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPreview = async () => {
    if (!previewUrl) return;
    if (!currentUser?.id) {
      setError('Sign in required.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const ext = 'jpg';
      const path = `avatars/${currentUser.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
      if (upErr) {
        await updateUserAvatar(previewUrl);
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        const url = data.publicUrl;
        await updateUserAvatar(url);
      }
      setShowPhoto(false);
      setPreviewUrl(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentUser?.id) {
      setError('Sign in required.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await removeUserAvatar();
      setShowPhoto(false);
      setPreviewUrl(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError('Failed to remove photo. Try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-6 pt-14 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/profile')} style={{ color: 'var(--lala-gold)', fontSize: 20 }}>←</button>
          <h1 className="text-[22px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>Personal Information</h1>
        </div>
        <div className="px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-[36px] mb-3"
              style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', color: 'var(--lala-night)', fontWeight: 700 }}>
              {currentUser?.avatar ? (
                <img src={currentUser?.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                (currentUser?.name?.[0] || 'G')
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { setShowPhoto(true); setError(''); }} className="text-[13px]" style={{ color: 'var(--lala-gold)', fontWeight: 600 }}>Change Photo</button>
              {currentUser?.avatar && (
                <button onClick={handleRemovePhoto} className="text-[13px]" style={{ color: 'var(--lala-muted)', fontWeight: 600 }}>
                  Remove
                </button>
              )}
            </div>
          </motion.div>
          {[
            { label: 'Full Name', value: name, onChange: setName, type: 'text' },
            { label: 'Email Address', value: email, onChange: setEmail, type: 'email' },
            { label: 'Phone Number', value: phone, onChange: setPhone, type: 'tel' },
          ].map((field, i) => (
            <motion.div key={field.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="mb-4">
              <label className="text-[12px] mb-1.5 block" style={{ color: 'var(--lala-muted)', fontWeight: 500 }}>{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}
              />
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-[16px] p-4 mb-6" style={{ background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.2)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] mb-0.5" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>Identity Verification</div>
                <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>Upload National ID or Passport</div>
              </div>
              <div className="text-[11px] px-3 py-1 rounded-[20px]" style={{ background: 'rgba(62,207,178,0.15)', color: 'var(--lala-teal)', fontWeight: 600 }}>PENDING</div>
            </div>
          </motion.div>
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-[14px] border-none cursor-pointer"
            style={{
              background: saving
                ? 'rgba(255,255,255,0.08)'
                : saved
                  ? 'var(--lala-teal)'
                  : 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
              color: saving ? 'rgba(255,255,255,0.5)' : 'var(--lala-night)',
              fontWeight: 700,
              fontSize: 15,
              opacity: saving ? 0.8 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}>
            {saving ? 'Saving…' : saved ? '✅ Saved!' : 'Save Changes'}
          </motion.button>
          {showPhoto && (
            <div className="absolute inset-0 z-50 flex items-end justify-center">
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { setShowPhoto(false); stopCamera(); setPreviewUrl(null); }} />
              <div className="relative w-full max-w-sm rounded-t-2xl p-4" style={{ background: 'var(--lala-deep)', border: '1px solid var(--lala-border)' }}>
                <div className="text-center text-[15px] mb-3" style={{ color: 'var(--lala-white)', fontWeight: 700 }}>Profile Photo</div>
                {!!error && <div className="text-[12px] mb-2" style={{ color: '#FF6B6B' }}>{error}</div>}
                {!cameraActive && !previewUrl && (
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={openCamera} className="py-3 rounded-[12px]" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)', fontWeight: 600 }}>
                      Take Photo with Camera
                    </button>
                    <label className="py-3 rounded-[12px] text-center cursor-pointer" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)', fontWeight: 600 }}>
                      Upload from Gallery/Files
                      <input onChange={e => { const f = e.target.files?.[0]; if (f) handleFilePick(f); }} type="file" accept="image/*" className="hidden" />
                    </label>
                    {currentUser?.avatar && (
                      <button disabled={uploading} onClick={handleRemovePhoto} className="py-3 rounded-[12px]" style={{ background: 'transparent', border: '1px solid var(--lala-border)', color: '#FF6B6B', fontWeight: 600 }}>
                        {uploading ? 'Removing…' : 'Remove Current Photo'}
                      </button>
                    )}
                    <button onClick={() => setShowPhoto(false)} className="py-3 rounded-[12px]" style={{ background: 'transparent', border: '1px solid var(--lala-border)', color: 'var(--lala-soft)', fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                )}
                {cameraActive && !previewUrl && (
                  <div className="flex flex-col items-center gap-3">
                    <video ref={videoRef} playsInline className="w-full rounded-[12px]" />
                    <div className="flex gap-2 w-full">
                      <button onClick={capturePhoto} className="flex-1 py-3 rounded-[12px]" style={{ background: 'var(--lala-gold)', color: 'var(--lala-night)', fontWeight: 700 }}>
                        Capture
                      </button>
                      <button onClick={() => { stopCamera(); setCameraActive(false); }} className="flex-1 py-3 rounded-[12px]" style={{ background: 'transparent', border: '1px solid var(--lala-border)', color: 'var(--lala-soft)', fontWeight: 600 }}>
                        Close
                      </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
                {!!previewUrl && (
                  <div className="flex flex-col items-center gap-3">
                    <img src={previewUrl} alt="preview" className="w-40 h-40 rounded-full object-cover" />
                    <div className="flex gap-2 w-full">
                      <button disabled={uploading} onClick={uploadPreview} className="flex-1 py-3 rounded-[12px]" style={{ background: 'var(--lala-gold)', color: 'var(--lala-night)', fontWeight: 700 }}>
                        {uploading ? 'Uploading…' : 'Use Photo'}
                      </button>
                      <button onClick={() => { setPreviewUrl(null); }} className="flex-1 py-3 rounded-[12px]" style={{ background: 'transparent', border: '1px solid var(--lala-border)', color: 'var(--lala-soft)', fontWeight: 600 }}>
                        Choose Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

export function LoginSecurity() {
  const navigate = useNavigate();
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-6 pt-14 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/profile')} style={{ color: 'var(--lala-gold)', fontSize: 20 }}>←</button>
          <h1 className="text-[22px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>Login & Security</h1>
        </div>
        <div className="px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>PASSWORD</div>
            <div className="rounded-[16px] overflow-hidden" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => (
                <div key={label} className="px-4 py-3.5" style={{ borderBottom: i < 2 ? '1px solid var(--lala-border)' : 'none' }}>
                  <label className="text-[11px] mb-1 block" style={{ color: 'var(--lala-muted)' }}>{label}</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-transparent outline-none text-[14px]"
                    style={{ color: 'var(--lala-white)', border: 'none' }} />
                </div>
              ))}
            </div>
            <button className="w-full py-3 mt-3 rounded-[14px]" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-gold)', fontWeight: 600 }}>
              Update Password
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 mb-3">
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>SECURITY</div>
            <div className="rounded-[16px] overflow-hidden" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              {[
                { label: '2-Factor Authentication', sub: 'SMS code on login', value: twoFA, onChange: setTwoFA },
                { label: 'Biometric Login', sub: 'Fingerprint or Face ID', value: biometric, onChange: setBiometric },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-4"
                  style={{ borderBottom: i === 0 ? '1px solid var(--lala-border)' : 'none' }}>
                  <div>
                    <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 500 }}>{item.label}</div>
                    <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>{item.sub}</div>
                  </div>
                  <button onClick={() => item.onChange(!item.value)}
                    className="w-12 h-6 rounded-full transition-all relative"
                    style={{ background: item.value ? 'var(--lala-teal)' : 'var(--lala-border)' }}>
                    <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                      style={{ left: item.value ? '26px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>ACTIVE SESSIONS</div>
            <div className="rounded-[16px] p-4" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 500 }}>This Device</div>
                  <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>Nairobi, Kenya · Active now</div>
                </div>
                <div className="text-[11px] px-2.5 py-1 rounded-[20px]" style={{ background: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)', fontWeight: 600 }}>CURRENT</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

export function PaymentMethods() {
  const navigate = useNavigate();

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-6 pt-14 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/profile')} style={{ color: 'var(--lala-gold)', fontSize: 20 }}>←</button>
          <h1 className="text-[22px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>Payment Methods</h1>
        </div>
        <div className="px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>SAVED METHODS</div>
            <div className="rounded-[16px] p-4 flex items-center justify-between" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-[20px]" style={{ background: '#00a651' }}>📱</div>
                <div>
                  <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>M-Pesa</div>
                  <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>+254 712 345 678</div>
                </div>
              </div>
              <div className="text-[11px] px-2.5 py-1 rounded-[20px]" style={{ background: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)', fontWeight: 600 }}>DEFAULT</div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>TRANSACTION HISTORY</div>
            {[
              { title: 'Modern Studio Apt', date: 'Mar 1, 2026', amount: 7000, status: 'Paid' },
              { title: 'Luxury 1BR Suite', date: 'Feb 22, 2026', amount: 5200, status: 'Paid' },
              { title: 'Executive Penthouse', date: 'Feb 10, 2026', amount: 17000, status: 'Refunded' },
            ].map((tx, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-[16px] p-4 mb-2.5 flex items-center justify-between"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                <div>
                  <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>{tx.title}</div>
                  <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>{tx.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-[14px]" style={{ color: tx.status === 'Refunded' ? '#FF6B6B' : 'var(--lala-teal)', fontWeight: 700 }}>
                    {tx.status === 'Refunded' ? '+' : '-'}Ksh {tx.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>{tx.status}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="w-full py-4 mt-4 rounded-[16px] border-2 border-dashed cursor-pointer"
            style={{ background: 'transparent', borderColor: 'var(--lala-border)', color: 'var(--lala-gold)', fontWeight: 600 }}>
            + Add Payment Method
          </motion.button>
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

export function NotificationSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    booking_confirmed: true,
    payment_received: true,
    new_message: true,
    review_received: true,
    payout_sent: true,
    promotions: false,
    sms_alerts: true,
    email_alerts: true,
  });

  const toggle = (key: keyof typeof settings) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const groups = [
    { title: 'BOOKING ALERTS', items: [
      { key: 'booking_confirmed', label: 'Booking Confirmed', sub: 'When a booking is confirmed' },
      { key: 'payment_received', label: 'Payment Received', sub: 'When M-Pesa payment is received' },
      { key: 'review_received', label: 'New Review', sub: 'When a guest leaves a review' },
    ]},
    { title: 'MESSAGES', items: [
      { key: 'new_message', label: 'New Messages', sub: 'When you receive a message' },
    ]},
    { title: 'PAYOUTS', items: [
      { key: 'payout_sent', label: 'Payout Sent', sub: 'When earnings are sent to M-Pesa' },
    ]},
    { title: 'CHANNELS', items: [
      { key: 'sms_alerts', label: 'SMS Alerts', sub: 'Receive SMS notifications' },
      { key: 'email_alerts', label: 'Email Alerts', sub: 'Receive email notifications' },
      { key: 'promotions', label: 'Promotions', sub: 'Special offers and updates' },
    ]},
  ];

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-6 pt-14 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/profile')} style={{ color: 'var(--lala-gold)', fontSize: 20 }}>←</button>
          <h1 className="text-[22px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>Notifications</h1>
        </div>
        <div className="px-6 pb-24">
          {groups.map((group, gi) => (
            <motion.div key={group.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }} className="mb-5">
              <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>{group.title}</div>
              <div className="rounded-[16px] overflow-hidden" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                {group.items.map((item, i) => (
                  <div key={item.key} className="flex items-center justify-between px-4 py-4"
                    style={{ borderBottom: i < group.items.length - 1 ? '1px solid var(--lala-border)' : 'none' }}>
                    <div>
                      <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 500 }}>{item.label}</div>
                      <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>{item.sub}</div>
                    </div>
                    <button onClick={() => toggle(item.key as keyof typeof settings)}
                      className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                      style={{ background: settings[item.key as keyof typeof settings] ? 'var(--lala-gold)' : 'var(--lala-border)' }}>
                      <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                        style={{ left: settings[item.key as keyof typeof settings] ? '26px' : '2px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

export function HelpCenter() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'How do I book a property?', a: 'Browse properties, select your dates, tap "Book Instantly" or "Request to Book", then pay via M-Pesa STK Push. You\'ll receive confirmation immediately.' },
    { q: 'How does M-Pesa payment work?', a: 'We use Safaricom Daraja API. When you pay, an STK Push is sent to your phone. Enter your M-Pesa PIN to complete payment.' },
    { q: 'What is the cancellation policy?', a: 'Each property has its own policy — Flexible, Moderate, Strict, or Super Strict. Check the property detail page before booking.' },
    { q: 'How do I become a host?', a: 'Tap "Switch to Host Mode" in your profile. Complete business verification and KYC. List your first property and start earning.' },
    { q: 'When do hosts get paid?', a: 'Hosts are paid via M-Pesa within 24 hours of guest check-in. LALA deducts a 10% platform commission before payout.' },
    { q: 'How do I report an issue?', a: 'Email support@lala.co.ke or call our 24/7 line: +254 800 LALA KE.' },
  ];

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-6 pt-14 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/profile')} style={{ color: 'var(--lala-gold)', fontSize: 20 }}>←</button>
          <h1 className="text-[22px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>Help Center</h1>
        </div>
        <div className="px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="rounded-[16px] px-4 py-3.5 flex items-center gap-2.5"
              style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <span>🔍</span>
              <input placeholder="Search help articles..." className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ color: 'var(--lala-white)', border: 'none' }} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: '💬', label: 'Live Chat', sub: 'Chat with support' },
              { icon: '📞', label: 'Call Us', sub: '+254 800 LALA KE' },
              { icon: '📧', label: 'Email', sub: 'support@lala.co.ke' },
              { icon: '📖', label: 'Guides', sub: 'How-to articles' },
            ].map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
                className="rounded-[16px] p-4 cursor-pointer" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                <div className="text-[24px] mb-2">{action.icon}</div>
                <div className="text-[13px]" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>{action.label}</div>
                <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>{action.sub}</div>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>FREQUENTLY ASKED</div>
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-[14px] mb-2 overflow-hidden cursor-pointer"
              style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-[13px]" style={{ color: 'var(--lala-white)', fontWeight: 500 }}>{faq.q}</span>
                <span style={{ color: 'var(--lala-gold)' }}>{openFaq === i ? '▲' : '▼'}</span>
              </div>
              {openFaq === i && (
                <div className="px-4 pb-4 text-[13px] leading-relaxed" style={{ color: 'var(--lala-soft)', borderTop: '1px solid var(--lala-border)' }}>
                  <div className="pt-3">{faq.a}</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

export function TermsAndPolicies() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(0);

  const sections = [
    { title: 'Terms of Service', content: `LALA Kenya is a short-stay booking platform connecting guests and hosts across East Africa. By using our platform you agree to these terms.\n\nGuests must be 18+ to book. All bookings are subject to host approval. LALA holds payments securely until check-in.\n\nLALA charges a 10% platform commission on all completed bookings. Service fees apply to guests. All fees are shown transparently before booking.` },
    { title: 'Privacy Policy', content: `We collect your name, email, phone number, and payment information to facilitate bookings. Your data is stored securely on Supabase servers.\n\nWe do not sell your personal data to third parties. We use your phone number for M-Pesa payments and booking notifications only.` },
    { title: 'Host Guidelines', content: `Hosts must provide accurate property descriptions and photos. Properties must meet LALA safety standards. Hosts must have valid KRA PIN and business registration for payouts.\n\nHosts must respond to booking requests within 24 hours. Repeated cancellations may result in account suspension.` },
    { title: 'Cancellation & Refund Policy', content: `Flexible: Full refund if cancelled 24+ hours before check-in.\nModerate: Full refund 5+ days before. 50% within 5 days.\nStrict: Full refund 7+ days before. No refund within 7 days.\nSuper Strict: 50% refund 14+ days before. No refund within 14 days.\n\nAll refunds are processed back to the original M-Pesa number within 3-5 business days.` },
    { title: 'Commission Structure', content: `LALA Kenya operates as a broker between guests and hosts.\n\nGuests pay a 10% service fee on top of the property price.\nHosts pay a 10% platform commission deducted from their payout.\n\nExample: Property listed at Ksh 5,000/night\nGuest pays: Ksh 5,000 + Ksh 500 service fee = Ksh 5,500\nHost receives: Ksh 5,000 - Ksh 500 commission = Ksh 4,500\nLALA earns: Ksh 1,000 per booking` },
  ];

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-6 pt-14 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/profile')} style={{ color: 'var(--lala-gold)', fontSize: 20 }}>←</button>
          <h1 className="text-[22px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>Terms & Policies</h1>
        </div>
        <div className="px-6 pb-24">
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-[16px] mb-3 overflow-hidden cursor-pointer"
              style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}
              onClick={() => setOpen(open === i ? null : i)}>
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[15px]" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>{section.title}</span>
                <span style={{ color: 'var(--lala-gold)' }}>{open === i ? '▲' : '▼'}</span>
              </div>
              {open === i && (
                <div className="px-4 pb-4 text-[13px] leading-relaxed whitespace-pre-line"
                  style={{ color: 'var(--lala-soft)', borderTop: '1px solid var(--lala-border)' }}>
                  <div className="pt-3">{section.content}</div>
                </div>
              )}
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center mt-4 text-[12px]" style={{ color: 'var(--lala-muted)' }}>
            Last updated: March 2026 · LALA Kenya Ltd
          </motion.div>
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

export function HostPayoutMethods() {
  const navigate = useNavigate();
  const [mpesaNumber, setMpesaNumber] = useState('+254700000001');

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-6 pt-14 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/host/profile')} style={{ color: 'var(--lala-gold)', fontSize: 20 }}>←</button>
          <h1 className="text-[22px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>Payout Methods</h1>
        </div>
        <div className="px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] p-5 mb-5" style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)' }}>
            <div className="text-[13px] mb-1" style={{ color: 'rgba(13,15,20,0.6)', fontWeight: 500 }}>Available for Payout</div>
            <div className="text-[32px] mb-1" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-night)' }}>Ksh 76,050</div>
            <div className="text-[12px]" style={{ color: 'rgba(13,15,20,0.55)' }}>After 10% LALA commission deduction</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-[16px] p-4 mb-5" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>THIS MONTH BREAKDOWN</div>
            {[
              { label: 'Gross Bookings', amount: 'Ksh 84,500', color: 'var(--lala-white)' },
              { label: 'LALA Commission (10%)', amount: '- Ksh 8,450', color: '#FF6B6B' },
              { label: 'Your Net Payout', amount: 'Ksh 76,050', color: 'var(--lala-teal)' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2"
                style={{ borderBottom: i < 2 ? '1px solid var(--lala-border)' : 'none' }}>
                <span className="text-[13px]" style={{ color: 'var(--lala-soft)' }}>{row.label}</span>
                <span className="text-[14px]" style={{ color: row.color, fontWeight: 700 }}>{row.amount}</span>
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-5">
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>PAYOUT ACCOUNT</div>
            <div className="rounded-[16px] p-4" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-[20px]" style={{ background: '#00a651' }}>📱</div>
                <div>
                  <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>M-Pesa</div>
                  <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>{mpesaNumber}</div>
                </div>
              </div>
              <input value={mpesaNumber} onChange={e => setMpesaNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] text-[14px] outline-none"
                style={{ background: 'var(--lala-deep)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>PAYOUT HISTORY</div>
            {[
              { date: 'Mar 1, 2026', amount: 6300, ref: 'QKX234HJP', status: 'Sent' },
              { date: 'Feb 22, 2026', amount: 4680, ref: 'PLM991KJH', status: 'Sent' },
              { date: 'Feb 10, 2026', amount: 15300, ref: 'NVB445RTY', status: 'Sent' },
            ].map((payout, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                className="rounded-[16px] p-4 mb-2.5 flex items-center justify-between"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                <div>
                  <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>{payout.date}</div>
                  <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>Ref: {payout.ref}</div>
                </div>
                <div className="text-right">
                  <div className="text-[15px]" style={{ color: 'var(--lala-teal)', fontWeight: 700 }}>+Ksh {payout.amount.toLocaleString()}</div>
                  <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>{payout.status}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="w-full py-4 mt-4 rounded-[14px] border-none cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', color: 'var(--lala-night)', fontWeight: 700, fontSize: 15 }}>
            Request Payout Now
          </motion.button>
        </div>
      </div>
      <BottomNav type="host" />
    </PhoneFrame>
  );
}

export function PerformanceInsights() {
  const navigate = useNavigate();
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const earnings = [45000, 52000, 68000, 61000, 69000, 84500];
  const maxEarning = Math.max(...earnings);

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="px-6 pt-14 pb-5 flex items-center gap-3">
          <button onClick={() => navigate('/host/profile')} style={{ color: 'var(--lala-gold)', fontSize: 20 }}>←</button>
          <h1 className="text-[22px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>Performance Insights</h1>
        </div>
        <div className="px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] p-5 mb-5" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
            <div className="text-[14px] mb-4" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>6-Month Earnings</div>
            <div className="flex items-end justify-between gap-2 h-[120px] mb-3">
              {earnings.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxEarning) * 100}px` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-[6px]"
                    style={{ background: i === 5 ? 'var(--lala-gold)' : 'rgba(232,184,109,0.3)', minHeight: 4 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {months.map((m, i) => (
                <div key={i} className="flex-1 text-center text-[11px]" style={{ color: i === 5 ? 'var(--lala-gold)' : 'var(--lala-muted)' }}>{m}</div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: '📈', label: 'Growth', value: '+23%', sub: 'vs last month' },
              { icon: '🏠', label: 'Occupancy', value: '91%', sub: 'this month' },
              { icon: '⭐', label: 'Avg Rating', value: '4.9', sub: 'all time' },
              { icon: '⚡', label: 'Response', value: '< 1hr', sub: 'avg time' },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="rounded-[16px] p-4" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                <div className="text-[22px] mb-2">{kpi.icon}</div>
                <div className="text-[22px] mb-0.5" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--lala-white)' }}>{kpi.value}</div>
                <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>{kpi.label} · {kpi.sub}</div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>TOP PERFORMING PROPERTIES</div>
            {[
              { name: 'Executive Penthouse', earnings: 42500, bookings: 5, rating: 4.9 },
              { name: 'Luxury 1BR Suite', earnings: 26000, bookings: 5, rating: 4.8 },
              { name: 'Modern Studio Apt', earnings: 16000, bookings: 2, rating: 4.9 },
            ].map((prop, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="rounded-[16px] p-4 mb-2.5" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>{prop.name}</div>
                  <div className="text-[14px]" style={{ color: 'var(--lala-gold)', fontWeight: 700 }}>Ksh {prop.earnings.toLocaleString()}</div>
                </div>
                <div className="flex gap-4 text-[12px]" style={{ color: 'var(--lala-muted)' }}>
                  <span>📅 {prop.bookings} bookings</span>
                  <span>⭐ {prop.rating} rating</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      <BottomNav type="host" />
    </PhoneFrame>
  );
}
