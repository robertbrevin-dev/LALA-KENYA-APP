# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix the join - use booking_id directly instead of join
c = c.replace(
    "        .from('conversations')\n        .select('*, bookings!booking_id(booking_status)')\n        .eq(userCol, currentUser!.id)\n        .order('last_message_time', { ascending: false });",
    "        .from('conversations')\n        .select('*')\n        .eq(userCol, currentUser!.id)\n        .order('last_message_time', { ascending: false });"
)

# Fix the filter to fetch booking statuses separately
c = c.replace(
    """      if (convError) { console.error('Conversations fetch error:', convError.message); return; }
      const activeStatuses = ['accepted', 'payment_pending', 'paid', 'checked_in'];
      convData = (convData || []).filter((conv: any) => {
        const status = conv.bookings?.booking_status;
        return !status || activeStatuses.includes(status);
      });""",
    """      if (convError) { console.error('Conversations fetch error:', convError.message); return; }
      const bookingIds = (convData || []).map((c: any) => c.booking_id).filter(Boolean);
      const { data: bookingStatuses } = bookingIds.length > 0
        ? await supabase.from('bookings').select('id, booking_status').in('id', bookingIds)
        : { data: [] };
      const statusMap: Record<string, string> = {};
      (bookingStatuses || []).forEach((b: any) => { statusMap[b.id] = b.booking_status; });
      const activeStatuses = ['accepted', 'payment_pending', 'paid', 'checked_in'];
      convData = (convData || []).filter((conv: any) => {
        const status = statusMap[conv.booking_id];
        return !status || activeStatuses.includes(status);
      });"""
)

print("Done" if "statusMap" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
