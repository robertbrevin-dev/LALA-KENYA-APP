import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

// ─── Geocode a place name → { lat, lng } using OpenStreetMap Nominatim ───
async function geocodeArea(areaName: string): Promise<{ lat: number; lng: number }> {
  const query = `${areaName.trim()}, Nairobi, Kenya`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'LalaKenyaApp/1.0' },
  });
  if (!res.ok) throw new Error('Geocoding service unavailable. Please try again.');
  const results = await res.json();
  if (!results || results.length === 0) {
    throw new Error(`Could not find "${areaName}" on the map. Try a more specific area name.`);
  }
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

export default function HostListings() {
  const navigate = useNavigate();
  const { currentUser, loading: appLoading } = useApp();
  const user = currentUser;
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Apartment');
  const [bedrooms, setBedrooms] = useState('1');
  const [maxGuests, setMaxGuests] = useState('2');
  const [partyAllowed, setPartyAllowed] = useState(false);
  const [locationVisible, setLocationVisible] = useState(true); // NEW: location visibility
  const amenitiesList = ['Wi‑Fi', 'Parking', 'Kitchen', 'TV', 'Washer', 'Air Conditioning'];
  const [amenities, setAmenities] = useState<string[]>([]);
  const [otherAmenities, setOtherAmenities] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [editListing, setEditListing] = useState<any|null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editType, setEditType] = useState('Apartment');
  const [editBedrooms, setEditBedrooms] = useState('1');
  const [editMaxGuests, setEditMaxGuests] = useState('2');
  const [editDescription, setEditDescription] = useState('');
  const [editPartyAllowed, setEditPartyAllowed] = useState(false);
  const [editLocationVisible, setEditLocationVisible] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [savingStep, setSavingStep] = useState(''); // NEW: show progress step
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    if (!appLoading && !user) navigate('/login');
  }, [appLoading, user, navigate]);

  useEffect(() => {
    async function fetchListings() {
      if (!user?.id) { setListings([]); setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase!
        .from('properties')
        .select('*')
        .eq('host_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      setListings(data || []);
      setLoading(false);
    }
    fetchListings();
  }, [user?.id]);

  // ─── Toggle listing active/paused ───────────────────────────────────────
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
    const { error } = await supabase!.from('properties').update({ listing_status: newStatus }).eq('id', id);
    if (!error) setListings(prev => prev.map(l => l.id === id ? { ...l, listing_status: newStatus } : l));
  };

  // ─── NEW: Toggle location pin visible/hidden ─────────────────────────────
  const handleToggleLocationVisible = async (id: string, current: boolean) => {
    const { error } = await supabase!
      .from('properties')
      .update({ location_visible: !current })
      .eq('id', id);
    if (!error) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, location_visible: !current } : l));
    }
  };


  const handleSaveEdit = async () => {
    if (!editListing) return;
    if (!editTitle || !editArea || !editPrice) { setEditError('Title, area, and price are required'); return; }
    setEditSaving(true); setEditError('');
    try {
      let lat = editListing.latitude, lng = editListing.longitude, loc = editListing.location;
      if (editArea.trim() !== (editListing.area||'').trim()) {
        const r = await fetch('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(editArea+', Nairobi, Kenya')+'&format=json&limit=1',{headers:{'Accept-Language':'en','User-Agent':'LalaKenyaApp/1.0'}});
        const res = await r.json();
        if (res?.length) { lat=parseFloat(res[0].lat); lng=parseFloat(res[0].lon); loc='POINT('+lng+' '+lat+')'; }
      }
      const { data: updated, error: upErr } = await supabase!.from('properties').update({
        title:editTitle.trim(), area:editArea.trim(), location:loc, latitude:lat, longitude:lng,
        location_visible:editLocationVisible, price_per_night:Number(editPrice),
        property_type:editType, bedrooms:Number(editBedrooms), beds:Number(editBedrooms),
        max_guests:Number(editMaxGuests), description:editDescription.trim(),
        house_rules:[editPartyAllowed?'Parties allowed':'No parties'],
      }).eq('id',editListing.id).select('*').single();
      if (upErr) throw new Error(upErr.message);
      setListings(prev=>prev.map(l=>l.id===editListing.id?{...l,...updated}:l));
      setEditListing(null);
    } catch(e:any) { setEditError(e.message||'Failed to save'); }
    finally { setEditSaving(false); }
  };
  const statusStyle = (status: string) => {
    if (status === 'approved') return { bg: 'rgba(62,207,178,0.12)', color: '#3ECFB2' };
    if (status === 'suspended') return { bg: 'rgba(255,107,107,0.12)', color: '#FF6B6B' };
    if (status === 'pending_review') return { bg: 'rgba(232,184,109,0.12)', color: '#E8B86D' };
    return { bg: 'rgba(150,150,150,0.12)', color: 'rgba(255,255,255,0.4)' };
  };

  // ─── Create property: geocode area → store WKT geometry ─────────────────
  const handleCreate = async () => {
    if (!user?.id) { setError('Sign in required'); return; }
    if (!title || !area || !price) { setError('Title, area, and price are required'); return; }
    if (files.length === 0) { setError('At least one photo is required'); return; }

    setSaving(true);
    setError('');

    try {
      // Step 1: Geocode the area name → real coordinates
      setSavingStep('Locating area on map…');
      const coords = await geocodeArea(area);
      // PostGIS WKT format: POINT(longitude latitude)
      const locationWKT = `POINT(${coords.lng} ${coords.lat})`;

      // Step 2: Upload images
      setSavingStep('Uploading photos…');
      const uploadedUrls: string[] = [];
      for (let i = 0; i < Math.min(files.length, 6); i++) {
        const f = files[i];
        const fileExt = f.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;

        if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
          throw new Error(`Invalid file type: ${fileExt}. Only JPG, PNG, and WebP are allowed.`);
        }
        if (f.size > 5 * 1024 * 1024) {
          throw new Error(`File too large: ${f.name}. Maximum size is 5MB.`);
        }

        const { error: upErr } = await supabase!.storage
          .from('property-images')
          .upload(fileName, f, { upsert: true, contentType: f.type || 'image/jpeg' });

        if (upErr) throw new Error(`Failed to upload ${f.name}: ${upErr.message}`);

        const { data } = supabase!.storage.from('property-images').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      // Step 3: Insert property
      setSavingStep('Saving property…');
      const primaryImageUrl = uploadedUrls[0];
      const mergedAmenities = [
        ...amenities,
        ...otherAmenities.split(',').map(a => a.trim()).filter(a => a.length > 0),
      ];
      const houseRules: string[] = [partyAllowed ? 'Parties allowed' : 'No parties'];

      const { data: inserted, error: insErr } = await supabase!.from('properties').insert({
        title: title.trim(),
        area: area.trim(),
        // location: skipped — geometry column needs raw SQL
        latitude: coords.lat,           // Store raw coords too for easy map use
        longitude: coords.lng,
        location_visible: locationVisible, // ✅ Host can hide/show pin
        price_per_night: Number(price),
        property_type: type,
        bedrooms: Number(bedrooms),
        beds: Number(bedrooms),
        max_guests: Number(maxGuests),
        amenities: mergedAmenities,
        house_rules: houseRules,
        description: description.trim(),
        host_id: user.id,
        primary_image_url: primaryImageUrl,
        image_urls: uploadedUrls,
        listing_status: 'approved',
        is_featured: false,
        instant_book: false,
        deleted_at: null,
      }).select('*').single();

      if (insErr) {
        console.error('Insert error:', insErr);
        throw new Error(`Failed to save property: ${insErr.message}`);
      }

      // Success — reset form
      setListings(prev => [inserted, ...prev]);
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowAdd(false); }, 2200);
      setTitle(''); setArea(''); setPrice(''); setType('Apartment');
      setBedrooms('1'); setMaxGuests('2'); setPartyAllowed(false);
      setLocationVisible(true); setAmenities([]); setOtherAmenities('');
      setDescription(''); setFiles([]);

    } catch (e: any) {
      console.error('Property creation error:', e);
      setError(e.message || 'Failed to create property. Please try again.');
    } finally {
      setSaving(false);
      setSavingStep('');
    }
  };

  if (appLoading && !user) {
    return (
      <PhoneFrame>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <BackRefreshBar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[14px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading…</div>
          </div>
        </div>
        <BottomNav type="host" />
      </PhoneFrame>
    );
  }

  if (!user) return null;

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <BackRefreshBar />

        {/* Header */}
        <div className="px-6 pt-14 pb-6" style={{ background: 'linear-gradient(160deg, #061412 0%, #0a1f1b 60%, transparent 100%)' }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-[28px] mb-1"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'white' }}>
            My Listings
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-[13px]" style={{ color: 'rgba(62,207,178,0.7)' }}>
            {listings.length} {listings.length === 1 ? 'property' : 'properties'}
          </motion.p>
        </div>

        <div className="px-6 pb-24">
          {loading ? (
            <div className="text-center py-10" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
          ) : listings.length === 0 ? (
            <div className="rounded-[20px] p-10 text-center mb-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.15)' }}>
              <div className="text-[48px] mb-3">🏠</div>
              <div className="text-[15px] mb-1" style={{ color: 'white', fontWeight: 600 }}>No listings yet</div>
              <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Add your first property below</div>
            </div>
          ) : (
            listings.map((listing, index) => (
              <motion.div key={listing.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[16px] p-4 mb-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.15)' }}>

                <div className="flex gap-3 mb-3">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(232,184,109,0.2), rgba(62,207,178,0.1))' }}>
                    {listing.primary_image_url
                      ? <img src={listing.primary_image_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 28 }}>🏢</span>}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div className="text-[15px] flex-1 pr-2" style={{ fontWeight: 600, color: 'white' }}>
                        {listing.title}
                      </div>
                      <div className="text-[10px] px-2 py-0.5 rounded-[20px] uppercase flex-shrink-0"
                        style={{ background: statusStyle(listing.listing_status).bg, color: statusStyle(listing.listing_status).color, fontWeight: 600 }}>
                        {listing.listing_status?.replace('_', ' ')}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>
                      📍 {listing.area || listing.address || 'Nairobi'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[14px]" style={{ color: '#E8B86D', fontWeight: 700 }}>
                        Ksh {listing.price_per_night?.toLocaleString()}
                      </div>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>/ night</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 py-3 mb-3"
                  style={{ borderTop: '1px solid var(--lala-border)', borderBottom: '1px solid var(--lala-border)' }}>
                  <div className="flex-1 text-center">
                    <div className="text-[16px] mb-0.5" style={{ fontWeight: 700, color: 'white' }}>{listing.rating || '—'}</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>⭐ Rating</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[16px] mb-0.5" style={{ fontWeight: 700, color: 'white' }}>{listing.total_reviews || 0}</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Reviews</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[16px] mb-0.5" style={{ fontWeight: 700, color: listing.instant_book ? 'var(--lala-teal)' : 'var(--lala-muted)' }}>
                      {listing.instant_book ? '⚡' : '—'}
                    </div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Instant</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[16px] mb-0.5" style={{ fontWeight: 700, color: 'white' }}>{listing.bedrooms || 1}</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Beds</div>
                  </div>
                </div>

                {/* ─── NEW: Location pin visibility toggle ─────────────────── */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 10, marginBottom: 10,
                  background: listing.location_visible !== false ? 'rgba(62,207,178,0.06)' : 'rgba(255,107,107,0.06)',
                  border: `1px solid ${listing.location_visible !== false ? 'rgba(62,207,178,0.15)' : 'rgba(255,107,107,0.15)'}`,
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: listing.location_visible !== false ? '#3ECFB2' : '#FF6B6B' }}>
                      {listing.location_visible !== false ? '📍 Location Pin: Visible' : '🔒 Location Pin: Hidden'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                      {listing.location_visible !== false
                        ? 'Guests can see this property on the map'
                        : 'Pin hidden from guest map (listing taken)'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleLocationVisible(listing.id, listing.location_visible !== false)}
                    style={{
                      width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                      background: listing.location_visible !== false ? '#3ECFB2' : 'rgba(255,255,255,0.1)',
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3,
                      left: listing.location_visible !== false ? 21 : 3,
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(listing.id, listing.listing_status)}
                    className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                    style={{
                      background: listing.listing_status === 'approved' ? 'rgba(255,107,107,0.12)' : 'rgba(62,207,178,0.12)',
                      color: listing.listing_status === 'approved' ? '#FF6B6B' : 'var(--lala-teal)',
                      fontWeight: 600,
                    }}>
                    {listing.listing_status === 'approved' ? '⏸ Pause' : '▶ Activate'}
                  </button>
                  <button onClick={() => { setEditListing(listing); setEditTitle(listing.title||""); setEditArea(listing.area||""); setEditPrice(String(listing.price_per_night||"")); setEditType(listing.property_type||"Apartment"); setEditBedrooms(String(listing.bedrooms||1)); setEditMaxGuests(String(listing.max_guests||2)); setEditDescription(listing.description||""); setEditPartyAllowed((listing.house_rules||[]).includes("Parties allowed")); setEditLocationVisible(listing.location_visible!==false); setEditError(""); }} className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                    style={{ background: 'rgba(232,184,109,0.12)', color: '#E8B86D', fontWeight: 600 }}>
                    ✏️ Edit
                  </button>
                </div>
              </motion.div>
            ))
          )}

          {/* Add New Property */}
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-[16px] cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 800, fontSize: 15, border: 'none', boxShadow: '0 8px 24px rgba(62,207,178,0.25)' }}>
            + Add New Property
          </motion.button>
        </div>
      </div>
      <BottomNav type="host" />

      {/* ─── Add Property Sheet ─────────────────────────────────────────── */}
      {showAdd && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'linear-gradient(170deg, #061412 0%, #03020a 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Success overlay */}
          {saved && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,20,18,0.97)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(62,207,178,0.15)', border: '2px solid #3ECFB2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3ECFB2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 8 }}>Property Created!</div>
              <div style={{ fontSize: 14, color: 'rgba(62,207,178,0.7)' }}>Pinned on the guest map 📍</div>
            </div>
          )}

          {/* Sheet header */}
          <div style={{ padding: '52px 20px 14px', borderBottom: '1px solid rgba(62,207,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#061412' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 2, marginBottom: 2 }}>HOST DASHBOARD</div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 19, fontWeight: 900, color: 'white' }}>Add New Property</div>
            </div>
            <button disabled={saving} onClick={() => setShowAdd(false)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(62,207,178,0.25)', background: 'rgba(62,207,178,0.08)', color: '#3ECFB2', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Form */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {!!error && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B', fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 6 }}>PROPERTY TITLE</div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Cozy Studio in Westlands"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.2)', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            {/* Area / Location */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 4 }}>AREA / LOCATION</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                Type a neighbourhood name — we'll auto-pin it on the map
              </div>
              <input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Westlands, Kilimani, Karen…"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.2)', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            {/* Price + Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 6 }}>PRICE/NIGHT (KSH)</div>
                <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" placeholder="5000"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.2)', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 6 }}>TYPE</div>
                <select value={type} onChange={e => setType(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, outline: 'none', background: '#0a1f1b', border: '1px solid rgba(62,207,178,0.2)', color: 'white', fontSize: 14, boxSizing: 'border-box' }}>
                  <option value="Apartment">Apartment</option>
                  <option value="Studio">Studio</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Shared">Shared</option>
                  <option value="1 Bedroom">1 Bedroom</option>
                  <option value="2 Bedroom">2 Bedroom</option>
                  <option value="Mansion">Mansion</option>
                </select>
              </div>
            </div>

            {/* Bedrooms + Max Guests */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 6 }}>BEDROOMS</div>
                <select value={bedrooms} onChange={e => setBedrooms(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, outline: 'none', background: '#0a1f1b', border: '1px solid rgba(62,207,178,0.2)', color: 'white', fontSize: 14, boxSizing: 'border-box' }}>
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4+</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 6 }}>MAX GUESTS</div>
                <input value={maxGuests} onChange={e => setMaxGuests(e.target.value)} type="number" min="1"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.2)', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>AMENITIES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {amenitiesList.map(a => (
                  <button key={a} onClick={() => setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                    style={{ padding: '7px 12px', borderRadius: 20, fontSize: 12, border: amenities.includes(a) ? 'none' : '1px solid rgba(62,207,178,0.2)', background: amenities.includes(a) ? '#3ECFB2' : 'rgba(62,207,178,0.06)', color: amenities.includes(a) ? '#061412' : 'rgba(255,255,255,0.6)', fontWeight: amenities.includes(a) ? 700 : 400, cursor: 'pointer' }}>
                    {a}
                  </button>
                ))}
              </div>
              <input value={otherAmenities} onChange={e => setOtherAmenities(e.target.value)} placeholder="Other: Pool, Gym, Balcony…"
                style={{ width: '100%', marginTop: 10, padding: '11px 14px', borderRadius: 12, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.2)', color: 'white', fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            {/* Allow Parties */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(62,207,178,0.1)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Allow Parties</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Guests can host events</div>
              </div>
              <button onClick={() => setPartyAllowed(v => !v)} style={{ width: 46, height: 26, borderRadius: 13, background: partyAllowed ? '#3ECFB2' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: partyAllowed ? 23 : 3, transition: 'left 0.2s' }} />
              </button>
            </div>

            {/* ─── NEW: Location Visibility toggle in form ─────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(62,207,178,0.1)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>📍 Show Location Pin</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {locationVisible ? 'Guests will see this property on the map' : 'Location hidden from guest map'}
                </div>
              </div>
              <button onClick={() => setLocationVisible(v => !v)} style={{ width: 46, height: 26, borderRadius: 13, background: locationVisible ? '#3ECFB2' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: locationVisible ? 23 : 3, transition: 'left 0.2s' }} />
              </button>
            </div>

            {/* Description */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 6 }}>DESCRIPTION</div>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe your property…"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.2)', color: 'white', fontSize: 14, boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }} />
            </div>

            {/* Photos */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(62,207,178,0.6)', letterSpacing: 1, marginBottom: 8 }}>PHOTOS (UP TO 6)</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, background: 'rgba(62,207,178,0.05)', border: '1px dashed rgba(62,207,178,0.3)', cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: 'rgba(62,207,178,0.7)' }}>
                  {files.length > 0 ? `${files.length} photo(s) selected` : '📷 Tap to upload photos'}
                </span>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => setFiles(Array.from(e.target.files || []).slice(0, 6))} />
              </label>
              {files.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {files.slice(0, 6).map((f, i) => (
                    <div key={i} style={{ width: 58, height: 58, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(62,207,178,0.2)' }}>
                      <img src={URL.createObjectURL(f)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button disabled={saving} onClick={handleCreate}
              style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: saving ? 'rgba(255,255,255,0.3)' : '#061412', fontWeight: 800, fontSize: 15, boxShadow: saving ? 'none' : '0 8px 24px rgba(62,207,178,0.25)' }}>
              {saving ? (savingStep || 'Creating Property…') : 'Create Property'}
            </button>
          </div>
        </div>
      )}
      {editListing && (
        <div style={{position:'absolute',inset:0,zIndex:50,background:'linear-gradient(170deg,#061412,#03020a)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'52px 20px 14px',borderBottom:'1px solid rgba(62,207,178,0.1)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'#061412'}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(62,207,178,0.6)',letterSpacing:2,marginBottom:2}}>HOST DASHBOARD</div>
              <div style={{fontFamily:'var(--font-playfair)',fontSize:19,fontWeight:900,color:'white'}}>Edit Property</div>
            </div>
            <button onClick={()=>setEditListing(null)} style={{width:34,height:34,borderRadius:'50%',border:'1px solid rgba(62,207,178,0.25)',background:'rgba(62,207,178,0.08)',color:'#3ECFB2',cursor:'pointer',fontSize:16}}>x</button>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'16px 20px 32px',scrollbarWidth:'none',display:'flex',flexDirection:'column',gap:14}}>
            {!!editError&&<div style={{padding:'10px 14px',borderRadius:12,background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.2)',color:'#FF6B6B',fontSize:13}}>{editError}</div>}
            <div><div style={{fontSize:10,fontWeight:700,color:'rgba(62,207,178,0.6)',letterSpacing:1,marginBottom:6}}>PROPERTY TITLE</div>
            <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={{width:'100%',padding:'11px 14px',borderRadius:12,outline:'none',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(62,207,178,0.2)',color:'white',fontSize:14,boxSizing:'border-box'}}/></div>
            <div><div style={{fontSize:10,fontWeight:700,color:'rgba(62,207,178,0.6)',letterSpacing:1,marginBottom:6}}>AREA / LOCATION</div>
            <input value={editArea} onChange={e=>setEditArea(e.target.value)} style={{width:'100%',padding:'11px 14px',borderRadius:12,outline:'none',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(62,207,178,0.2)',color:'white',fontSize:14,boxSizing:'border-box'}}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><div style={{fontSize:10,fontWeight:700,color:'rgba(62,207,178,0.6)',letterSpacing:1,marginBottom:6}}>PRICE/NIGHT (KSH)</div>
              <input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number" style={{width:'100%',padding:'11px 14px',borderRadius:12,outline:'none',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(62,207,178,0.2)',color:'white',fontSize:14,boxSizing:'border-box'}}/></div>
              <div><div style={{fontSize:10,fontWeight:700,color:'rgba(62,207,178,0.6)',letterSpacing:1,marginBottom:6}}>TYPE</div>
              <select value={editType} onChange={e=>setEditType(e.target.value)} style={{width:'100%',padding:'11px 14px',borderRadius:12,outline:'none',background:'#0a1f1b',border:'1px solid rgba(62,207,178,0.2)',color:'white',fontSize:14,boxSizing:'border-box'}}>
                <option>Apartment</option><option>Studio</option><option>Penthouse</option><option>Shared</option><option value="1 Bedroom">1 Bedroom</option><option value="2 Bedroom">2 Bedroom</option><option>Mansion</option>
              </select></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><div style={{fontSize:10,fontWeight:700,color:'rgba(62,207,178,0.6)',letterSpacing:1,marginBottom:6}}>BEDROOMS</div>
              <select value={editBedrooms} onChange={e=>setEditBedrooms(e.target.value)} style={{width:'100%',padding:'11px 14px',borderRadius:12,outline:'none',background:'#0a1f1b',border:'1px solid rgba(62,207,178,0.2)',color:'white',fontSize:14,boxSizing:'border-box'}}>
                <option>1</option><option>2</option><option>3</option><option>4</option>
              </select></div>
              <div><div style={{fontSize:10,fontWeight:700,color:'rgba(62,207,178,0.6)',letterSpacing:1,marginBottom:6}}>MAX GUESTS</div>
              <input value={editMaxGuests} onChange={e=>setEditMaxGuests(e.target.value)} type="number" min="1" style={{width:'100%',padding:'11px 14px',borderRadius:12,outline:'none',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(62,207,178,0.2)',color:'white',fontSize:14,boxSizing:'border-box'}}/></div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(62,207,178,0.1)'}}>
              <div><div style={{fontSize:13,fontWeight:600,color:'white'}}>Allow Parties</div><div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>Guests can host events</div></div>
              <button onClick={()=>setEditPartyAllowed(v=>!v)} style={{width:46,height:26,borderRadius:13,background:editPartyAllowed?'#3ECFB2':'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',position:'relative',flexShrink:0}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:'white',position:'absolute',top:3,left:editPartyAllowed?23:3,transition:'left 0.2s'}}/>
              </button>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(62,207,178,0.1)'}}>
              <div><div style={{fontSize:13,fontWeight:600,color:'white'}}>Show Location Pin</div><div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>{editLocationVisible?'Visible on guest map':'Hidden from map'}</div></div>
              <button onClick={()=>setEditLocationVisible(v=>!v)} style={{width:46,height:26,borderRadius:13,background:editLocationVisible?'#3ECFB2':'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',position:'relative',flexShrink:0}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:'white',position:'absolute',top:3,left:editLocationVisible?23:3,transition:'left 0.2s'}}/>
              </button>
            </div>
            <div><div style={{fontSize:10,fontWeight:700,color:'rgba(62,207,178,0.6)',letterSpacing:1,marginBottom:6}}>DESCRIPTION</div>
            <textarea value={editDescription} onChange={e=>setEditDescription(e.target.value)} rows={3} style={{width:'100%',padding:'11px 14px',borderRadius:12,outline:'none',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(62,207,178,0.2)',color:'white',fontSize:14,boxSizing:'border-box',resize:'none',fontFamily:'inherit'}}/></div>
            <button disabled={editSaving} onClick={handleSaveEdit} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',cursor:editSaving?'not-allowed':'pointer',background:editSaving?'rgba(255,255,255,0.08)':'linear-gradient(135deg,#3ECFB2,#2AA893)',color:editSaving?'rgba(255,255,255,0.3)':'#061412',fontWeight:800,fontSize:15}}>
              {editSaving?'Saving...':'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
