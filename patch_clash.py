with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    ".in('booking_status', ['inquiry','accepted','payment_pending','paid','checked_in'])\n        .lt('check_in_time', checkOutISO)\n        .gt('check_out_time', checkInISO);",
    ".in('booking_status', ['paid','checked_in'])\n        .lt('check_in_time', checkOutISO)\n        .gt('check_out_time', checkInISO);"
)
print("Clash check fixed" if ".in('booking_status', ['paid','checked_in'])" in c else "FAILED")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
