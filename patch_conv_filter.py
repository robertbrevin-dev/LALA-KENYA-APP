# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "        .from('conversations')\n        .select('*')\n        .eq(userCol, currentUser!.id)\n        .order('last_message_time', { ascending: false });",
    "        .from('conversations')\n        .select('*, bookings!booking_id(booking_status)')\n        .eq(userCol, currentUser!.id)\n        .order('last_message_time', { ascending: false });"
)

# Filter out expired/declined/completed conversations after fetch
c = c.replace(
    "      if (convError) { console.error('Conversations fetch error:', convError.message); return; }",
    """      if (convError) { console.error('Conversations fetch error:', convError.message); return; }
      const activeStatuses = ['accepted', 'payment_pending', 'paid', 'checked_in'];
      convData = (convData || []).filter((conv: any) => {
        const status = conv.bookings?.booking_status;
        return !status || activeStatuses.includes(status);
      });"""
)

print("Done" if "activeStatuses" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
