# -*- coding: utf-8 -*-

# 1. Update DatePicker to accept and show blocked dates
with open('src/app/components/DatePicker.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "interface DatePickerProps {\n  checkIn: Date | null;\n  checkOut: Date | null;\n  onCheckInChange: (date: Date) => void;\n  onCheckOutChange: (date: Date) => void;\n  minNights?: number;\n}",
    "interface DatePickerProps {\n  checkIn: Date | null;\n  checkOut: Date | null;\n  onCheckInChange: (date: Date) => void;\n  onCheckOutChange: (date: Date) => void;\n  minNights?: number;\n  bookedRanges?: { checkIn: string; checkOut: string }[];\n}"
)

c = c.replace(
    "  minNights = 1\n}: DatePickerProps) {",
    "  minNights = 1,\n  bookedRanges = []\n}: DatePickerProps) {\n  const isDateBlocked = (date: Date) => {\n    return bookedRanges.some(r => {\n      const start = new Date(r.checkIn);\n      const end = new Date(r.checkOut);\n      return date >= start && date < end;\n    });\n  };"
)

# Block clicking on booked dates
c = c.replace(
    "  const handleDateClick = (date: Date) => {\n    if (selectingCheckIn) {",
    "  const handleDateClick = (date: Date) => {\n    if (isDateBlocked(date)) return;\n    if (selectingCheckIn) {"
)

print("DatePicker:", "isDateBlocked" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/DatePicker.tsx', 'wb').write(out.encode('utf-8'))

# 2. Find where dates are rendered and add blocked styling
with open('src/app/components/DatePicker.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add blocked style to date rendering - find the date button render
c = c.replace(
    "      const isCheckIn = checkIn && format(date, 'yyyy-MM-dd') === format(checkIn, 'yyyy-MM-dd');",
    "      const isBlocked = isDateBlocked(date);\n      const isCheckIn = checkIn && format(date, 'yyyy-MM-dd') === format(checkIn, 'yyyy-MM-dd');"
)

# Add blocked visual to the button
c = c.replace(
    "      const isPast = isBefore(date, today);",
    "      const isPast = isBefore(date, today) || isBlocked;"
)

print("Blocked style:", "isBlocked" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/DatePicker.tsx', 'wb').write(out.encode('utf-8'))

# 3. Load booked ranges in PropertyDetail and pass to DatePicker
with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf2 = b'\r\n' in raw
c2 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add bookedRanges state
if "bookedRanges" not in c2:
    c2 = c2.replace(
        "  const [availabilityError, setAvailabilityError] = useState<string | null>(null);",
        "  const [availabilityError, setAvailabilityError] = useState<string | null>(null);\n  const [bookedRanges, setBookedRanges] = useState<{checkIn: string; checkOut: string}[]>([]);"
    )

    # Load booked ranges when property loads
    c2 = c2.replace(
        "      .order('check_in', { ascending: false })",
        "      .order('check_in', { ascending: false })"
    )

    # Find where property is loaded and add ranges fetch
    c2 = c2.replace(
        "  }, [id, properties]);",
        """  }, [id, properties]);

  useEffect(() => {
    if (!property?.id) return;
    supabase.from('bookings').select('check_in, check_out')
      .eq('property_id', property.id)
      .in('booking_status', ['accepted','payment_pending','paid','checked_in'])
      .then(({ data }) => {
        if (data) setBookedRanges(data.map(b => ({ checkIn: b.check_in, checkOut: b.check_out })));
      });
  }, [property?.id]);""",
    1
    )

# Pass bookedRanges to DatePicker
c2 = c2.replace(
    "<DatePicker\n",
    "<DatePicker\n              bookedRanges={bookedRanges}\n"
)

print("PropertyDetail:", "bookedRanges" in c2)
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out2.encode('utf-8'))
print("All saved")
