with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    """    await supabase.from('conversations').upsert({
      id: conversationId, booking_id: booking.id,
      property_title: booking.propertyTitle, property_image: property?.image || '',
      guest_id: isGuest ? currentUser?.id : participantId,   
      host_id: isGuest ? participantId : currentUser?.id,    
      participant_id: participantId, participant_name: participantName,
      participant_phone: participantPhone ?? null, participant_role: participantRole,
      last_message: 'Start a conversation', last_message_time: now,
    });""",
    """    const { error: convErr } = await supabase.from('conversations').upsert({
      id: conversationId, booking_id: booking.id,
      property_title: booking.propertyTitle, property_image: property?.image || '',
      guest_id: isGuest ? currentUser?.id : participantId,
      host_id: isGuest ? participantId : currentUser?.id,
      participant_id: participantId, participant_name: participantName,
      participant_phone: participantPhone ?? null, participant_role: participantRole,
      last_message: 'Start a conversation', last_message_time: now,
    }, { onConflict: 'id' });
    if (convErr) console.error('Conversation upsert error:', convErr);"""
)
print("Fixed" if "convErr" in c else "FAILED")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
