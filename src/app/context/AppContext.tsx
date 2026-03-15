import { createContext, useContext, useState, useEffect, ReactNode } from 'react';



import { Property, User, Booking, Conversation, Message, CallStatus } from '../types';



import { supabase } from '../../lib/supabase';



import { useLanguage } from './LanguageContext.tsx';







interface AppContextType {



  properties: Property[];



  currentUser: User | null;



  favorites: string[];



  bookings: Booking[];



  conversations: Conversation[];



  callStatus: CallStatus;



  loading: boolean;



  refreshUser: () => Promise<void>;



  toggleFavorite: (propertyId: string) => void;



  addBooking: (booking: Booking) => void;



  sendMessage: (conversationId: string, text: string) => void;



  sendSimulatedMessage: (conversationId: string, senderId: string, senderName: string, text: string) => void;



  createConversation: (



    booking: Booking,



    participantRole: 'guest' | 'host',



    participantName: string,



    participantId: string,



    participantPhone?: string



  ) => Promise<string>;



  startCall: (conversationId: string, participantName: string, participantPhone?: string, receiverId?: string, callType?: string) => void;
  acceptCall: (call: any) => void;
  rejectCall: (call: any) => void;
  incomingCall: any;



  endCall: () => void;



  markMessagesAsRead: (conversationId: string) => void;



  updateUserAvatar: (url: string) => Promise<void>;



  removeUserAvatar: () => Promise<void>;



  logout: () => Promise<void>;



}







const AppContext = createContext<AppContextType | undefined>(undefined);







