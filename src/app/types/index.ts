// Types for LALA Kenya Application

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badge?: string;
  isFavorite?: boolean;
  bedrooms: number;
  beds: number;
  guests: number;
  description: string;
  amenities: string[];
  hostId: string;
  hostName: string;
  hostJoined?: string;
  hostProperties?: number;
  verified: boolean;
  instantBook: boolean;
  houseRules?: string[];
  cancellationPolicy?: string;
  cleaningFee?: number;
  securityDeposit?: number;
  responseTime?: string;
  responseRate?: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  guestId: string;
  guestName: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
  paymentMethod?: string;
  paymentId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'guest' | 'host';
  verified?: boolean;
  joinedDate?: string;
  bio?: string;
}

export interface HostStats {
  totalEarnings: number;
  earningsGrowth: number;
  totalBookings: number;
  averageRating: number;
  activeListings: number;
  occupancyRate: number;
  responseRate?: number;
  responseTime?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  phone: string;
  method: 'mpesa';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  transactionId?: string;
}

export type FilterCategory = 'All' | 'Apartment' | 'Studio' | 'Penthouse' | 'Shared';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  bookingId: string;
  propertyTitle: string;
  propertyImage: string;
  participantId: string;
  participantName: string;
  participantPhone?: string;
  participantAvatar?: string;
  participantRole: 'guest' | 'host';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface CallStatus {
  active: boolean;
  conversationId?: string;
  participantName?: string;
  duration?: number;
}