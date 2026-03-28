# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add AppContextType fields for notifications
c = c.replace(
    "  callStatus: CallStatus;",
    """  callStatus: CallStatus;
  notifications: any[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;"""
)

# Phase 7: auto-expire bookings every minute
if "auto-expire" not in c:
    c = c.replace(
        "  }, [currentUser?.id]); // Load notifications",
        """  }, [currentUser?.id]); // Load notifications

  useEffect(() => {
    if (!currentUser?.id) return;
    const autoExpire = async () => {
      await supabase.from('bookings').update({ booking_status: 'expired' })
        .eq('booking_status', 'inquiry')
        .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      await supabase.from('bookings').update({ booking_status: 'expired' })
        .eq('booking_status', 'accepted')
        .lt('updated_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());
      await supabase.from('bookings').update({ booking_status: 'completed', is_available: true })
        .eq('booking_status', 'checked_in')
        .lt('check_out', new Date().toISOString().slice(0, 10));
    };
    autoExpire();
    const t = setInterval(autoExpire, 60000);
    return () => clearInterval(t); // auto-expire
  }, [currentUser?.id]);"""
    )

print("Done" if "auto-expire" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
