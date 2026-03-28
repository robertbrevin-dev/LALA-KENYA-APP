import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import NotificationBell from '../components/NotificationBell';
import NotificationPanel from '../components/NotificationPanel';
import BackRefreshBar from '../components/BackRefreshBar';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function HostDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const { currentUser, loading: appLoading, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();

  useEffect(() => {
    if (appLoading) return;
    if (!currentUser) {
      navigate('/login/host');
    } else if (currentUser.role !== 'host') {
      navigate('/home');
    }
  }, [appLoading, currentUser, navigate]);

  const user = currentUser;

  const [stats, setStats] = useState({
    totalEarnings: 0,
    earningsGrowth: 0,
    totalBookings: 0,
    averageRating: 0,
    activeListings: 0,
    occupancyRate: 0,
    responseRate: 100,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      setLoading(true);

      try {
        // Fetch host's properties first
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, listing_status')
          .eq('host_id', user.id)
          .is('deleted_at', null);

        if (propertiesError) {
          console.error('Error loading properties:', propertiesError);
        } else {
          const activeListings = propertiesData?.filter(p => p.listing_status === 'approved').length || 0;
          
          // Fetch host stats or calculate from bookings if stats table is empty
          const { data: statsData, error: statsError } = await supabase
            .from('host_stats')
            .select('*')
            .eq('host_id', user.id)
            .single();

          if (statsError && statsError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error loading host stats:', statsError);
          }

          // Fetch recent bookings for dashboard
          const { data: bookingsData, error: bookError } = await supabase
            .from('bookings')
            .select('*')
            .eq('host_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (bookError) {
            console.error('Error loading recent bookings:', bookError);
          } else {
            setRecentBookings(bookingsData || []);
          }

          // Calculate stats from bookings if host_stats is empty
          if (!statsData) {
            const { data: allBookings, error: allBookingsError } = await supabase
              .from('bookings')
              .select('total_amount, booking_status')
              .eq('host_id', user.id)
              .in('booking_status', ['confirmed', 'completed']);

            if (!allBookingsError && allBookings) {
              const totalEarnings = allBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
              const completedBookings = allBookings.filter(b => b.booking_status === 'completed').length;
              
              setStats({
                totalEarnings,
                earningsGrowth: 0,
                totalBookings: completedBookings,
                averageRating: 0, // Will be calculated from reviews later
                activeListings,
                occupancyRate: 0, // Will be calculated based on dates
                responseRate: 100,
              });
            }
          } else {
            setStats({
              totalEarnings: statsData.total_earnings || 0,
              earningsGrowth: 0,
              totalBookings: statsData.total_bookings || 0,
              averageRating: statsData.average_rating || 0,
              activeListings,
              occupancyRate: statsData.occupancy_rate || 0,
              responseRate: statsData.response_rate || 100,
            });
          }
        }
      } catch (err) {
        console.error('Unexpected dashboard fetch error:', err);
        // Set default values on error
        setStats({
          totalEarnings: 0,
          earningsGrowth: 0,
          totalBookings: 0,
          averageRating: 0,
          activeListings: 0,
          occupancyRate: 0,
          responseRate: 100,
        });
        setRecentBookings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  // While auth is still resolving, show a lightweight loading screen
  if (appLoading && !user) {
    return (
      <PhoneFrame>
        <BackRefreshBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[14px]" style={{ color: 'var(--lala-muted)' }}>
            Loading…
          </div>
        </div>
      </PhoneFrame>
    );
  }

  // If we reach here with no user and not loading, navigation effect will handle redirect.
  if (!user) {
    return null;
  }

  return (
    <PhoneFrame>
      <BackRefreshBar />
      {/* Header */}
      <div
        className="relative overflow-hidden px-6 pt-14 pb-8"
        style={{ background: 'linear-gradient(160deg, #061412 0%, #0a1f1b 50%, #061412 100%)' }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
          style={{ background: 'rgba(62,207,178,0.06)' }} />
        <div className="absolute -bottom-[60px] right-5 w-[120px] h-[120px] rounded-full"
          style={{ background: 'rgba(62,207,178,0.04)' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[13px]" style={{ color: 'rgba(62,207,178,0.7)', fontWeight: 500 }}>
              Welcome back,
            </div>
            <NotificationBell onOpen={() => { setNotifOpen(true); markAllNotificationsRead(); }} />
            <button
              onClick={() => navigate('/host/profile')}
              className="w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer font-bold text-[16px]"
              style={{
                background: 'linear-gradient(135deg, #1a0800, #2d1200)',
                border: '2.5px solid rgba(232,184,109,0.6)',
                color: '#E8B86D',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                fontFamily: 'var(--font-playfair)',
              }}
              title="View Profile"
            >
              {(user.name || 'H').charAt(0).toUpperCase()}
            </button>
          </div>
          <div className="text-[26px] mb-5"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'white' }}>
            {user.name || 'Host'}
          </div>

          {/* Earnings Card */}
          <div className="rounded-[16px] p-4"
            style={{ background: 'rgba(62,207,178,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(62,207,178,0.2)' }}>
            <div className="text-[12px] mb-1" style={{ color: 'rgba(62,207,178,0.7)', fontWeight: 500 }}>
              Total Earnings
            </div>
            <div className="text-[32px] mb-1"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'white' }}>
              {loading ? '...' : `Ksh ${stats.totalEarnings.toLocaleString()}`}
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>
                {stats.totalBookings} total bookings
              </span>
              <span className="px-2 py-0.5 rounded-[20px]"
                style={{ background: 'rgba(62,207,178,0.2)', color: '#1a6b52', fontWeight: 600, fontSize: '10px' }}>
                {stats.responseRate}% Response
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'none' }}>

        {/* Metrics Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8B86D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, value: loading ? '...' : stats.totalBookings, label: 'Total Bookings' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8B86D" stroke="#E8B86D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, value: loading ? '...' : stats.averageRating || 'N/A', label: 'Average Rating' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3ECFB2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, value: loading ? '...' : stats.activeListings, label: 'Active Listings' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8B86D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, value: loading ? '...' : `${stats.occupancyRate}%`, label: 'Occupancy Rate' },
          ].map((metric, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-[16px] p-4" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="mb-2.5">{metric.icon}</div>
              <div className="text-[24px] mb-0.5"
                style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--lala-white)' }}>
                {metric.value}
              </div>
              <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Bookings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex justify-between items-center mb-3">
            <div className="text-[16px]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--lala-white)' }}>
              Recent Bookings
            </div>
            <div className="text-[13px] cursor-pointer" style={{ color: 'var(--lala-gold)', fontWeight: 500 }}
              onClick={() => navigate('/host/bookings')}>
              View all
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--lala-muted)' }}>Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div className="rounded-[16px] p-8 text-center"
              style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>
              </div>
              <div className="text-[14px]" style={{ color: 'var(--lala-muted)' }}>No bookings yet</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentBookings.map((booking, index) => (
                <motion.div key={booking.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="rounded-[14px] p-3.5 px-4 flex items-center gap-3"
                  style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[16px] flex-shrink-0"
                    style={{
                      background: index === 0 ? 'linear-gradient(135deg, var(--lala-teal), #2AA893)' :
                                 index === 1 ? 'linear-gradient(135deg, var(--lala-gold), #C8903D)' :
                                 'linear-gradient(135deg, #FF6B6B, #CC4444)',
                      fontWeight: 700, color: 'var(--lala-night)'
                    }}>
                    {booking.guest_name?.[0] || 'G'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] mb-0.5" style={{ fontWeight: 600, color: 'var(--lala-white)' }}>
                      {booking.guest_name}
                    </div>
                    <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>
                      {booking.check_in} · {booking.property_title} · Ksh {booking.total_amount?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[11px] px-2.5 py-1 rounded-[20px] uppercase"
                    style={{
                      background: booking.booking_status === 'confirmed' ? 'rgba(62,207,178,0.12)' : 'rgba(232,184,109,0.12)',
                      color: booking.booking_status === 'confirmed' ? 'var(--lala-teal)' : 'var(--lala-gold)',
                      fontWeight: 600, letterSpacing: '0.5px'
                    }}>
                    {booking.booking_status}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="h-4" />
      </div>

      <BottomNav type="host" />
    </PhoneFrame>
  );
}
