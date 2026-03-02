import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, User, Booking, Conversation, Message, CallStatus } from '../types';
import { supabase } from '../../lib/supabase';

interface AppContextType {
  properties: Property[];
  currentUser: User | null;
  favorites: string[];
  bookings: Booking[];
  conversations: Conversation[];
  callStatus: CallStatus;
  loading: boolean;
  toggleFavorite: (propertyId: string) => void;
  addBooking: (booking: Booking) => void;
  sendMessage: (conversationId: string, text: string) => void;
  sendSimulatedMessage: (conversationId: string, senderId: string, senderName: string, text: string) => void;
  createConversation: (
    booking: Booking,
    participantRole: 'guest' | 'host',
    participantName: string,
    participantId: string
  ) => string;
  startCall: (conversationId: string, participantName: string) => void;
  endCall: () => void;
  markMessagesAsRead: (conversationId: string) => void;
  updateUserAvatar: (url: string) => Promise<void>;
  removeUserAvatar: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>({ active: false });
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
    // Always send users to the auth chooser ("Join LALA Kenya") after logout
    window.location.href = '/signup';
  };

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || 'User',
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone || '',
          avatar: session.user.user_metadata?.avatar_url || undefined,
          role: session.user.user_metadata?.role || 'guest',
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    }

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (_event === 'SIGNED_OUT') {
        clearState();
        setLoading(false);
        window.location.href = '/signup';
        return;
      }
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || 'User',
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone || '',
          avatar: session.user.user_metadata?.avatar_url || undefined,
          role: session.user.user_metadata?.role || 'guest',
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

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
          response_rate, listing_status
        `)
        .eq('listing_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Properties fetch error:', error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const mapped: Property[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          location: p.area || p.location,
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
          hostName: 'Host',
          hostJoined: undefined,
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
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      text,
    });
    setConversations(prev =>
      prev.map(c => c.id === conversationId
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: text, lastMessageTime: new Date().toISOString() }
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

  const createConversation = (
    booking: Booking,
    participantRole: 'guest' | 'host',
    participantName: string,
    participantId: string
  ): string => {
    const conversationId = `conv-${booking.id}`;
    const existing = conversations.find(c => c.id === conversationId);
    if (existing) return conversationId;
    const property = properties.find(p => p.id === booking.propertyId);
    const newConversation: Conversation = {
      id: conversationId,
      bookingId: booking.id,
      propertyTitle: booking.propertyTitle,
      propertyImage: property?.image || '',
      participantId,
      participantName,
      participantRole,
      lastMessage: 'Start a conversation',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
    };
    setConversations(prev => [...prev, newConversation]);
    return conversationId;
  };

  const startCall = (conversationId: string, participantName: string) => {
    setCallStatus({ active: true, conversationId, participantName, duration: 0 });
  };

  const endCall = () => setCallStatus({ active: false });

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
      callStatus, loading, toggleFavorite, addBooking, sendMessage,
      sendSimulatedMessage, createConversation, startCall, endCall,
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