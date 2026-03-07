import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';

export default function HostDashboard() {
  const navigate = useNavigate();
  const { currentUser, loading: appLoading } = useApp();

  useEffect(() => {
    // Once global auth state has resolved and there's no user, kick to login.
    if (!appLoading && !currentUser) {
      navigate('/login');
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
        style={{ background: 'linear-gradient(135deg, var(--lala-gold) 0%, #C8903D 100%)' }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute -bottom-[60px] right-5 w-[120px] h-[120px] rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="text-[13px] mb-1" style={{ color: 'rgba(13,15,20,0.65)', fontWeight: 500 }}>
            Welcome back,
          </div>
          <div className="text-[26px] mb-5"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-night)' }}>
            {user.name || 'Host'} 🏡
          </div>

          {/* Earnings Card */}
          <div className="rounded-[16px] p-4"
            style={{ background: 'rgba(13,15,20,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="text-[12px] mb-1" style={{ color: 'rgba(13,15,20,0.6)', fontWeight: 500 }}>
              Total Earnings
            </div>
            <div className="text-[32px] mb-1"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-night)' }}>
              {loading ? '...' : `Ksh ${stats.totalEarnings.toLocaleString()}`}
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span style={{ color: 'rgba(13,15,20,0.55)' }}>
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
            { icon: '📅', value: loading ? '...' : stats.totalBookings, label: 'Total Bookings' },
            { icon: '⭐', value: loading ? '...' : stats.averageRating || 'N/A', label: 'Average Rating' },
            { icon: '🏠', value: loading ? '...' : stats.activeListings, label: 'Active Listings' },
            { icon: '📊', value: loading ? '...' : `${stats.occupancyRate}%`, label: 'Occupancy Rate' },
          ].map((metric, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-[16px] p-4" style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="text-[22px] mb-2.5">{metric.icon}</div>
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
              <div className="text-[40px] mb-3">📭</div>
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
