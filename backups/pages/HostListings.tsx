import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

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
  const amenitiesList = ['Wi‑Fi', 'Parking', 'Kitchen', 'TV', 'Washer', 'Air Conditioning'];
  const [amenities, setAmenities] = useState<string[]>([]);
  const [otherAmenities, setOtherAmenities] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Protect route: wait for auth to resolve, then require a user
  useEffect(() => {
    if (!appLoading && !user) {
      navigate('/login');
    }
  }, [appLoading, user, navigate]);

  useEffect(() => {
    async function fetchListings() {
      if (!user?.id) {
        setListings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
    const { error } = await supabase
      .from('properties')
      .update({ listing_status: newStatus })
      .eq('id', id);

    if (!error) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, listing_status: newStatus } : l));
    }
  };

  const statusStyle = (status: string) => {
    if (status === 'approved') return { bg: 'rgba(62,207,178,0.12)', color: 'var(--lala-teal)' };
    if (status === 'suspended') return { bg: 'rgba(255,107,107,0.12)', color: '#FF6B6B' };
    if (status === 'pending_review') return { bg: 'rgba(232,184,109,0.12)', color: 'var(--lala-gold)' };
    return { bg: 'rgba(150,150,150,0.12)', color: 'var(--lala-muted)' };
  };

  const handleCreate = async () => {
    if (!user?.id) {
      setError('Sign in required');
      return;
    }
    if (!title || !area || !price) {
      setError('Title, area, and price are required');
      return;
    }
    if (files.length === 0) {
      setError('At least one photo is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      
      // Upload images with better error handling
      for (let i = 0; i < Math.min(files.length, 6); i++) {
        const f = files[i];
        const fileExt = f.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;
        
        // Validate file type and size
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
          throw new Error(`Invalid file type: ${fileExt}. Only JPG, PNG, and WebP are allowed.`);
        }
        
        if (f.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error(`File too large: ${f.name}. Maximum size is 5MB.`);
        }
        
        const { error: upErr } = await supabase.storage
          .from('property-images')
          .upload(fileName, f, { 
            upsert: true,
            contentType: f.type || 'image/jpeg'
          });
        
        if (upErr) {
          console.error('Upload error:', upErr);
          throw new Error(`Failed to upload ${f.name}: ${upErr.message}`);
        }
        
        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(data.publicUrl);
      }
      
      const primaryImageUrl = uploadedUrls[0];
      const mergedAmenities = [
        ...amenities,
        ...otherAmenities
          .split(',')
          .map(a => a.trim())
          .filter(a => a.length > 0),
      ];
      const houseRules: string[] = [partyAllowed ? 'Parties allowed' : 'No parties'];
      
      // Insert property with all required fields
      const { data: inserted, error: insErr } = await supabase.from('properties').insert({
        title: title.trim(),
        area: area.trim(),
        location: area.trim(), // Using area as location for now
        price_per_night: Number(price),
        property_type: type,
        bedrooms: Number(bedrooms),
        beds: Number(bedrooms), // Same as bedrooms for now
        max_guests: Number(maxGuests),
        amenities: mergedAmenities,
        house_rules: houseRules,
        description: description.trim(),
        host_id: user.id,
        primary_image_url: primaryImageUrl,
        listing_status: 'pending_review',
        is_featured: false,
        instant_book: false,
        deleted_at: null,
      }).select('*').single();
      
      if (insErr) {
        console.error('Insert error:', insErr);
        throw new Error(`Failed to save property: ${insErr.message}`);
      }
      
      // Success - reset form and update state
      setListings(prev => [inserted, ...prev]);
      setShowAdd(false);
      setTitle('');
      setArea('');
      setPrice('');
      setType('Apartment');
      setBedrooms('1');
      setMaxGuests('2');
      setPartyAllowed(false);
      setAmenities([]);
      setOtherAmenities('');
      setDescription('');
      setFiles([]);
      
    } catch (e: any) {
      console.error('Property creation error:', e);
      setError(e.message || 'Failed to create property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // While auth is resolving, show a simple loading state
  if (appLoading && !user) {
    return (
      <PhoneFrame>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <BackRefreshBar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[14px]" style={{ color: 'var(--lala-muted)' }}>
              Loading…
            </div>
          </div>
        </div>
        <BottomNav type="host" />
      </PhoneFrame>
    );
  }

  // If no user and not loading, navigation effect will handle redirect
  if (!user) {
    return null;
  }

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <BackRefreshBar />
        {/* Header */}
        <div className="px-6 pt-14 pb-5">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-[28px] mb-1"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-white)' }}>
            My Listings
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-[14px]" style={{ color: 'var(--lala-soft)' }}>
            {listings.length} {listings.length === 1 ? 'property' : 'properties'}
          </motion.p>
        </div>

        <div className="px-6 pb-24">
          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--lala-muted)' }}>Loading...</div>
          ) : listings.length === 0 ? (
            <div className="rounded-[20px] p-10 text-center mb-4"
              style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="text-[48px] mb-3">🏠</div>
              <div className="text-[15px] mb-1" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>No listings yet</div>
              <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>Add your first property below</div>
            </div>
          ) : (
            listings.map((listing, index) => (
              <motion.div key={listing.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[16px] p-4 mb-3"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>

                <div className="flex gap-3 mb-3">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-[12px] flex items-center justify-center text-[28px] flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(232,184,109,0.2), rgba(62,207,178,0.1))' }}>
                    {listing.primary_image_url || '🏢'}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div className="text-[15px] flex-1 pr-2" style={{ fontWeight: 600, color: 'var(--lala-white)' }}>
                        {listing.title}
                      </div>
                      <div className="text-[10px] px-2 py-0.5 rounded-[20px] uppercase flex-shrink-0"
                        style={{ background: statusStyle(listing.listing_status).bg, color: statusStyle(listing.listing_status).color, fontWeight: 600 }}>
                        {listing.listing_status?.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="text-[12px] mb-2" style={{ color: 'var(--lala-muted)' }}>
                      📍 {listing.area || listing.address || 'Nairobi'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[14px]" style={{ color: 'var(--lala-gold)', fontWeight: 700 }}>
                        Ksh {listing.price_per_night?.toLocaleString()}
                      </div>
                      <span className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>/ night</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 py-3 mb-3" style={{ borderTop: '1px solid var(--lala-border)', borderBottom: '1px solid var(--lala-border)' }}>
                  <div className="flex-1 text-center">
                    <div className="text-[16px] mb-0.5" style={{ fontWeight: 700, color: 'var(--lala-white)' }}>
                      {listing.rating || '—'}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>⭐ Rating</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[16px] mb-0.5" style={{ fontWeight: 700, color: 'var(--lala-white)' }}>
                      {listing.total_reviews || 0}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>Reviews</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[16px] mb-0.5" style={{ fontWeight: 700, color: listing.instant_book ? 'var(--lala-teal)' : 'var(--lala-muted)' }}>
                      {listing.instant_book ? '⚡' : '—'}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>Instant</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[16px] mb-0.5" style={{ fontWeight: 700, color: 'var(--lala-white)' }}>
                      {listing.bedrooms || 1}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>Beds</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(listing.id, listing.listing_status)}
                    className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                    style={{
                      background: listing.listing_status === 'approved' ? 'rgba(255,107,107,0.12)' : 'rgba(62,207,178,0.12)',
                      color: listing.listing_status === 'approved' ? '#FF6B6B' : 'var(--lala-teal)',
                      fontWeight: 600
                    }}>
                    {listing.listing_status === 'approved' ? '⏸ Pause' : '▶ Activate'}
                  </button>
                  <button className="flex-1 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px]"
                    style={{ background: 'rgba(232,184,109,0.12)', color: 'var(--lala-gold)', fontWeight: 600 }}>
                    ✏️ Edit
                  </button>
                </div>
              </motion.div>
            ))
          )}

          {/* Add New Property */}
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-[16px] border-2 border-dashed cursor-pointer"
            style={{ background: 'transparent', borderColor: 'var(--lala-border)', color: 'var(--lala-gold)', fontWeight: 600 }}>
            + Add New Property
          </motion.button>
        </div>
      </div>
      <BottomNav type="host" />
      {showAdd && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => !saving && setShowAdd(false)} />
          <div className="absolute right-0 top-0 h-full w-full md:w-[520px] p-5 overflow-y-auto"
            style={{ background: 'var(--lala-deep)', borderLeft: '1px solid var(--lala-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[18px]" style={{ fontWeight: 700, color: 'var(--lala-white)' }}>Add New Property</div>
              <button disabled={saving} onClick={() => setShowAdd(false)} className="px-3 py-1 rounded-[10px] border-none cursor-pointer"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}>
                Close
              </button>
            </div>
            {!!error && <div className="text-[12px] mb-2" style={{ color: '#FF6B6B' }}>{error}</div>}
            <div className="grid gap-3">
              <div>
                <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Title</div>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-[12px] outline-none"
                  style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} />
              </div>
              <div>
                <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Area</div>
                <input value={area} onChange={e => setArea(e.target.value)} className="w-full px-3 py-2 rounded-[12px] outline-none"
                  style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Price per night (Ksh)</div>
                  <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" className="w-full px-3 py-2 rounded-[12px] outline-none"
                    style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} />
                </div>
                <div>
                  <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Type</div>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 rounded-[12px] outline-none"
                    style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}>
                    <option>Apartment</option>
                    <option>Studio</option>
                    <option>Penthouse</option>
                    <option>Shared</option>
                    <option>1 Bedroom</option>
                    <option>2 Bedroom</option>
                    <option>Mansion</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Bedrooms</div>
                  <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="w-full px-3 py-2 rounded-[12px] outline-none"
                    style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Max Guests</div>
                  <input value={maxGuests} onChange={e => setMaxGuests(e.target.value)} type="number" min="1" className="w-full px-3 py-2 rounded-[12px] outline-none"
                    style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} />
                </div>
              </div>
              <div>
                <div className="text-[12px] mb-2" style={{ color: 'var(--lala-muted)' }}>Amenities</div>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map(a => (
                    <button
                      key={a}
                      onClick={() =>
                        setAmenities(prev =>
                          prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
                        )
                      }
                      className="px-3 py-1.5 rounded-[12px] text-[12px] border-none cursor-pointer"
                      style={{
                        background: amenities.includes(a) ? 'var(--lala-gold)' : 'var(--lala-card)',
                        color: amenities.includes(a) ? 'var(--lala-night)' : 'var(--lala-white)',
                        border: '1px solid var(--lala-border)',
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Other amenities (comma separated)</div>
                  <input value={otherAmenities} onChange={e => setOtherAmenities(e.target.value)} className="w-full px-3 py-2 rounded-[12px] outline-none"
                    style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>Allow Parties</div>
                <button onClick={() => setPartyAllowed(v => !v)} className="w-12 h-6 rounded-full transition-all relative"
                  style={{ background: partyAllowed ? 'var(--lala-teal)' : 'var(--lala-border)' }}>
                  <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: partyAllowed ? '26px' : '2px' }} />
                </button>
              </div>
              <div>
                <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Description</div>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  className="w-full px-3 py-2 rounded-[12px] outline-none"
                  style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)' }} />
              </div>
              <div>
                <div className="text-[12px] mb-1" style={{ color: 'var(--lala-muted)' }}>Photos (up to 6)</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    const f = Array.from(e.target.files || []);
                    setFiles(f.slice(0, 6));
                  }}
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {files.slice(0, 6).map((f, i) => (
                    <div key={i} className="w-16 h-16 rounded-[8px] overflow-hidden" style={{ border: '1px solid var(--lala-border)' }}>
                      <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              <button disabled={saving} onClick={handleCreate} className="w-full py-3 rounded-[14px] border-none cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', color: 'var(--lala-night)', fontWeight: 700 }}>
                {saving ? 'Saving…' : 'Create Property'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
