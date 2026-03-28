import { supabase } from '../../lib/supabase';

type NotifType = 'inquiry' | 'accepted' | 'declined' | 'expired' | 'payment_full' | 'payment_deposit' | 'cancelled' | 'checkin' | 'checkout' | 'missed_call' | 'review_request' | 'payout' | 'payment_reminder' | 'checkin_reminder' | 'new_message' | 'missed_call_reminder';

interface NotifParams {
  userId: string;
  type: NotifType;
  bookingId?: string;
  propertyTitle?: string;
  guestName?: string;
  hostName?: string;
  amount?: number;
  nights?: number;
  checkIn?: string;
  extra?: Record<string, any>;
}

export const notifMeta: Record<string, { icon: string; color: string; label: string }> = {
  inquiry:              { icon: 'home',    color: '#E8B86D', label: 'New Request' },
  accepted:             { icon: 'check',   color: '#3ECFB2', label: 'Accepted' },
  declined:             { icon: 'x',       color: '#FF6B6B', label: 'Declined' },
  expired:              { icon: 'clock',   color: '#888',    label: 'Expired' },
  payment_full:         { icon: 'card',    color: '#3ECFB2', label: 'Payment' },
  payment_deposit:      { icon: 'card',    color: '#E8B86D', label: 'Deposit' },
  cancelled:            { icon: 'x',       color: '#FF6B6B', label: 'Cancelled' },
  checkin:              { icon: 'key',     color: '#3ECFB2', label: 'Check-in' },
  checkout:             { icon: 'flag',    color: '#E8B86D', label: 'Checkout' },
  missed_call:          { icon: 'phone',   color: '#FF6B6B', label: 'Missed Call' },
  review_request:       { icon: 'star',    color: '#E8B86D', label: 'Review' },
  payout:               { icon: 'money',   color: '#3ECFB2', label: 'Payout' },
  payment_reminder:     { icon: 'clock',   color: '#E8B86D', label: 'Pay Now' },
  checkin_reminder:     { icon: 'key',     color: '#3ECFB2', label: 'Tomorrow' },
  new_message:          { icon: 'chat',    color: '#3ECFB2', label: 'Message' },
  missed_call_reminder: { icon: 'phone',   color: '#FF6B6B', label: 'Missed' },
};

const templates: Record<string, (p: NotifParams) => { title: string; body: string }> = {
  inquiry: (p) => ({ title: `${p.guestName} wants to book`, body: `${p.propertyTitle} · ${p.nights} night${p.nights !== 1 ? 's' : ''} from ${p.checkIn}. Respond within 5 minutes.` }),
  accepted: (p) => ({ title: `Your booking was accepted`, body: `${p.propertyTitle} is yours. Complete payment within 30 minutes to confirm your stay.` }),
  declined: (p) => ({ title: `Booking request declined`, body: `${p.propertyTitle} is unavailable for your dates. Explore other listings on Lala Kenya.` }),
  expired: (p) => ({ title: `Booking request expired`, body: `Your request for ${p.propertyTitle} has expired. Try submitting a new inquiry.` }),
  payment_full: (p) => ({ title: `Payment confirmed · Ksh ${p.amount?.toLocaleString()}`, body: `${p.propertyTitle} is secured. Check in on ${p.checkIn}. Lala Kenya holds your payment until arrival.` }),
  payment_deposit: (p) => ({ title: `Deposit received · Ksh ${p.amount?.toLocaleString()}`, body: `50% deposit for ${p.propertyTitle} confirmed. Pay balance before ${p.checkIn}.` }),
  cancelled: (p) => ({ title: `Booking cancelled`, body: `${p.propertyTitle} booking was cancelled. Refund processed per Lala Kenya policy.` }),
  checkin: (p) => ({ title: `${p.guestName} has checked in`, body: `${p.propertyTitle} · Your payout of Ksh ${p.amount?.toLocaleString()} is released at checkout.` }),
  checkout: (p) => ({ title: `Stay complete · Ksh ${p.amount?.toLocaleString()} earned`, body: `${p.guestName} checked out of ${p.propertyTitle}. Payout is being processed by Lala Kenya.` }),
  missed_call: (p) => ({ title: `Missed call`, body: `${p.guestName || p.hostName} tried to reach you on Lala Kenya.` }),
  review_request: (p) => ({ title: `How was your stay?`, body: `Share your experience at ${p.propertyTitle} to help other travellers on Lala Kenya.` }),
  payout: (p) => ({ title: `Payout sent · Ksh ${p.amount?.toLocaleString()}`, body: `Your earnings for ${p.propertyTitle} have been sent to your account.` }),
  payment_reminder: (p) => ({ title: `Your booking expires soon`, body: `Complete payment for ${p.propertyTitle} in the next 15 minutes or your reservation will be released.` }),
  checkin_reminder: (p) => ({ title: `Your stay starts tomorrow`, body: `Get ready for ${p.propertyTitle}. Check-in is ${p.checkIn}. Safe travels from Lala Kenya.` }),
  new_message: (p) => ({ title: `New message from ${p.guestName || p.hostName}`, body: `You have an unread message about ${p.propertyTitle} on Lala Kenya.` }),
  missed_call_reminder: (p) => ({ title: `You missed a call`, body: `${p.guestName || p.hostName} tried to reach you about ${p.propertyTitle}. Call back on Lala Kenya.` }),
};

export async function sendNotification(params: NotifParams) {
  const tmpl = templates[params.type];
  if (!tmpl) return;
  const { title, body } = tmpl(params);
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId, type: params.type, title, body,
    data: { booking_id: params.bookingId, property_title: params.propertyTitle, ...params.extra },
    is_read: false,
  });
  if (error) console.error('Notification error:', error.message);
}
