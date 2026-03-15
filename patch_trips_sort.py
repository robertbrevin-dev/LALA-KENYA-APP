with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    """        const upcoming = allMapped.filter(
          (b: any) => b.status !== 'cancelled' && (b.checkIn as string) >= today
        );""",
    """        const statusOrder: Record<string, number> = {
          'inquiry': 0, 'accepted': 1, 'payment_pending': 2,
          'paid': 3, 'checked_in': 4, 'completed': 5,
        };
        const upcoming = allMapped
          .filter((b: any) =>
            !['cancelled', 'declined', 'expired', 'no_show'].includes(b.status)
          )
          .sort((a: any, b: any) => {
            const oa = statusOrder[a.status] ?? 99;
            const ob = statusOrder[b.status] ?? 99;
            if (oa !== ob) return oa - ob;
            return (b.createdAt as string).localeCompare(a.createdAt as string);
          });"""
)

print("Done" if "statusOrder" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
