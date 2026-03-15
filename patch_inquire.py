with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const [availabilityError, setAvailabilityError] = useState<string | null>(null);",
    "  const [availabilityError, setAvailabilityError] = useState<string | null>(null);\n  const [showInquireModal, setShowInquireModal] = useState(false);\n  const [inquireTime, setInquireTime] = useState('14:00');\n  const [inquireNights, setInquireNights] = useState(1);\n  const [inquireGuests, setInquireGuests] = useState(1);\n  const [inquireLoading, setInquireLoading] = useState(false);\n  const [inquireError, setInquireError] = useState('');\n  const [inquireSuccess, setInquireSuccess] = useState(false);"
)
print("Step 1 done" if "showInquireModal" in c else "Step 1 FAILED")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
