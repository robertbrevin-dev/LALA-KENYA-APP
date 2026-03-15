with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    ".in('booking_status', ['pending', 'confirmed', 'in_stay', 'completed'])",
    ".in('booking_status', ['inquiry','accepted','payment_pending','paid','checked_in'])"
)
print("Old status values fixed:", c.count("inquiry','accepted','payment_pending','paid','checked_in'"))

c = c.replace(
    """          property_title: property.title,
          property_location: property.location,
          guest_name: currentUser.name,
          guest_phone: currentUser.phone || '',""",
    """          property_title: property.title,
          property_location: property.location,
          guest_name: currentUser.name,
          guest_phone: currentUser.phone || '',
          base_amount: totalAmount,
          currency: 'KES',"""
)
print("INSERT fields fixed")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
