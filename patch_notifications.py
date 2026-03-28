# -*- coding: utf-8 -*-

with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add notifications state after loading state
if "const [notifications, setNotifications]" not in c:
    c = c.replace(
        "  const [loading, setLoading] = useState(true);",
        """  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser?.id) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };"""
    )

# Load notifications when user logs in
if "fetch notifications" not in c:
    c = c.replace(
        "  const [loading, setLoading] = useState(true);",
        "  const [loading, setLoading] = useState(true); // fetch notifications"
    )

print("Notifications state:", "unreadCount" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved AppContext")

