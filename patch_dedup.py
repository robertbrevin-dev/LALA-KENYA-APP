with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

import re
# Remove duplicate state lines
c = re.sub(
    r"(  const \[payMethod, setPayMethod\] = useState<'mpesa'\|'airtel'\|'card'\|null>\(null\);\n  const \[payPhone, setPayPhone\] = useState\(''\);\n  const \[payType, setPayType\] = useState<'full'\|'deposit'\|null>\(null\);)\n  const \[payMethod.*?\n  const \[payPhone.*?\n  const \[payType.*?\n",
    r"\1\n",
    c
)

count = c.count("const [payMethod")
print(f"payMethod count: {count} (should be 1)")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
