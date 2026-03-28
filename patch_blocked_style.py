# -*- coding: utf-8 -*-
with open('src/app/components/DatePicker.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "                const isCheckIn = checkIn && date.getTime() === checkIn.getTime();",
    "                const isBlocked = isDateBlocked(date);\n                const isCheckIn = checkIn && date.getTime() === checkIn.getTime();"
)

# Add blocked visual styling
c = c.replace(
    "                      background: isCheckIn || isCheckOut ? 'var(--lala-gold)' :",
    "                      background: isBlocked ? 'rgba(255,80,80,0.15)' : isCheckIn || isCheckOut ? 'var(--lala-gold)' :"
)

c = c.replace(
    "                      color: isCheckIn || isCheckOut ? 'var(--lala-night)' :",
    "                      color: isBlocked ? 'rgba(255,100,100,0.6)' : isCheckIn || isCheckOut ? 'var(--lala-night)' :"
)

print("Done" if "isBlocked" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/DatePicker.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
