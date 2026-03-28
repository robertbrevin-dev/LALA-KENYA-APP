# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Load notifications in the conversations/messages useEffect
if "Load notifications" not in c:
    c = c.replace(
        "  }, [currentUser?.id]);",
        """  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    supabase.from('notifications').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setNotifications(data); });
    const sub = supabase.channel('notifications-' + currentUser.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + currentUser.id },
        (payload) => { setNotifications(prev => [payload.new, ...prev]); })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [currentUser?.id]); // Load notifications""",
    1
)

# Add to exports
c = c.replace(
    "      callStatus, callConnected, incomingCall, loading, toggleFavorite, refreshUser, addBooking, sendMessage,",
    "      callStatus, callConnected, incomingCall, loading, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, toggleFavorite, refreshUser, addBooking, sendMessage,"
)

print("Done" if "unreadCount" in c and "Load notifications" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
