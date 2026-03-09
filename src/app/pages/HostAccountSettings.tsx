import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../context/AppContext';
const TEAL = '#3ECFB2';
export default function HostAccountSettings() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [permitZone, setPermitZone] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;
    setAvatarLoading(true);
    const ext = file.name.split('.').pop();
    const path = 'avatars/' + currentUser.id + '.' + ext;
    const { error: upErr } = await supabase.storage.from('property-images').upload(path, file, { upsert: true });
    if (upErr) { setError(upErr.message); setAvatarLoading(false); return; }
    const { data } = supabase.storage.from('property-images').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', currentUser.id);
    setAvatarUrl(data.publicUrl);
    setAvatarLoading(false);
    setSuccess(true); setTimeout(() => setSuccess(false), 3000);
  };
  const handleSave = async () => {
    if (!currentUser?.id) return;
    setLoading(true); setError(''); setSuccess(false);
    const { error } = await supabase.from('profiles').update({ full_name: name, phone, permit_zone: permitZone }).eq('id', currentUser.id);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true); setTimeout(() => setSuccess(false), 3000);
  };
  return (
    <div style={{ background: '#03020a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 390, height: 844, borderRadius: 44, overflow: 'hidden', background: 'linear-gradient(170deg, #061412 0%, #080608 100%)', border: '1px solid rgba(62,207,178,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 24px 20px', borderBottom: '1px solid rgba(62,207,178,0.1)' }}>
          <button onClick={() => navigate('/host/profile')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>&#8592; Back</button>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white' }}>Account Settings</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Update your host account information</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'none' }}>
          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(62,207,178,0.1)', border: '2px solid rgba(62,207,178,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, fontWeight: 700, color: TEAL }}>{(currentUser?.name || 'H').charAt(0).toUpperCase()}</span>}
              </div>
              <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #061412', fontSize: 13 }}>
                {avatarLoading ? '...' : 'edit'}
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Tap to update profile photo</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>FULL NAME</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={{ width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.15)', color: 'white', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>EMAIL ADDRESS</div>
            <input value={currentUser?.email || ''} disabled style={{ width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Email cannot be changed here</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>PHONE NUMBER</div>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" style={{ width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.15)', color: 'white', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>BUSINESS PERMIT ZONE</div>
            <input value={permitZone} onChange={e => setPermitZone(e.target.value)} placeholder="e.g. Nairobi CBD, Westlands, Kilimani" style={{ width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.15)', color: 'white', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>The county/zone where your business permit was issued</div>
          </div>
          {error && <div style={{ padding: '12px 16px', borderRadius: 12, fontSize: 13, marginBottom: 16, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>{error}</div>}
          {success && <div style={{ padding: '12px 16px', borderRadius: 12, fontSize: 13, marginBottom: 16, background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)', color: TEAL }}>Account updated successfully!</div>}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: 16, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: loading ? 'rgba(255,255,255,0.3)' : '#061412' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Security</div>
            <button onClick={() => navigate('/forgot-password/host')} style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14 }}>Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}
