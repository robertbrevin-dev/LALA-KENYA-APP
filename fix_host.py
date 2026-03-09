# Fix HostResources - make links clickable
c = open('src/app/pages/HostResources.tsx', encoding='utf-8').read()
old = '''            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 6 }}>Need help?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>Host support 24/7. Email lalakenya@gmail.com or WhatsApp +254 114 040 146</div>
          </div>'''
new = '''            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 10 }}>Need help?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Host support available 24/7.</div>
            <a href="mailto:lalakenya@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.15)', textDecoration: 'none', marginBottom: 8 }}>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Email Support</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>lalakenya@gmail.com</div></div>
            </a>
            <a href="https://wa.me/254114040146" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', textDecoration: 'none' }}>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>WhatsApp Us</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>+254 114 040 146</div></div>
            </a>
          </div>'''
r = c.replace(old, new)
open('src/app/pages/HostResources.tsx', 'w', encoding='utf-8').write(r)
print('HostResources:', r != c)

# Fix HostAccountSettings - add profile photo upload
c2 = open('src/app/pages/HostAccountSettings.tsx', encoding='utf-8').read()

# Add avatarUrl state
c2 = c2.replace(
    "  const [loading, setLoading] = useState(false);",
    "  const [loading, setLoading] = useState(false);\n  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');\n  const [avatarLoading, setAvatarLoading] = useState(false);"
)

# Add upload handler before handleSave
c2 = c2.replace(
    "  const handleSave = async () => {",
    """  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleSave = async () => {"""
)

# Add photo UI before FULL NAME field
c2 = c2.replace(
    "          <div style={{ marginBottom: 20 }}>\n            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>FULL NAME</div>",
    """          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>FULL NAME</div>"""
)

open('src/app/pages/HostAccountSettings.tsx', 'w', encoding='utf-8').write(c2)
print('HostAccountSettings done')
