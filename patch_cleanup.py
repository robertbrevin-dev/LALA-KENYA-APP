with open('src/app/pages/HostBookings.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Remove the orphaned old confirm/decline buttons
import re
c = re.sub(
    r"\s+className=\"flex-1 min-w-\[110px\] py-2\.5 rounded-\[12px\] border-none cursor-pointer text-\[13px\]\"\s+style=\{\{ background: 'linear-gradient\(135deg, var\(--lala-gold\), #C8903D\)'.*?<\/>\s+\)\}",
    '',
    c, flags=re.DOTALL
)

print("Done" if "✓ Confirm" not in c else "FAILED - still has Confirm button")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/HostBookings.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
