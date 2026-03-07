import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';
import { LALA_COMMISSION_RATE } from '../config/pricing';

export default function HostEarnings() {
  const navigate = useNavigate();
  const { currentUser, loading: appLoading } = useApp();
  const user = currentUser;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Protect route: wait for auth, then require a user
  useEffect(() => {
    if (!appLoading && !user) {
      navigate('/login');
    }
  }, [appLoading, user, navigate]);

  useEffect(() => {
    async function fetchEarnings() {
      if (!user?.id) {
        setBookings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('host_id', user.id)
        .in('booking_status', ['confirmed', 'completed'])
        .order('created_at', { ascending: false });

      setBookings(data || []);
      setLoading(false);
    }
    fetchEarnings();
  }, [user?.id]);

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const commission = Math.round(totalEarnings * LALA_COMMISSION_RATE);
  const netEarnings = totalEarnings - commission;

  const thisMonthBookings = bookings.filter(b => {
    const d = new Date(b.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const thisMonthEarnings = thisMonthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const thisMonthNet = Math.round(thisMonthEarnings * (1 - LALA_COMMISSION_RATE));

  const lastMonthBookings = bookings.filter(b => {
    const d = new Date(b.created_at);
    const lm = thisMonth === 0 ? 11 : thisMonth - 1;
    const ly = thisMonth === 0 ? thisYear - 1 : thisYear;
    return d.getMonth() === lm && d.getFullYear() === ly;
  });
  const lastMonthEarnings = lastMonthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const growth = lastMonthEarnings > 0
    ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
    : 0;

  const avgPerBooking = bookings.length > 0 ? Math.round(netEarnings / bookings.length) : 0;

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const chartData = months.map((_, i) => {
    const month = (thisMonth - 5 + i + 12) % 12;
    const year = month > thisMonth ? thisYear - 1 : thisYear;
    const total = bookings
      .filter(b => {
        const d = new Date(b.created_at);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    return total;
  });
  const maxChart = Math.max(...chartData, 1);

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
            Earnings
          </motion.h1>
          <p className="text-[14px]" style={{ color: 'var(--lala-soft)' }}>Track your income and performance</p>
        </div>

        <div className="px-6 pb-24">
          {/* This Month Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-[20px] p-5 mb-4"
            style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)' }}>
            <div className="text-[13px] mb-1" style={{ color: 'rgba(13,15,20,0.6)', fontWeight: 500 }}>This Month (Net)</div>
            <div className="text-[36px] mb-1"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-night)' }}>
              {loading ? '...' : `Ksh ${thisMonthNet.toLocaleString()}`}
            </div>
            <div className="text-[13px]" style={{ color: 'rgba(13,15,20,0.55)' }}>
              {growth >= 0 ? '↑' : '↓'}{' '}
              <strong style={{ color: growth >= 0 ? '#1a6b52' : '#cc4444' }}>
                {Math.abs(growth)}%
              </strong>{' '}
              from last month
            </div>
          </motion.div>

          {/* Commission Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-[16px] p-4 mb-4"
            style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
            <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>
              ALL TIME BREAKDOWN
            </div>
            {[
              { label: 'Gross Earnings', value: `Ksh ${totalEarnings.toLocaleString()}`, color: 'var(--lala-white)' },
              { label: `LALA Commission (${Math.round(LALA_COMMISSION_RATE * 100)}%)`, value: `- Ksh ${commission.toLocaleString()}`, color: '#FF6B6B' },
              { label: 'Your Net Earnings', value: `Ksh ${netEarnings.toLocaleString()}`, color: 'var(--lala-teal)' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2.5"
                style={{ borderBottom: i < 2 ? '1px solid var(--lala-border)' : 'none' }}>
                <span className="text-[13px]" style={{ color: 'var(--lala-soft)' }}>{row.label}</span>
                <span className="text-[14px]" style={{ color: row.color, fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Stats Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Last Month Net', value: `Ksh ${Math.round(lastMonthEarnings * (1 - LALA_COMMISSION_RATE)).toLocaleString()}` },
              { label: 'Avg per Booking', value: `Ksh ${avgPerBooking.toLocaleString()}` },
              { label: 'Total Bookings', value: bookings.length },
              { label: 'This Month Bookings', value: thisMonthBookings.length },
            ].map((stat, i) => (
              <div key={i} className="rounded-[16px] p-4"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                <div className="text-[20px] mb-1"
                  style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--lala-white)' }}>
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-[20px] p-5 mb-5"
            style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
            <div className="text-[14px] mb-4" style={{ color: 'var(--lala-white)', fontWeight: 600 }}>6-Month Earnings</div>
            <div className="flex items-end justify-between gap-2 h-[100px] mb-3">
              {chartData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxChart) * 90}px` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-[6px]"
                    style={{ background: i === 5 ? 'var(--lala-gold)' : 'rgba(232,184,109,0.25)', minHeight: 4 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {months.map((m, i) => (
                <div key={i} className="flex-1 text-center text-[11px]"
                  style={{ color: i === 5 ? 'var(--lala-gold)' : 'var(--lala-muted)' }}>{m}</div>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <div className="text-[13px] mb-3" style={{ color: 'var(--lala-muted)', fontWeight: 600, letterSpacing: 1 }}>
            RECENT TRANSACTIONS
          </div>
          {loading ? (
            <div className="text-center py-6" style={{ color: 'var(--lala-muted)' }}>Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="rounded-[16px] p-8 text-center"
              style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
              <div className="text-[40px] mb-2">💰</div>
              <div className="text-[14px]" style={{ color: 'var(--lala-muted)' }}>No earnings yet</div>
            </div>
          ) : (
            bookings.slice(0, 10).map((booking, index) => (
              <motion.div key={booking.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="rounded-[16px] p-4 mb-2.5 flex items-center justify-between"
                style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
                <div>
                  <div className="text-[14px] mb-0.5" style={{ fontWeight: 600, color: 'var(--lala-white)' }}>
                    {booking.property_title}
                  </div>
                  <div className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>
                    {booking.guest_name} · {new Date(booking.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[15px]" style={{ fontWeight: 700, color: 'var(--lala-teal)' }}>
                    +Ksh {Math.round(booking.total_amount * 0.9).toLocaleString()}
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--lala-muted)' }}>After commission</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <BottomNav type="host" />
    </PhoneFrame>
  );
}
