# -*- coding: utf-8 -*-
with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "      .from('bookings').select('id, check_in, check_out')\n      .eq('property_id', property.id)\n      .in('booking_status', ['inquiry','accepted','payment_pending','paid','checked_in'])\n      .not('check_out', '<=', checkInStr)\n      .not('check_in', '>=', checkOutStr);",
    "      .from('bookings').select('id, check_in_time, check_out_time')\n      .eq('property_id', property.id)\n      .in('booking_status', ['paid','checked_in'])\n      .lt('check_in_time', new Date(checkOutStr).toISOString())\n      .gt('check_out_time', new Date(checkInStr).toISOString());"
)

print("Done" if "paid','checked_in']" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
