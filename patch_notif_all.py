# -*- coding: utf-8 -*-
with open('src/app/pages/HostBookings.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "sendNotification" not in c:
    c = c.replace("import { supabase }", "import { sendNotification } from '../utils/notify';\nimport { supabase }")

c = c.replace(
    "      await supabase.from('notifications').insert({\n        user_id: booking.guest_id,\n        type: 'accepted',\n        title: 'Booking Accepted!',\n        body: 'Your inquiry for ' + booking.property_title + ' was accepted. You have 15 minutes to pay.',\n        data: { booking_id: booking.id },\n        is_read: false,\n      });",
    "      await sendNotification({ userId: booking.guest_id, type: 'accepted', bookingId: booking.id, propertyTitle: booking.property_title, hostName: booking.host_name || 'Your host', nights: booking.nights, checkIn: booking.check_in });"
)
c = c.replace(
    "      await supabase.from('notifications').insert({\n        user_id: booking.guest_id,\n        type: 'declined',\n        title: 'Booking Declined',\n        body: 'Your inquiry for ' + booking.property_title + ' was declined. Keep searching!',\n        data: { booking_id: booking.id },\n        is_read: false,\n      });",
    "      await sendNotification({ userId: booking.guest_id, type: 'declined', bookingId: booking.id, propertyTitle: booking.property_title, hostName: booking.host_name || 'Your host' });"
)

print("HostBookings:", "sendNotification" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/HostBookings.tsx', 'wb').write(out.encode('utf-8'))

with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf2 = b'\r\n' in raw
c2 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "sendNotification" not in c2:
    c2 = c2.replace("import { supabase }", "import { sendNotification } from '../utils/notify';\nimport { supabase }")

c2 = c2.replace(
    "      await supabase.from('notifications').insert({\n        user_id: property.hostId,\n        type: 'inquiry',\n        title: 'New Booking Inquiry',\n        body: currentUser.name + ' wants to book ' + property.title + ' for ' + inquireNights + ' night' + (inquireNights > 1 ? 's' : '') + ' starting ' + format(checkIn, 'MMM d'),\n        data: { booking_id: booking.id, property_id: property.id, guest_id: currentUser.id },\n      });",
    "      await sendNotification({ userId: property.hostId, type: 'inquiry', bookingId: booking.id, propertyTitle: property.title, guestName: currentUser.name, nights: inquireNights, checkIn: format(checkIn, 'MMM d, yyyy') });"
)

print("PropertyDetail:", "sendNotification" in c2)
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out2.encode('utf-8'))

with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf3 = b'\r\n' in raw
c3 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "sendNotification" not in c3:
    c3 = c3.replace("import { supabase }", "import { sendNotification } from '../utils/notify';\nimport { supabase }")

c3 = c3.replace(
    "      await supabase.from('notifications').insert({ user_id: booking.host_id, type: 'paid', title: 'Payment Received!', body: 'Ksh ' + amount.toLocaleString() + ' for ' + booking.property_title, data: { booking_id: booking.id }, is_read: false });",
    "      await sendNotification({ userId: booking.host_id, type: isDeposit ? 'payment_deposit' : 'payment_full', bookingId: booking.id, propertyTitle: booking.property_title, guestName: currentUser?.name, amount, checkIn: booking.checkIn || booking.check_in });\n      await sendNotification({ userId: currentUser?.id || '', type: isDeposit ? 'payment_deposit' : 'payment_full', bookingId: booking.id, propertyTitle: booking.property_title, amount, checkIn: booking.checkIn || booking.check_in });"
)

print("Conversation:", "sendNotification" in c3)
out3 = c3.replace('\n', '\r\n') if crlf3 else c3
open('src/app/pages/Conversation.tsx', 'wb').write(out3.encode('utf-8'))
print("All saved")
