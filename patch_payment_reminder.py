# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add payment reminder when booking is accepted status
if "payment_reminder" not in c:
    c = c.replace(
        "  const handleEndCall = () => {",
        """  // Payment reminder: 15min after booking accepted
  useEffect(() => {
    if (!activeConversation?.bookingId) return;
    const booking = remoteConv;
    if (!booking || booking.booking_status !== 'accepted') return;
    const timer = setTimeout(async () => {
      if (currentUser?.role === 'guest') {
        const { sendNotification } = await import('../utils/notify');
        await sendNotification({
          userId: currentUser.id,
          type: 'payment_reminder',
          bookingId: booking.booking_id,
          propertyTitle: booking.property_title,
        });
      }
    }, 15 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [remoteConv?.booking_status]);

  const handleEndCall = () => {"""
    )

# Add missed call notification when caller ends before receiver picks up
c = c.replace(
    "  const handleEndCall = () => {\n    setLocalDuration(0);\n    setCallState('calling');\n    endCall();",
    """  const handleEndCall = () => {
    if (callState === 'calling' && callStatus.callId) {
      const otherId = currentUser?.role === 'guest' ? remoteConv?.host_id : remoteConv?.guest_id;
      if (otherId) {
        import('../utils/notify').then(({ sendNotification }) => {
          sendNotification({
            userId: otherId,
            type: 'missed_call_reminder',
            propertyTitle: remoteConv?.property_title || '',
            guestName: currentUser?.role === 'guest' ? currentUser?.name : undefined,
            hostName: currentUser?.role === 'host' ? currentUser?.name : undefined,
          });
        });
      }
    }
    setLocalDuration(0);
    setCallState('calling');
    endCall();"""
)

print("Done" if "missed_call_reminder" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
