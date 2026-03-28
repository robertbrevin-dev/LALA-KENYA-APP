# -*- coding: utf-8 -*-

# 1. Add new types to constraint
# Run this SQL first:
# ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
# ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
# CHECK (type IN ('inquiry','accepted','declined','expired','payment_full','payment_deposit',
# 'cancelled','checkin','checkout','missed_call','review_request','payout',
# 'payment_reminder','checkin_reminder','new_message','missed_call_reminder',
# 'booking_confirmed','booking_cancelled','paid','new_message'));

with open('src/app/utils/notify.ts', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add new types
c = c.replace(
    "type NotifType = 'inquiry' | 'accepted' | 'declined' | 'expired' | 'payment_full' | 'payment_deposit' | 'cancelled' | 'checkin' | 'checkout' | 'missed_call' | 'review_request' | 'payout';",
    "type NotifType = 'inquiry' | 'accepted' | 'declined' | 'expired' | 'payment_full' | 'payment_deposit' | 'cancelled' | 'checkin' | 'checkout' | 'missed_call' | 'review_request' | 'payout' | 'payment_reminder' | 'checkin_reminder' | 'new_message' | 'missed_call_reminder';"
)

# Add to notifMeta
c = c.replace(
    "  payout:          { icon: 'money',   color: '#3ECFB2', label: 'Payout' },",
    """  payout:          { icon: 'money',   color: '#3ECFB2', label: 'Payout' },
  payment_reminder:  { icon: 'clock',   color: '#E8B86D', label: 'Pay Now' },
  checkin_reminder:  { icon: 'key',     color: '#3ECFB2', label: 'Tomorrow' },
  new_message:       { icon: 'chat',    color: '#3ECFB2', label: 'Message' },
  missed_call_reminder: { icon: 'phone', color: '#FF6B6B', label: 'Missed' },"""
)

# Add templates
c = c.replace(
    "  payout: (p) => ({",
    """  payment_reminder: (p) => ({
    title: `Your booking expires soon`,
    body: `Complete payment for ${p.propertyTitle} in the next 15 minutes or your reservation will be released.`,
  }),
  checkin_reminder: (p) => ({
    title: `Your stay starts tomorrow`,
    body: `Get ready for ${p.propertyTitle}. Check-in is ${p.checkIn}. Safe travels from Lala Kenya.`,
  }),
  new_message: (p) => ({
    title: `New message from ${p.guestName || p.hostName}`,
    body: `You have an unread message about ${p.propertyTitle} on Lala Kenya.`,
  }),
  missed_call_reminder: (p) => ({
    title: `You missed a call`,
    body: `${p.guestName || p.hostName} tried to reach you about ${p.propertyTitle}. Call back on Lala Kenya.`,
  }),
  payout: (p) => ({"""
)

# Add chat icon to iconMap in NotificationPanel
print("Done" if "payment_reminder" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/utils/notify.ts', 'wb').write(out.encode('utf-8'))
print("Saved notify.ts")
