# -*- coding: utf-8 -*-
with open('src/app/components/NotificationPanel.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "import { X, Home, Check, Clock, CreditCard, Key, Flag, Phone, Star, DollarSign, Bell } from 'lucide-react';",
    "import { X, Home, Check, Clock, CreditCard, Key, Flag, Phone, Star, DollarSign, Bell, MessageCircle } from 'lucide-react';"
)

c = c.replace(
    "  key: Key, flag: Flag, phone: Phone, star: Star, money: DollarSign,",
    "  key: Key, flag: Flag, phone: Phone, star: Star, money: DollarSign, chat: MessageCircle,"
)

print("Done" if "MessageCircle" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/NotificationPanel.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
