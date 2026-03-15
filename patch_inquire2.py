with open('src/app/pages/PropertyDetail.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

HANDLE_INQUIRE = """  const handleInquire = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (!checkIn) { setInquireError('Please select a check-in date.'); return; }
    setInquireError('');
    setInquireLoading(true);
    try {
      const [hh, mm] = inquireTime.split(':').map(Number);
      const checkInTime = new Date(checkIn);
      checkInTime.setHours(hh, mm, 0, 0);
      const checkOutTime = new Date(checkInTime);
      checkOutTime.setDate(checkOutTime.getDate() + inquireNights);
      const checkInISO = checkInTime.toISOString();
      const checkOutISO = checkOutTime.toISOString();
      const totalAmount = property.price * inquireNights;
      const platformFee = parseFloat((totalAmount * 0.03).toFixed(2));
      const hostPayout = parseFloat((totalAmount - platformFee).toFixed(2));
      const { data: clashes } = await supabase
        .from('bookings').select('id')
        .eq('property_id', property.id)
        .in('booking_status', ['inquiry','accepted','payment_pending','paid','checked_in'])
        .lt('check_in_time', checkOutISO)
        .gt('check_out_time', checkInISO);
      if (clashes && clashes.length > 0) {
        setInquireError('These dates are already taken. Please choose different dates.');
        setInquireLoading(false);
        return;
      }
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings').insert({
          property_id: property.id,
          guest_id: currentUser.id,
          host_id: property.hostId,
          booking_status: 'inquiry',
          check_in_time: checkInISO,
          check_out_time: checkOutISO,
          check_in: format(checkIn, 'yyyy-MM-dd'),
          check_out: format(checkOutTime, 'yyyy-MM-dd'),
          duration_nights: inquireNights,
          num_guests: inquireGuests,
          amount_paid: 0,
          amount_held: 0,
          platform_fee: platformFee,
          host_payout: hostPayout,
          nights: inquireNights,
          total_amount: totalAmount,
          property_title: property.title,
          property_location: property.location,
          guest_name: currentUser.name,
          guest_phone: currentUser.phone || '',
        }).select('id').single();
      if (bookingErr || !booking) {
        setInquireError('Failed to send inquiry. Please try again.');
        setInquireLoading(false);
        return;
      }
      await supabase.from('notifications').insert({
        user_id: property.hostId,
        type: 'inquiry',
        title: 'New Booking Inquiry',
        body: currentUser.name + ' wants to book ' + property.title + ' for ' + inquireNights + ' night' + (inquireNights > 1 ? 's' : '') + ' starting ' + format(checkIn, 'MMM d'),
        data: { booking_id: booking.id, property_id: property.id, guest_id: currentUser.id },
      });
      const convId = await createConversation(property.id, property.hostId);
      setShowInquireModal(false);
      setInquireSuccess(true);
      setTimeout(() => { navigate('/conversation/' + convId); }, 800);
    } catch (e) {
      setInquireError('Something went wrong. Please try again.');
    }
    setInquireLoading(false);
  };

"""

c = c.replace("  const handleBooking = async () => {", HANDLE_INQUIRE + "  const handleBooking = async () => {", 1)
print("handleInquire added" if "handleInquire" in c else "FAILED")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/PropertyDetail.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