export function AppProvider({ children }: { children: ReactNode }) {



  const { t } = useLanguage();



  const [properties, setProperties] = useState<Property[]>([]);



  const [currentUser, setCurrentUser] = useState<User | null>(null);



  const [favorites, setFavorites] = useState<string[]>([]);



  const [bookings, setBookings] = useState<Booking[]>([]);



  const [conversations, setConversations] = useState<Conversation[]>([]);



  const [callStatus, setCallStatus] = useState<CallStatus>({ active: false });
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    const sub = supabase.channel('incoming-calls-' + currentUser.id)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'calls',
        filter: 'receiver_id=eq.' + currentUser.id
      }, async (payload) => {
        const call = payload.new;
        console.log('INCOMING CALL PAYLOAD:', call, 'status:', call.call_status);
        const { data: caller } = await supabase.from('profiles').select('full_name').eq('id', call.caller_id).maybeSingle();
        console.log('CALLER NAME:', caller?.full_name);
        setIncomingCall({ ...call, caller_name: caller?.full_name || 'Unknown' });
        console.log('incomingCall SET');
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'calls',
        filter: 'caller_id=eq.' + currentUser.id
      }, (payload) => {
        if (payload.new.call_status === 'rejected' || payload.new.call_status === 'ended') {
          setCallStatus({ active: false });
        }
        if (payload.new.call_status === 'accepted') {
          setCallStatus(prev => ({ ...prev, active: true, connected: true }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [currentUser?.id]);



  const [loading, setLoading] = useState(true);







  const clearState = () => {



    setCurrentUser(null);



    setFavorites([]);



    setBookings([]);



    setConversations([]);



    setCallStatus({ active: false });



  };







  const logout = async () => {



    await supabase.auth.signOut();



    clearState();



    // Always send users to the auth chooser after logout



    window.location.href = '/signup';



  };







  useEffect(() => {



    let mounted = true;







    async function getUser() {



      const { data: { session } } = await supabase.auth.getSession();



      if (!mounted) return;



      if (session?.user) {



        // Fetch user profile to get role from profiles table



        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();



        



        console.log('🔍 Auth Debug:', {



          userId: session.user.id,



          profile: profile,



          profileRole: profile?.role,



          finalRole: profile?.role || 'guest'



        });



        



        setCurrentUser({



          id: session.user.id,



          name: session.user.user_metadata?.full_name || 'User',



          email: session.user.email || '',



          phone: session.user.user_metadata?.phone || '',



          avatar: session.user.user_metadata?.avatar_url || undefined,



          role: (profile?.role || 'guest') as 'guest' | 'host',



        });



      } else {



        setCurrentUser(null);



      }



      setLoading(false);



    }







    getUser();







    const { data: authListener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {



      if (!mounted) return;



      console.log('AUTH EVENT:', _event, 'session:', !!session, 'user:', !!session?.user);



      if (_event === 'INITIAL_SESSION') return;



      if (_event === 'SIGNED_OUT') {



        clearState();



        setLoading(false);



        window.location.href = '/signup';



        return;



      }



      if (session?.user) {



        const fetchProfile = async () => {



          const { data: profile } = await supabase



            .from('profiles')



            .select('role, full_name, avatar_url')



            .eq('id', session.user.id)



            .single();



          if (!mounted) return;



          setCurrentUser({



            id: session.user.id,



            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',



            email: session.user.email || '',



            phone: session.user.user_metadata?.phone || '',



            avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || undefined,



            // ALWAYS read role from profiles table — never from auth metadata on login



        role: (profile?.role || 'guest') as 'guest' | 'host',



          });



          // Set loading=false ONLY after role is known



          setLoading(false);



        };



        fetchProfile();



      } else {



        setCurrentUser(null);



        setLoading(false);



      }



    });







    return () => {



      mounted = false;



      authListener.subscription.unsubscribe();



    };



  }, []);







  const refreshUser = async (forceRole?: 'guest' | 'host') => {



    if (forceRole) sessionStorage.setItem('lala-force-role', forceRole);



    const { data: { session } } = await supabase.auth.getSession();



    if (session?.user) {



      const { data: profile } = await supabase.from('profiles').select('role, full_name, avatar_url').eq('id', session.user.id).single();



      setCurrentUser({



        id: session.user.id,



        name: profile?.full_name || session.user.user_metadata?.full_name || 'User',



        email: session.user.email || '',



        phone: session.user.user_metadata?.phone || '',



        avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || undefined,



        role: (forceRole || sessionStorage.getItem('lala-force-role') || profile?.role || 'guest') as 'guest' | 'host',



      });



    }



  };







  const updateUserAvatar = async (url: string) => {



    await supabase.auth.updateUser({ data: { avatar_url: url } });



    setCurrentUser(prev => (prev ? { ...prev, avatar: url } : prev));



  };







  const removeUserAvatar = async () => {



    const existing = currentUser?.avatar;



    try {



      if (existing && existing.includes('/storage/v1/object/public/avatars/')) {



        const parts = existing.split('/storage/v1/object/public/avatars/');



        const path = parts[1]?.split('?')[0];



        if (path) await supabase.storage.from('avatars').remove([path]);



      }



    } catch {}



    await supabase.auth.updateUser({ data: { avatar_url: null as any } });



    setCurrentUser(prev => (prev ? { ...prev, avatar: undefined } : prev));



  };







  useEffect(() => {



    async function fetchProperties() {



      setLoading(true);



      const { data, error } = await supabase



        .from('properties')



        .select(`



          id, title, location, area, price_per_night, rating, total_reviews,



          primary_image_url, property_type, badge, bedrooms, beds, max_guests,



          description, amenities, host_id, is_featured, instant_book,



          house_rules, cancellation_policy, cleaning_fee, response_time,



          response_rate, listing_status, latitude, longitude, image_urls,
          profiles!host_id (full_name, avatar_url, created_at)



        `)



        .eq('listing_status', 'approved')



        .order('created_at', { ascending: false });







      if (error) {



        setProperties([]); // No mock data — real listings only



        setLoading(false);



        return;



      }







      if (data) {



        const mapped: Property[] = data.map((p: any) => ({



          id: p.id,



          title: p.title,



          location: p.area || (p.location?.startsWith?.("POINT") ? "" : p.location) || "",



          latitude: p.latitude ?? null,



          images: p.image_urls ?? [],



          longitude: p.longitude ?? null,



          price: p.price_per_night,



          rating: p.rating ?? 0,



          reviews: p.total_reviews ?? 0,



          image: p.primary_image_url || '🏢',



          category: p.property_type || 'Apartment',



          badge: p.badge ?? undefined,



          isFavorite: false,



          bedrooms: p.bedrooms ?? 1,



          beds: p.beds ?? 1,



          guests: p.max_guests ?? 2,



          description: p.description ?? '',



          amenities: p.amenities ?? [],



          hostId: p.host_id,



          hostName: p.profiles?.full_name || 'Host',



          hostJoined: p.profiles?.created_at ?? undefined,



          verified: p.is_featured ?? false,



          instantBook: p.instant_book ?? false,



          houseRules: p.house_rules ?? [],



          cancellationPolicy: p.cancellation_policy ?? undefined,



          cleaningFee: p.cleaning_fee ?? 0,



          responseTime: p.response_time ?? undefined,



          responseRate: p.response_rate ?? undefined,



        }));



        setProperties(mapped);



      }



      setLoading(false);



    }



    fetchProperties();



  }, []);







  // Load real conversations + messages from Supabase



  useEffect(() => {



    if (!currentUser) {



      setConversations([]);



      return;



    }



    async function fetchConversations() {



      const userCol = currentUser!.role === 'host' ? 'host_id' : 'guest_id';



      const { data: convData, error: convError } = await supabase



        .from('conversations')



        .select('*')



        .eq(userCol, currentUser!.id)



        .order('last_message_time', { ascending: false });



      if (convError) { console.error('Conversations fetch error:', convError.message); return; }



      if (!convData || convData.length === 0) return;



      const convIds = convData.map((c: any) => c.id);



      const { data: msgData } = await supabase



        .from('messages')



        .select('*')



        .in('conversation_id', convIds)



        .order('created_at', { ascending: true });



      const msgsByConv: Record<string, Message[]> = {};



      (msgData ?? []).forEach((m: any) => {



        if (!msgsByConv[m.conversation_id]) msgsByConv[m.conversation_id] = [];



        msgsByConv[m.conversation_id].push({



          id: m.id, conversationId: m.conversation_id,



          senderId: m.sender_id, senderName: m.sender_name,



          text: m.text, timestamp: m.created_at, read: m.read,



        });



      });



      const mapped: Conversation[] = convData.map((c: any) => {



        const msgs = msgsByConv[c.id] ?? [];



        const unread = msgs.filter((m: Message) => !m.read && m.senderId !== currentUser!.id).length;



        return {



          id: c.id, bookingId: c.booking_id,



          propertyTitle: c.property_title, propertyImage: c.property_image || '',



          participantId: c.participant_id || '', participantName: currentUser?.role === 'host' ? (c.guest_name || c.participant_name || 'Guest') : (c.host_name || c.participant_name || 'Host'),



          participantPhone: c.participant_phone, participantRole: c.participant_role || 'host',



          lastMessage: c.last_message || 'Start a conversation',



          lastMessageTime: c.last_message_time, unreadCount: unread, messages: msgs,



        };



      });



      setConversations(mapped);



    }



    fetchConversations();



  }, [currentUser]);







  // Load user favorites when logged in



  useEffect(() => {



    if (!currentUser) {



      setFavorites([]);



      return;



    }







    async function fetchFavorites() {



      const { data, error } = await supabase



        .from('favorites')



        .select('property_id')



        .eq('user_id', currentUser?.id);







      if (error) {



        console.error('Favorites fetch error:', error.message);



        return;



      }







      if (data) {



        const favoriteIds = data.map(f => f.property_id);



        setFavorites(favoriteIds);



        



        // Update properties to reflect favorite status



        setProperties(prev => prev.map(p => ({



          ...p,



          isFavorite: favoriteIds.includes(p.id)



        })));



      }



    }







    fetchFavorites();



  }, [currentUser]);







  // Load user bookings when logged in



  useEffect(() => {



    if (!currentUser) {



      setBookings([]);



      return;



    }







    async function fetchBookings() {



      const { data, error } = await supabase



        .from('bookings')



        .select('*')



        .eq('guest_id', currentUser?.id)



        .order('check_in', { ascending: false });







      if (error) {



        console.error('Bookings fetch error:', error.message);



        return;



      }







      if (data) {



        const mappedBookings: Booking[] = data.map(b => ({



          id: b.id,



          propertyId: b.property_id,



          propertyTitle: b.property_title,



          propertyLocation: b.property_location,



          guestId: b.guest_id,



          guestName: b.guest_name,



          guestPhone: b.guest_phone,



          checkIn: b.check_in,



          checkOut: b.check_out,



          nights: b.nights,



          totalAmount: b.total_amount,



          status: b.booking_status,



          createdAt: b.created_at,



        }));



        setBookings(mappedBookings);



      }



    }







    fetchBookings();



  }, [currentUser]);







  const toggleFavorite = async (propertyId: string) => {



    if (!currentUser) return;



    const isFav = favorites.includes(propertyId);



    if (isFav) {



      setFavorites(prev => prev.filter(id => id !== propertyId));



      await supabase.from('favorites').delete().eq('property_id', propertyId).eq('user_id', currentUser.id);



    } else {



      setFavorites(prev => [...prev, propertyId]);



      await supabase.from('favorites').insert({ user_id: currentUser.id, property_id: propertyId });



    }



    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, isFavorite: !isFav } : p));



  };







  const addBooking = async (booking: Booking) => {



    if (!currentUser) return;



    const { error } = await supabase.from('bookings').insert({



      id: booking.id,



      property_id: booking.propertyId,



      guest_id: currentUser.id,



      property_title: booking.propertyTitle,



      property_location: booking.propertyLocation,



      guest_name: booking.guestName,



      guest_phone: booking.guestPhone,



      check_in: booking.checkIn,



      check_out: booking.checkOut,



      nights: booking.nights,



      base_amount: booking.totalAmount,



      total_amount: booking.totalAmount,



      currency: 'KES',



      booking_status: booking.status,



    });



    if (!error) setBookings(prev => [booking, ...prev]);



  };







  const sendMessage = async (conversationId: string, text: string) => {



    if (!currentUser) return;



    const now = new Date().toISOString();



    const newMessage: Message = {



      id: `msg-${Date.now()}`, conversationId,



      senderId: currentUser.id, senderName: currentUser.name,



      text, timestamp: now, read: false,



    };



    const { data: insertedMsg } = await supabase.from('messages').insert({



      conversation_id: conversationId,



      sender_id: currentUser.id,



      sender_name: currentUser.name,



      text,



    }).select().single();



    if (insertedMsg) newMessage.id = insertedMsg.id;



    await supabase.from('conversations').update({



      last_message: text, last_message_time: now,



    }).eq('id', conversationId);



    setConversations(prev =>



      prev.map(c => c.id === conversationId



        ? { ...c, messages: [...c.messages, newMessage], lastMessage: text, lastMessageTime: now }



        : c



      )



    );



  };







  const sendSimulatedMessage = (conversationId: string, senderId: string, senderName: string, text: string) => {



    const newMessage: Message = {



      id: `msg-${Date.now()}`,



      conversationId,



      senderId,



      senderName,



      text,



      timestamp: new Date().toISOString(),



      read: false,



    };



    setConversations(prev =>



      prev.map(c => c.id === conversationId



        ? { ...c, messages: [...c.messages, newMessage], lastMessage: text, lastMessageTime: new Date().toISOString() }



        : c



      )



    );



  };







  const createConversation = async (



    booking: Booking,



    participantRole: 'guest' | 'host',



    participantName: string,



    participantId: string,



    participantPhone?: string



  ): Promise<string> => {



    const conversationId = `conv-${booking.id}`;



    const existing = conversations.find(c => c.id === conversationId);



    if (existing) return conversationId;



    const property = properties.find(p => p.id === booking.propertyId);



    const now = new Date().toISOString();



    const newConversation: Conversation = {



      id: conversationId, bookingId: booking.id,



      propertyTitle: booking.propertyTitle, propertyImage: property?.image || '',



      participantId, participantName, participantPhone, participantRole,



      lastMessage: 'Start a conversation', lastMessageTime: now, unreadCount: 0, messages: [],



    };



    const isGuest = currentUser?.role === 'guest';



    await supabase.from('conversations').upsert({



      id: conversationId, booking_id: booking.id,



      property_title: booking.propertyTitle, property_image: property?.image || '',



      guest_id: isGuest ? currentUser?.id : participantId,



      host_id: isGuest ? participantId : currentUser?.id,



      participant_id: participantId, participant_name: participantName,



      participant_phone: participantPhone ?? null, participant_role: participantRole,



      last_message: 'Start a conversation', last_message_time: now,



    });



    setConversations(prev => [newConversation, ...prev]);



    return conversationId;



  };







  const startCall = async (conversationId: string, participantName: string, participantPhone?: string, receiverId?: string, callType: string = 'audio') => {
    if (!currentUser) return;
    const { data: callRow, error: callError } = await supabase.from('calls').insert({
      conversation_id: conversationId,
      caller_id: currentUser.id,
      receiver_id: receiverId,
      call_type: callType,
      call_status: 'ringing',
      started_at: new Date().toISOString(),
    }).select().single();
    if (callError) { console.error('CALL INSERT ERROR:', JSON.stringify(callError)); } else { console.log('CALL OK:', callRow?.id); }
    setCallStatus({ active: true, conversationId, participantName, duration: 0, callId: callRow?.id, callType });
  };
  const acceptCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'accepted' }).eq('id', call.id);
    setCallStatus({ active: true, conversationId: call.conversation_id, participantName: call.caller_name || 'Caller', duration: 0, callId: call.id, callType: call.call_type });
    setIncomingCall(null);
  };
  const rejectCall = async (call: any) => {
    await supabase.from('calls').update({ call_status: 'rejected', ended_at: new Date().toISOString() }).eq('id', call.id);
    setIncomingCall(null);
  };
  const endCall = async () => {
    if (callStatus.callId) {
      await supabase.from('calls').update({ call_status: 'ended', ended_at: new Date().toISOString() }).eq('id', callStatus.callId);
    }
    setCallStatus({ active: false });
  };















  const markMessagesAsRead = (conversationId: string) => {



    setConversations(prev =>



      prev.map(c => c.id === conversationId



        ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read: true })) }



        : c



      )



    );



  };







  return (



    <AppContext.Provider value={{



      properties, currentUser, favorites, bookings, conversations,



      callStatus, incomingCall, loading, toggleFavorite, refreshUser, addBooking, sendMessage,



      sendSimulatedMessage, createConversation, startCall, endCall, acceptCall, rejectCall,



      markMessagesAsRead, updateUserAvatar, removeUserAvatar, logout,



    }}>



      {children}



    </AppContext.Provider>



  );



}







export function useApp() {



  const context = useContext(AppContext);



  if (!context) throw new Error('useApp must be used within an AppProvider');



  return context;



}



