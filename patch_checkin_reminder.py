# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "    autoExpire();\n    const t = setInterval(autoExpire, 60000);",
    """    autoExpire();
    // Check-in reminder: notify guests day before
    const sendCheckinReminders = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);
      const { data: upcoming } = await supabase.from('bookings')
        .select('*').eq('booking_status', 'paid').eq('check_in', tomorrowStr);
      for (const b of upcoming || []) {
        const { data: existing } = await supabase.from('notifications')
          .select('id').eq('user_id', b.guest_id).eq('type', 'checkin_reminder')
          .eq('data->>booking_id', b.id).limit(1);
        if (!existing?.length) {
          const { sendNotification } = await import('./utils/notify');
          await sendNotification({
            userId: b.guest_id, type: 'checkin_reminder',
            bookingId: b.id, propertyTitle: b.property_title,
            checkIn: b.check_in,
          });
        }
      }
    };
    sendCheckinReminders();
    const t = setInterval(() => { autoExpire(); sendCheckinReminders(); }, 60000);"""
)

print("Done" if "checkin_reminder" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
