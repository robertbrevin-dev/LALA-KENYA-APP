import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

const GOLD = '#E8B86D';
const TEAL = '#3ECFB2';
const NAIROBI = { lat: -1.286389, lng: 36.817223 };

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

export default function HostMap() {
  const navigate = useNavigate();
  const { currentUser, properties } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const guestMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [liveGuests, setLiveGuests] = useState<any[]>([]);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'guests' | 'properties'>('guests');
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);

  // Redirect if not host
  useEffect(() => {
    if (currentUser && currentUser.role !== 'host') navigate('/map');
  }, [currentUser, navigate]);

  // Load host's properties
  useEffect(() => {
    if (!currentUser?.id) return;
    const hostProps = properties.filter(p => p.hostId === currentUser.id);
    setMyProperties(hostProps);
  }, [properties, currentUser?.id]);

  // Init map
  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Fix leaflet default icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current, {
      center: [NAIROBI.lat, NAIROBI.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstance.current = map;
    setLoaded(true);

    // Get host location
    navigator.geolocation?.getCurrentPosition(pos => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserPos(p);
      const html = `<div style="width:16px;height:16px;border-radius:50%;background:${GOLD};border:3px solid white;box-shadow:0 0 0 4px rgba(232,184,109,0.3);"></div>`;
      userMarkerRef.current = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: '', html, iconAnchor: [8, 8] }),
        zIndexOffset: 1000,
      }).addTo(map);
    }, () => {}, { enableHighAccuracy: true });
  }, []);

  useEffect(() => {
    if (!document.getElementById('lala-host-map-style')) {
      const s = document.createElement('style');
      s.id = 'lala-host-map-style';
      s.textContent = '@keyframes pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(2);opacity:0}}.leaflet-container{font-family:sans-serif;}';
      document.head.appendChild(s);
    }
    initMap();
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  // Draw property markers
  useEffect(() => {
    if (!loaded || !mapInstance.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    myProperties.forEach(prop => {
      if (!prop.coords?.lat || !prop.coords?.lng) return;
      const html = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:${GOLD};color:#1a0800;padding:4px 10px;border-radius:16px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 4px 16px rgba(232,184,109,0.5);border:2px solid white;max-width:140px;overflow:hidden;text-overflow:ellipsis;">
            ${prop.title.length > 18 ? prop.title.slice(0, 18) + '…' : prop.title}
          </div>
          <div style="width:2px;height:8px;background:${GOLD};"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:${GOLD};box-shadow:0 0 8px rgba(232,184,109,0.6);"></div>
        </div>`;
      const marker = L.marker([prop.coords.lat, prop.coords.lng], {
        icon: L.divIcon({ className: '', html, iconAnchor: [0, 26] }),
      }).addTo(mapInstance.current!);
      marker.on('click', () => {
        mapInstance.current?.flyTo([prop.coords.lat, prop.coords.lng], 16, { duration: 1 });
      });
      markersRef.current.push(marker);
    });
  }, [myProperties, loaded]);

  // Draw guest markers
  useEffect(() => {
    if (!loaded || !mapInstance.current) return;
    Object.values(guestMarkersRef.current).forEach(m => m.remove());
    guestMarkersRef.current = {};

    liveGuests.forEach((g, i) => {
      const colors = [TEAL, '#A29BFE', '#FD79A8', '#FF9F43'];
      const color = colors[i % colors.length];
      const name = g.bookings?.guest_name || 'Guest';
      const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
      const html = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="position:relative;">
            <div style="position:absolute;inset:-6px;border-radius:50%;background:${color};opacity:0.3;animation:pulse 2s infinite;"></div>
            <div style="width:36px;height:36px;border-radius:50%;background:${color};color:#0D0F14;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4);position:relative;">${initials}</div>
          </div>
          <div style="width:2px;height:6px;background:${color};margin-top:2px;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background:${color};"></div>
        </div>`;
      const marker = L.marker([g.lat, g.lng], {
        icon: L.divIcon({ className: '', html, iconAnchor: [18, 52] }),
        zIndexOffset: 900,
      }).addTo(mapInstance.current!);
      marker.on('click', () => setSelectedGuest(g));
      guestMarkersRef.current[g.user_id] = marker;
    });
  }, [liveGuests, loaded]);

  // Subscribe to live guest locations
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchGuests = async () => {
      const { data } = await supabase
        .from('guest_locations')
        .select(`*, bookings!inner(guest_name, check_in, check_out, properties!inner(title, host_id))`)
        .eq('is_sharing', true)
        .eq('bookings.properties.host_id', currentUser.id);
      if (data) setLiveGuests(data);
    };

    fetchGuests();

    const channel = supabase.channel('host-map-guests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_locations' }, fetchGuests)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  const flyToGuest = (g: any) => {
    mapInstance.current?.flyTo([g.lat, g.lng], 16, { duration: 1.2 });
    setSelectedGuest(g);
  };

  const flyToProperty = (prop: any) => {
    if (prop.coords?.lat) mapInstance.current?.flyTo([prop.coords.lat, prop.coords.lng], 16, { duration: 1.2 });
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#03020a' }}>
      <div className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative"
        style={{ background: '#0D0F14', border: '1px solid rgba(62,207,178,0.1)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>

        {/* Map */}
        <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 1 }} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-[1001] px-4 pt-10 pb-3"
          style={{ background: 'linear-gradient(180deg, rgba(13,15,20,0.95) 0%, transparent 100%)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 900, color: 'white' }}>Host Map</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {liveGuests.length > 0 ? `${liveGuests.length} guest${liveGuests.length > 1 ? 's' : ''} live` : 'No guests sharing location'}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: liveGuests.length > 0 ? 'rgba(62,207,178,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${liveGuests.length > 0 ? 'rgba(62,207,178,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: liveGuests.length > 0 ? TEAL : '#555', boxShadow: liveGuests.length > 0 ? `0 0 6px ${TEAL}` : 'none' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: liveGuests.length > 0 ? TEAL : '#555' }}>
                {liveGuests.length > 0 ? 'LIVE' : 'IDLE'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-[14px]" style={{ background: 'rgba(62,207,178,0.06)', border: '1px solid rgba(62,207,178,0.12)' }}>
            {(['guests', 'properties'] as const).map(tab => (
              <motion.button key={tab} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-[11px] border-none cursor-pointer text-[12px] font-bold"
                style={{ background: activeTab === tab ? '#3ECFB2' : 'transparent', color: activeTab === tab ? '#061412' : 'rgba(255,255,255,0.4)' }}>
                {tab === 'guests' ? `Guests (${liveGuests.length})` : `My Properties (${myProperties.length})`}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div className="absolute left-3 right-3 z-[1002] rounded-[20px] overflow-hidden"
          style={{ top: 180, bottom: 90, background: 'rgba(13,15,20,0.92)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
          <div className="h-full overflow-y-auto px-3 py-3" style={{ scrollbarWidth: 'none' }}>

            {activeTab === 'guests' && (
              <>
                {liveGuests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-4"
                      style={{ background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.15)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="19" cy="8" r="3"/><line x1="19" y1="5" x2="19" y2="11"/><line x1="16" y1="8" x2="22" y2="8"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>No guests sharing location</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
                      Guests with active bookings can share their live GPS so you know when they're arriving.
                    </div>
                  </div>
                ) : liveGuests.map((g, i) => {
                  const colors = [TEAL, '#A29BFE', '#FD79A8', '#FF9F43'];
                  const color = colors[i % colors.length];
                  const name = g.bookings?.guest_name || 'Guest';
                  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                  const isStale = Date.now() - new Date(g.updated_at).getTime() > 60000;
                  const distKm = userPos ? haversineKm(userPos, { lat: g.lat, lng: g.lng }) : null;
                  const statusLabel = isStale ? 'Offline' : distKm && distKm < 0.5 ? 'Arriving' : distKm && distKm < 5 ? 'Nearby' : 'En route';
                  const statusColor = isStale ? '#666' : distKm && distKm < 0.5 ? TEAL : distKm && distKm < 5 ? GOLD : '#A29BFE';

                  return (
                    <motion.div key={g.user_id} whileTap={{ scale: 0.98 }}
                      onClick={() => flyToGuest(g)}
                      className="flex items-center gap-3 p-3 rounded-[14px] mb-2 cursor-pointer"
                      style={{ background: selectedGuest?.user_id === g.user_id ? 'rgba(62,207,178,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedGuest?.user_id === g.user_id ? 'rgba(62,207,178,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
                        style={{ background: color, color: '#0D0F14' }}>{initials}</div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{g.bookings?.properties?.title}</div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
                        {distKm && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{fmtDist(distKm)}</div>}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}

            {activeTab === 'properties' && (
              <>
                {myProperties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-4"
                      style={{ background: 'rgba(232,184,109,0.08)', border: '1px solid rgba(232,184,109,0.15)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>No properties listed</div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/host/listings')}
                      className="px-5 py-2.5 rounded-[12px] border-none cursor-pointer text-[13px] font-bold mt-2"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #C8843A)`, color: '#1a0800' }}>
                      Add Property
                    </motion.button>
                  </div>
                ) : myProperties.map(prop => (
                  <motion.div key={prop.id} whileTap={{ scale: 0.98 }}
                    onClick={() => flyToProperty(prop)}
                    className="flex items-center gap-3 p-3 rounded-[14px] mb-2 cursor-pointer"
                    style={{ background: 'rgba(232,184,109,0.05)', border: '1px solid rgba(232,184,109,0.12)' }}>
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.2)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }} className="truncate">{prop.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        {prop.coords?.lat ? `${prop.coords.lat.toFixed(4)}, ${prop.coords.lng.toFixed(4)}` : 'No location set'}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>Ksh {prop.price?.toLocaleString()}</div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="absolute bottom-0 left-0 right-0 z-[1003]">
          <BottomNav navType="host" />
        </div>
      </div>
    </div>
  );
}
