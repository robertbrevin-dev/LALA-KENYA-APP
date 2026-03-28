# -*- coding: utf-8 -*-
import re

with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# 1. Add React import
if "import React" not in c:
    c = c.replace("import {", "import React, {", 1)

# 2. Add missing interface fields
c = c.replace(
    "  incomingCall: any;",
    """  incomingCall: any;
  callConnected: boolean;
  notifications: any[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;"""
)

# 3. Add callConnected + WebRTC refs + notifications state after incomingCall state
c = c.replace(
    "  const [incomingCall, setIncomingCall] = useState<any>(null);",
    """  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callConnected, setCallConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const peerRef = React.useRef<RTCPeerConnection | null>(null);
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const createPeer = () => new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] });
  const cleanupWebRTC = () => {
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
  };
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

print("Step1:", "callConnected" in c and "peerRef" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved step1")
