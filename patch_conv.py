with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    """      const convId = await createConversation(property.id, property.hostId);
      setShowInquireModal(false);
      setInquireSuccess(true);
      setTimeout(() => { navigate('/conversation/' + convId); }, 800);""",
    """      const mockBooking = {
        id: booking.id,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        guestId: currentUser.id,
        guestName: currentUser.name,
        guestPhone: currentUser.phone || '',
        checkIn: format(checkInTime, 'yyyy-MM-dd'),
        checkOut: format(checkOutTime, 'yyyy-MM-dd'),
        nights: inquireNights,
        totalAmount: totalAmount,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      const convId = await createConversation(mockBooking, 'guest', property.hostName, property.hostId);
      setShowInquireModal(false);
      setInquireSuccess(true);
      setTimeout(() => { navigate('/conversation/' + convId); }, 800);"""
)
print("Conv call fixed" if "mockBooking" in c else "FAILED")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
