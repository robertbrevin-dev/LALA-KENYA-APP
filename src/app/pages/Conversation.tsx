import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Video, Send, ArrowLeft, PhoneOff } from 'lucide-react';
import PhoneFrame from '../components/PhoneFrame';
import BackRefreshBar from '../components/BackRefreshBar';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Message } from '../types';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function Conversation() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appContext = useApp(); // Get entire context safely
  
  // Defensive: Check if context exists before destructuring
  if (!appContext) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'var(--lala-soft)' }}>Loading...</p>
        </div>
      </PhoneFrame>
    );
  }

  const { conversations, currentUser, sendMessage, sendSimulatedMessage, markMessagesAsRead, callStatus, callConnected, incomingCall, startCall, endCall, acceptCall, rejectCall } = appContext;
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCallUI, setShowCallUI] = useState(false);
  const [callType, setCallType] = useState('audio');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callState, setCallState] = useState('calling');
  const [localDuration, setLocalDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream|null>(null);
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [payCountdown, setPayCountdown] = useState<number>(0);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState<'mpesa'|'airtel'|'card'|null>(null);
  const [payPhone, setPayPhone] = useState('');
  const [payType, setPayType] = useState<'full'|'deposit'|null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadMessages() {
      const { data, error } = await supabase
        .from('messages').select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setRealtimeMessages(data.map((m: any) => ({
          id: m.id, conversationId: m.conversation_id,
          senderId: m.sender_id, senderName: m.sender_name,
          text: m.text, timestamp: m.created_at, read: m.read,
        })));
      }
      setMessagesLoaded(true);
    }
    loadMessages();
    const channel = supabase
      .channel('messages:' + id)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: 'conversation_id=eq.' + id,
      }, (payload: any) => {
        const m = payload.new;
        setRealtimeMessages(prev =>
          prev.find(x => x.id === m.id) ? prev : [...prev, {
            id: m.id, conversationId: m.conversation_id,
            senderId: m.sender_id, senderName: m.sender_name,
            text: m.text, timestamp: m.created_at, read: m.read,
          }]
        );
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  

  // Debug: Log route params and conversation lookup
  console.log('Conversation component - route ID:', id);
  console.log('Conversation component - available conversations:', conversations);

  const conversation = conversations.find(c => c.id === id);

  const [remoteConv, setRemoteConv] = useState<any>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  useEffect(() => {
    supabase.from('conversations').select('*').eq('id', id).maybeSingle()
      .then(({ data }) => { if (data) setRemoteConv(data); });
  }, [id, conversation]);

  useEffect(() => {
    const bookingId = remoteConv?.booking_id;
    if (!bookingId) return;
    const fetchBooking = () => supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle()
      .then(({ data }) => { if (data) setBooking(data); });
    fetchBooking();
    const sub = supabase.channel('booking:' + bookingId)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: 'id=eq.' + bookingId }, (payload) => { setBooking(payload.new); })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [remoteConv?.booking_id]);

  useEffect(() => {
    if (!booking || booking.booking_status !== 'accepted') return;
    const deadline = new Date(booking.updated_at || booking.created_at).getTime() + 30*60*1000;
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setPayCountdown(remaining);
      if (remaining === 0) {
        clearInterval(tick);
        supabase.from('bookings').update({ booking_status: 'expired' }).eq('id', booking.id)
          .then(() => setBooking((prev) => prev ? { ...prev, booking_status: 'expired' } : prev));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [booking?.id, booking?.booking_status]);

  const handlePay = async (type) => {
    if (!booking || paying) return;
    setPaying(true);
    const amount = type === 'full' ? Math.round(booking.total_amount * 1.03) : 1000;
    await supabase.from('bookings').update({ booking_status: 'payment_pending', payment_type: type, amount_paid: amount }).eq('id', booking.id);
    setBooking((prev) => ({ ...prev, booking_status: 'payment_pending' }));
    setTimeout(async () => {
      await supabase.from('bookings').update({ booking_status: 'paid' }).eq('id', booking.id);
      setBooking((prev) => ({ ...prev, booking_status: 'paid' }));
      await supabase.from('notifications').insert({ user_id: booking.host_id, type: 'paid', title: 'Payment Received!', body: 'Ksh ' + amount.toLocaleString() + ' for ' + booking.property_title, data: { booking_id: booking.id }, is_read: false });
      setPaying(false);
    }, 3000);
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    await supabase.from('bookings').update({ booking_status: 'cancelled' }).eq('id', booking.id);
    setBooking((prev) => ({ ...prev, booking_status: 'cancelled' }));
  };



  const activeConversation = conversation || (remoteConv ? {
    id: remoteConv.id, bookingId: remoteConv.booking_id,
    propertyTitle: remoteConv.property_title, propertyImage: remoteConv.property_image || '',
    participantId: remoteConv.participant_id || '', participantName: remoteConv.participant_name || 'Host',
    participantPhone: remoteConv.participant_phone, participantRole: remoteConv.participant_role || 'host',
    lastMessage: remoteConv.last_message, lastMessageTime: remoteConv.last_message_time,
    unreadCount: 0, messages: [],
  } : null);
  useEffect(() => {
    if (!currentUser) return;
    // For guest: fetch host profile. For host: fetch guest profile.
    const otherId = currentUser.role === 'host'
      ? (remoteConv?.guest_id || activeConversation?.participantId)
      : (remoteConv?.host_id || activeConversation?.participantId);
    console.log('Fetching other user name, otherId:', otherId, 'role:', currentUser.role);
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data, error }) => {
        console.log('Profile fetch result:', data, error);
        if (data?.full_name) setOtherUserName(data.full_name);
      });
  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id, activeConversation?.participantId]);

  // Sync callState from realtime AppContext updates
  useEffect(() => {
    if (!callStatus.active) {
      setCallState('calling');
    } else if ((callStatus as any).connected || callConnected) {
      setCallState('connected');
    }
  }, [callStatus.active, (callStatus as any).connected, callConnected]);

  // Auto missed call after 30s if no answer
  useEffect(() => {
    if (callState !== 'calling' || !callStatus.active) return;
    const timer = setTimeout(() => {
      handleEndCall();
      // TODO: save missed call message
    }, 30000);
    return () => clearTimeout(timer);
  }, [callState, callStatus.active]);
  console.log('DEBUG role:', currentUser?.role, 'host_id:', remoteConv?.host_id, 'guest_id:', remoteConv?.guest_id, 'otherUserName:', otherUserName);
  const allMessages = messagesLoaded ? realtimeMessages : (activeConversation?.messages ?? []);
  console.log('Conversation component - found conversation:', conversation);

  useEffect(() => {
    if (activeConversation) {
      markMessagesAsRead(activeConversation?.id ?? "");
    }
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  useEffect(() => {
    setShowCallUI(callStatus.active && callStatus.conversationId === id);
    if (callStatus.active && callStatus.conversationId === id && callConnected) {
      setCallState('connected');
    }
  }, [callStatus.active, callStatus.conversationId, id, callConnected]);

  // Timer counts when connected
  useEffect(() => {
    if (callState !== 'connected') { setLocalDuration(0); return; }
    const t = setInterval(() => setLocalDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  // Fallback poll: check call status every 2s
  useEffect(() => {
    if (callState !== 'calling' || !callStatus.callId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('calls').select('call_status').eq('id', callStatus.callId).maybeSingle();
      if (data?.call_status === 'accepted') setCallState('connected');
      if (data?.call_status === 'rejected' || data?.call_status === 'ended') { setCallState('calling'); endCall(); }
    }, 2000);
    return () => clearInterval(interval);
  }, [callState, callStatus.callId]);

  if (!activeConversation) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'var(--lala-soft)' }}>{t('messages.conversation_not_found')}</p>
        </div>
      </PhoneFrame>
    );
  }

  // Debug: Log conversation details
  console.log('Conversation component - conversation found:', !!conversation);
  if (activeConversation) {
    console.log('Conversation component - participant phone:', activeConversation?.participantPhone);
    console.log('Conversation component - participant name:', activeConversation?.participantName);
  }

  const handleSend = () => {
    if (!currentUser) {
      alert('Please log in to send messages');
      return;
    }
    
    if (messageText.trim() && conversation) {
      sendMessage(activeConversation?.id ?? "", messageText.trim());
      setMessageText('');
      
      // Simulate host/guest response after 2 seconds
    }
  };

  const handleStartCall = (type = 'audio') => {
    setCallType(type); setIsMuted(false); setIsSpeaker(false); setIsVideoOff(false); setCallState('calling');
    const receiverId = currentUser?.role === 'guest' ? remoteConv?.host_id : remoteConv?.guest_id;
    const callerName = otherUserName || activeConversation?.participantName || '';
    console.log('Starting call - receiverId:', receiverId, 'remoteConv:', remoteConv);
    if (!receiverId) {
      console.error('No receiverId found!');
      return;
    }
    startCall(activeConversation?.id ?? "", callerName, activeConversation?.participantPhone, receiverId, type);
    if (type === 'video') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }).catch(err => console.error('Camera error:', err));
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => console.error('Mic error:', err));
    }
    // wait for host to accept via realtime
  };


  const handleEndCall = () => {
    setLocalDuration(0);
    setCallState('calling');
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); setLocalStream(null); }
    endCall();
  };

  const formatCallDuration = (seconds: number = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <PhoneFrame>
      <BackRefreshBar />
      {/* Call UI Overlay */}
      <AnimatePresence>
        {showCallUI && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute inset-0 z-50 flex flex-col"
            style={{ background: 'linear-gradient(160deg, #0d1f1a 0%, #061210 55%, #0a0d1a 100%)' }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
              <div className="text-[12px] uppercase tracking-widest" style={{ color: 'rgba(62,207,178,0.6)' }}>
                Lala Kenya
              </div>
              <div className="text-[12px] px-3 py-1 rounded-full" style={{ background: 'rgba(62,207,178,0.1)', color: '#3ECFB2' }}>
                {callType === 'video' ? 'Video' : 'Voice'} call
              </div>
            </div>
            {/* Center - avatar + name */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-8">
                {callState === 'calling' && [1,2,3].map(i => (
                  <motion.div key={i}
                    className="absolute rounded-full"
                    style={{ border: '1px solid rgba(62,207,178,0.25)', top: -i*22, left: -i*22, right: -i*22, bottom: -i*22 }}
                    animate={{ opacity: [0.5, 0], scale: [1, 1.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  />
                ))}
                <div className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1a3330, #0d1f1a)', border: callState === 'connected' ? '2px solid #3ECFB2' : '2px solid rgba(62,207,178,0.3)', boxShadow: callState === 'connected' ? '0 0 40px rgba(62,207,178,0.15)' : 'none', fontSize: 52 }}>
                  &#128100;
                </div>
              </div>
              <div className="text-[26px] mb-1" style={{ color: 'white', fontWeight: 800 }}>
                {otherUserName || (currentUser?.role === 'guest' ? remoteConv?.host_name : remoteConv?.guest_name) || callStatus.participantName || ''}
              </div>
              <motion.div
                animate={callState === 'calling' ? { opacity: [0.4, 1, 0.4] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[15px] mb-3"
                style={{ color: callState === 'connected' ? '#3ECFB2' : 'rgba(255,255,255,0.45)' }}>
                {callState === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') : formatCallDuration(localDuration)}
              </motion.div>
              {callState === 'connected' && (
                <div className="text-[11px] px-3 py-1 rounded-full" style={{ background: 'rgba(62,207,178,0.1)', color: '#3ECFB2', border: '1px solid rgba(62,207,178,0.2)' }}>
                  Connected
                </div>
              )}
            </div>
            {/* Controls */}
            <div className="pb-14 px-8">
              <div className="flex items-center justify-center gap-6 mb-8">
                <button onClick={() => setIsMuted(m => !m)}
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1"
                  style={{ background: isMuted ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill={isMuted ? '#000' : 'white'}/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill={isMuted ? '#000' : 'white'}/>
                  </svg>
                  <span style={{ fontSize: 9, color: isMuted ? '#000' : 'rgba(255,255,255,0.6)' }}>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button onClick={handleEndCall}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: '#dc2626', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}>
                  <PhoneOff size={26} color="white" />
                </button>
                <button onClick={() => setIsSpeaker(s => !s)}
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-1"
                  style={{ background: isSpeaker ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" fill={isSpeaker ? '#000' : 'white'}/>
                  </svg>
                  <span style={{ fontSize: 9, color: isSpeaker ? '#000' : 'rgba(255,255,255,0.6)' }}>Speaker</span>
                </button>
              </div>
              {callType === 'video' && (
                <div className="flex justify-center">
                  <button onClick={() => setIsVideoOff(v => !v)}
                    className="w-12 h-12 rounded-full flex flex-col items-center justify-center gap-1"
                    style={{ background: isVideoOff ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.08)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill={isVideoOff ? '#000' : 'white'}/>
                    </svg>
                    <span style={{ fontSize: 9, color: isVideoOff ? '#000' : 'rgba(255,255,255,0.6)' }}>Camera</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
</AnimatePresence>

      {/* Regular Chat UI */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 flex items-center gap-3"
          style={{
            background: 'var(--lala-card)',
            borderBottom: '1px solid var(--lala-border)',
          }}
        >
          <button
            onClick={() => navigate(currentUser?.role === 'host' ? '/host/bookings' : '/messages')}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:opacity-70"
            style={{
              background: 'var(--lala-deep)',
            }}
          >
            <ArrowLeft size={18} color="var(--lala-white)" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="text-[15px] truncate"
                style={{ 
                  color: 'var(--lala-white)',
                  fontWeight: 600
                }}
              >
                {otherUserName || (currentUser?.role === 'guest' ? remoteConv?.host_name : remoteConv?.guest_name) || activeConversation?.participantName}
              </h3>
              {activeConversation?.participantPhone && (
                <div 
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                >
                  📱 Phone
                </div>
              )}
            </div>
            <p 
              className="text-[12px] truncate"
              style={{ color: 'var(--lala-soft)' }}
            >
              {activeConversation?.propertyTitle}
            </p>
          </div>

          {/* Call Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStartCall('audio')}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:opacity-70 relative group"
              style={{
                background: activeConversation?.participantPhone ? 'var(--lala-teal)' : 'var(--lala-deep)',
                opacity: activeConversation?.participantPhone ? 1 : 0.6
              }}
              title={activeConversation?.participantPhone ? `Call ${activeConversation?.participantPhone}` : 'Phone number not available'}
            >
              <Phone size={18} color="white" />
              {activeConversation?.participantPhone && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'var(--lala-night)',
                    color: 'var(--lala-white)',
                    border: '1px solid var(--lala-border)'
                  }}
                >
                  {activeConversation?.participantPhone}
                </div>
              )}
            </button>
            <button
              onClick={() => handleStartCall('audio')}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:opacity-70"
              style={{
                background: activeConversation?.participantPhone ? 'var(--lala-gold)' : 'var(--lala-deep)',
                opacity: activeConversation?.participantPhone ? 1 : 0.6
              }}
              onClick={() => handleStartCall('video')} title={activeConversation?.participantPhone ? 'Video call' : 'Video call not available'}
            >
              <Video size={18} color={activeConversation?.participantPhone ? 'var(--lala-deep)' : 'var(--lala-muted)'} />
            </button>
          </div>
        </div>

        {booking && currentUser?.role === 'guest' && ['accepted','payment_pending','paid'].includes(booking.booking_status) && (
          <div className="px-4 pt-4">
            <div className="rounded-[20px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1f1b, #061412)', border: '1px solid rgba(62,207,178,0.25)' }}>
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(62,207,178,0.15)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] uppercase tracking-widest" style={{ color: '#3ECFB2', fontWeight: 700 }}>Booking Request</div>
                  <div className="text-[11px] px-2.5 py-1 rounded-full uppercase" style={{ background: booking.booking_status === 'paid' ? 'rgba(62,207,178,0.15)' : 'rgba(232,184,109,0.15)', color: booking.booking_status === 'paid' ? '#3ECFB2' : '#E8B86D', fontWeight: 700 }}>
                    {booking.booking_status === 'paid' ? 'Paid' : booking.booking_status === 'payment_pending' ? 'Processing...' : 'Accepted'}
                  </div>
                </div>
                <div className="text-[17px]" style={{ fontWeight: 800, color: 'var(--lala-white)' }}>{booking.property_title}</div>
                <div className="text-[12px] mt-1" style={{ color: 'var(--lala-muted)' }}>{booking.check_in} to {booking.check_out} - {booking.nights} night{booking.nights !== 1 ? 's' : ''}</div>
              </div>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(62,207,178,0.1)' }}>
                <div className="flex justify-between text-[13px] mb-1.5"><span style={{ color: 'var(--lala-muted)' }}>Room rate</span><span style={{ color: 'var(--lala-soft)' }}>Ksh {Number(booking.total_amount).toLocaleString()}</span></div>
                <div className="flex justify-between text-[13px] mb-1.5"><span style={{ color: 'var(--lala-muted)' }}>Platform fee (3%)</span><span style={{ color: 'var(--lala-soft)' }}>Ksh {Math.round(Number(booking.total_amount)*0.03).toLocaleString()}</span></div>
                <div className="flex justify-between text-[15px] mt-2"><span style={{ color: 'var(--lala-white)', fontWeight: 700 }}>Total</span><span style={{ color: '#E8B86D', fontWeight: 800 }}>Ksh {Math.round(Number(booking.total_amount)*1.03).toLocaleString()}</span></div>
              </div>
              {booking.booking_status === 'accepted' && payCountdown > 0 && (
                <div className="px-4 py-2 text-center text-[12px]" style={{ color: payCountdown < 300 ? '#FF6B6B' : '#E8B86D' }}>
                  Pay within {Math.floor(payCountdown/60)}:{String(payCountdown%60).padStart(2,'0')} to confirm
                </div>
              )}
              {booking.booking_status === 'accepted' && !payType && (
                <div className="px-4 py-4 space-y-2.5">
                  <button onClick={() => setPayType('full')} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 800 }}>
                    Pay Full &mdash; Ksh {Math.round(Number(booking.total_amount)*1.03).toLocaleString()}
                  </button>
                  <button onClick={() => setPayType('deposit')} className="w-full py-3 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'rgba(232,184,109,0.1)', color: '#E8B86D', fontWeight: 700, border: '1px solid rgba(232,184,109,0.25)' }}>
                    Pay Deposit 50% &mdash; Ksh {Math.round(Number(booking.total_amount)*0.5).toLocaleString()}
                  </button>
                  <button onClick={handleCancelBooking} className="w-full py-2.5 rounded-[14px] border-none cursor-pointer text-[13px]" style={{ background: 'transparent', color: 'rgba(255,107,107,0.7)', fontWeight: 600 }}>
                    Cancel Request
                  </button>
                </div>
              )}
              {booking.booking_status === 'accepted' && payType && !payMethod && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setPayType(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lala-muted)', fontSize: 18, padding: 0 }}>&#8592;</button>
                    <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>Choose payment method</div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => setPayMethod('mpesa')} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer flex items-center gap-3 px-4" style={{ background: 'rgba(0,150,57,0.1)', border: '1px solid rgba(0,150,57,0.3)' }}>
                      <svg width="40" height="26" viewBox="0 0 40 26" fill="none"><rect width="40" height="26" rx="6" fill="#009639"/><text x="5" y="18" fontFamily="Arial" fontWeight="900" fontSize="11" fill="white">M-PESA</text></svg>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#00c44f', fontWeight: 700, fontSize: 14 }}>M-Pesa</div>
                        <div style={{ color: 'var(--lala-muted)', fontSize: 11 }}>Safaricom mobile money</div>
                      </div>
                    </button>
                    <button onClick={() => setPayMethod('airtel')} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer flex items-center gap-3 px-4" style={{ background: 'rgba(255,0,0,0.07)', border: '1px solid rgba(255,0,0,0.2)' }}>
                      <svg width="40" height="26" viewBox="0 0 40 26" fill="none"><rect width="40" height="26" rx="6" fill="#FF0000"/><text x="4" y="18" fontFamily="Arial" fontWeight="900" fontSize="11" fill="white">AIRTEL</text></svg>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#ff4444', fontWeight: 700, fontSize: 14 }}>Airtel Money</div>
                        <div style={{ color: 'var(--lala-muted)', fontSize: 11 }}>Airtel mobile money</div>
                      </div>
                    </button>
                    <button onClick={() => setPayMethod('card')} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer flex items-center gap-3 px-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                      <svg width="40" height="26" viewBox="0 0 40 26" fill="none"><rect width="40" height="26" rx="6" fill="#1A1F71"/><circle cx="15" cy="13" r="7" fill="#EB001B"/><circle cx="25" cy="13" r="7" fill="#F79E1B"/><path d="M20 7.2a7 7 0 010 11.6A7 7 0 0120 7.2z" fill="#FF5F00"/></svg>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#818cf8', fontWeight: 700, fontSize: 14 }}>Visa / Mastercard</div>
                        <div style={{ color: 'var(--lala-muted)', fontSize: 11 }}>Credit or debit card</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              {booking.booking_status === 'accepted' && payType && payMethod && payMethod !== 'card' && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setPayMethod(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lala-muted)', fontSize: 18, padding: 0 }}>&#8592;</button>
                    <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>{payMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} number</div>
                  </div>
                  <input type="tel" value={payPhone} onChange={e => setPayPhone(e.target.value)}
                    placeholder={payMethod === 'mpesa' ? '07XX XXX XXX' : '073X XXX XXX'}
                    className="w-full px-4 py-3 rounded-[12px] mb-3 text-[14px]"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.3)', color: 'var(--lala-white)', outline: 'none' }} />
                  <button onClick={() => handlePay(payType)} disabled={paying || payPhone.length < 9} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]"
                    style={{ background: paying || payPhone.length < 9 ? 'rgba(62,207,178,0.3)' : 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: '#061412', fontWeight: 800 }}>
                    {paying ? 'Sending STK Push...' : 'Send STK Push - Ksh ' + (payType === 'full' ? Math.round(Number(booking.total_amount)*1.03) : Math.round(Number(booking.total_amount)*0.5)).toLocaleString()}
                  </button>
                </div>
              )}
              {booking.booking_status === 'accepted' && payType && payMethod === 'card' && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setPayMethod(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lala-muted)', fontSize: 18, padding: 0 }}>&#8592;</button>
                    <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>Card details</div>
                  </div>
                  <input type="text" placeholder="Card number" maxLength={19} className="w-full px-4 py-3 rounded-[12px] mb-2 text-[14px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--lala-white)', outline: 'none' }} />
                  <div className="flex gap-2 mb-3">
                    <input type="text" placeholder="MM/YY" maxLength={5} className="flex-1 px-4 py-3 rounded-[12px] text-[14px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--lala-white)', outline: 'none' }} />
                    <input type="text" placeholder="CVV" maxLength={3} className="flex-1 px-4 py-3 rounded-[12px] text-[14px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--lala-white)', outline: 'none' }} />
                  </div>
                  <button onClick={() => handlePay(payType)} disabled={paying} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 800 }}>
                    {paying ? 'Processing...' : 'Pay Ksh ' + (payType === 'full' ? Math.round(Number(booking.total_amount)*1.03) : Math.round(Number(booking.total_amount)*0.5)).toLocaleString()}
                  </button>
                </div>
              )}
              {booking.booking_status === 'payment_pending' && (
                <div className="px-4 py-4 text-center">
                  <div className="text-[14px]" style={{ color: 'var(--lala-white)', fontWeight: 700 }}>Check your phone</div>
                  <div className="text-[12px] mt-1" style={{ color: 'var(--lala-muted)' }}>M-Pesa STK push sent. Enter PIN to complete.</div>
                </div>
              )}
              {booking.booking_status === 'paid' && (
                <div className="px-4 py-4 text-center">
                  <div className="text-[14px]" style={{ color: '#3ECFB2', fontWeight: 700 }}>Booking Confirmed!</div>
                  <div className="text-[12px] mt-1" style={{ color: 'var(--lala-muted)' }}>Your stay is secured. See you on {booking.check_in}!</div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-[48px] mb-3">💬</div>
              <p 
                className="text-[14px]"
                style={{ color: 'var(--lala-soft)' }}
              >
                No messages yet.<br />
                Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allMessages.map((message, index) => {
                const isCurrentUser = currentUser && message.senderId === currentUser.id;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[75%] px-4 py-3 rounded-2xl"
                      style={{
                        background: isCurrentUser ? 'var(--lala-gold)' : 'rgba(59,130,246,0.85)',
                        color: isCurrentUser ? 'var(--lala-deep)' : '#ffffff',
                        borderBottomRightRadius: isCurrentUser ? '4px' : '16px',
                        borderBottomLeftRadius: isCurrentUser ? '16px' : '4px',
                      }}
                    >
                      <p className="text-[14px] leading-relaxed break-words">
                        {message.text}
                      </p>
                      <p 
                        className="text-[11px] mt-1"
                        style={{ 
                          color: isCurrentUser ? 'rgba(10, 11, 16, 0.6)' : 'var(--lala-muted)',
                        }}
                      >
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div 
          className="px-6 py-4"
          style={{
            background: 'var(--lala-card)',
            borderTop: '1px solid var(--lala-border)',
          }}
        >
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-full"
            style={{
              background: 'var(--lala-deep)',
              border: '1px solid var(--lala-border)',
            }}
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={currentUser ? "Type a message..." : "Please log in to send messages"}
              disabled={!currentUser}
              className="flex-1 bg-transparent border-none outline-none text-[14px]"
              style={{
                color: 'var(--lala-white)',
                opacity: currentUser ? 1 : 0.6,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim() || !currentUser}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all disabled:opacity-40"
              style={{
                background: (messageText.trim() && currentUser) ? 'var(--lala-gold)' : 'transparent',
              }}
            >
              <Send size={16} color={messageText.trim() ? 'var(--lala-deep)' : 'var(--lala-muted)'} />
            </button>
          </div>
        </div>
      </div>
      <BottomNav type={currentUser?.role === 'host' ? 'host' : 'guest'} />
      {/* Incoming Call UI */}
      {incomingCall && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #0d1f1a 0%, #061210 55%, #0a0d1a 100%)' }}>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #1a3330, #0d1f1a)', border: '2px solid rgba(62,207,178,0.4)', fontSize: 52 }}>
              &#128100;
            </div>
            <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'rgba(62,207,178,0.6)' }}>
              Incoming {incomingCall.call_type === 'video' ? 'Video' : 'Voice'} Call
            </div>
            <div className="text-[26px] mb-1" style={{ color: 'white', fontWeight: 800 }}>
              {incomingCall.caller_name}
            </div>
            <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Lala Kenya call</div>
          </div>
          <div className="flex items-center justify-center gap-16 pb-16">
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => rejectCall(incomingCall)}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#dc2626', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}>
                <PhoneOff size={26} color="white" />
              </button>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => { acceptCall(incomingCall); setCallState('connected'); setLocalDuration(0); setCallType(incomingCall.call_type || 'audio'); }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#16a34a', boxShadow: '0 8px 32px rgba(22,163,74,0.45)' }}>
                <Phone size={26} color="white" />
              </button>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Accept</span>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
