# -*- coding: utf-8 -*-

# Fix 1: DatePicker - isDateBlocked defined inside component but used in inner scope
with open('src/app/components/DatePicker.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Move isDateBlocked outside the map callback - it's already in component scope, just needs to be before the dates map
# Check where it is
print("isDateBlocked in DatePicker:", c.count("isDateBlocked"))
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/DatePicker.tsx', 'wb').write(out.encode('utf-8'))

# Fix 2: AppContext - convData is const, need let
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf2 = b'\r\n' in raw
c2 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c2 = c2.replace(
    "      const { data: convData, error: convError }",
    "      let { data: convData, error: convError }"
)

# Fix 3: conv is undefined - find the sendMessage notification block
c2 = c2.replace(
    "    const recipientId = currentUser?.role === 'guest'\n      ? conv?.host_id\n      : conv?.guest_id;\n    if (recipientId) {\n      import('./utils/notify' as any).then((m: any) => {\n        m.sendNotification({\n          userId: recipientId,\n          type: 'new_message',\n          propertyTitle: conv?.property_title || '',\n          guestName: currentUser?.role === 'guest' ? currentUser?.name : undefined,\n          hostName: currentUser?.role === 'host' ? currentUser?.name : undefined,\n        });\n      });\n    }",
    ""
)

print("Fix2:", "let { data: convData" in c2)
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/context/AppContext.tsx', 'wb').write(out2.encode('utf-8'))
print("Saved")
