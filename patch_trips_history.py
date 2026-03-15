with open('src/app/pages/Trips.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    """        const upcoming = allMapped
          .filter((b: any) =>
            !['cancelled', 'declined', 'expired', 'no_show'].includes(b.status)
          )
          .sort((a: any, b: any) => {
            const oa = statusOrder[a.status] ?? 99;
            const ob = statusOrder[b.status] ?? 99;
            if (oa !== ob) return oa - ob;
            return (b.createdAt as string).localeCompare(a.createdAt as string);
          });""",
    """        const upcoming = allMapped
          .filter((b: any) =>
            !['cancelled', 'declined', 'expired', 'no_show'].includes(b.status)
          )
          .sort((a: any, b: any) => {
            const oa = statusOrder[a.status] ?? 99;
            const ob = statusOrder[b.status] ?? 99;
            if (oa !== ob) return oa - ob;
            return (b.createdAt as string).localeCompare(a.createdAt as string);
          });
        const pastInquiries = allMapped
          .filter((b: any) => ['cancelled', 'declined', 'expired'].includes(b.status))
          .sort((a: any, b: any) => (b.createdAt as string).localeCompare(a.createdAt as string));"""
)

print("Done" if "pastInquiries" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Trips.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
