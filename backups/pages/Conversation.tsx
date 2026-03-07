import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Video, Send, ArrowLeft, PhoneOff } from 'lucide-react';
import PhoneFrame from '../components/PhoneFrame';
import BackRefreshBar from '../components/BackRefreshBar';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';

export default function Conversation() {
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

  const { conversations, currentUser, sendMessage, sendSimulatedMessage, markMessagesAsRead, callStatus, startCall, endCall } = appContext;
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCallUI, setShowCallUI] = useState(false);

  // Debug: Log route params and conversation lookup
  console.log('Conversation component - route ID:', id);
  console.log('Conversation component - available conversations:', conversations);

  const conversation = conversations.find(c => c.id === id);
  console.log('Conversation component - found conversation:', conversation);

  useEffect(() => {
    if (conversation) {
      markMessagesAsRead(conversation.id);
    }
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  useEffect(() => {
    setShowCallUI(callStatus.active && callStatus.conversationId === id);
  }, [callStatus.active, callStatus.conversationId, id]);

  if (!conversation || !conversations) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'var(--lala-soft)' }}>Conversation not found</p>
        </div>
      </PhoneFrame>
    );
  }

  // Debug: Log conversation details
  console.log('Conversation component - conversation found:', !!conversation);
  if (conversation) {
    console.log('Conversation component - participant phone:', conversation.participantPhone);
    console.log('Conversation component - participant name:', conversation.participantName);
  }

  const handleSend = () => {
    if (!currentUser) {
      alert('Please log in to send messages');
      return;
    }
    
    if (messageText.trim() && conversation) {
      sendMessage(conversation.id, messageText.trim());
      setMessageText('');
      
      // Simulate host/guest response after 2 seconds
      setTimeout(() => {
        const responses = [
          "Thanks for reaching out! I'll get back to you shortly.",
          "Great question! Let me check on that for you.",
          "I'm available to help with your booking.",
          "Feel free to ask if you have any other questions!",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add simulated response from other party
        sendSimulatedMessage(
          conversation.id,
          conversation.participantId,
          conversation.participantName,
          randomResponse
        );
      }, 2000);
    }
  };

  const handleStartCall = () => {
    startCall(conversation.id, conversation.participantName, conversation.participantPhone);
  };

  const handleEndCall = () => {
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1a1b23 0%, #0A0B10 100%)',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              {/* Avatar */}
              <div 
                className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-[48px]"
                style={{
                  background: 'var(--lala-card)',
                  border: '3px solid var(--lala-gold)',
                }}
              >
                👤
              </div>

              {/* Participant Name */}
              <h2 
                className="text-[24px] mb-2"
                style={{
                  color: 'var(--lala-white)',
                  fontFamily: 'var(--font-playfair)',
                  fontWeight: 700
                }}
              >
                {callStatus.participantName}
              </h2>

              {/* Call Duration */}
              <p 
                className="text-[18px] mb-12"
                style={{ color: 'var(--lala-gold)' }}
              >
                {formatCallDuration(callStatus.duration)}
              </p>

              {/* Call Status */}
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[14px] mb-16"
                style={{ color: 'var(--lala-soft)' }}
              >
                Call in progress...
              </motion.p>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: '#dc2626',
                  boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4)',
                }}
              >
                <PhoneOff size={32} color="white" />
              </button>
            </motion.div>
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
            onClick={() => navigate('/messages')}
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
                {conversation.participantName}
              </h3>
              {conversation.participantPhone && (
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
              {conversation.propertyTitle}
            </p>
          </div>

          {/* Call Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleStartCall}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:opacity-70 relative group"
              style={{
                background: conversation.participantPhone ? 'var(--lala-teal)' : 'var(--lala-deep)',
                opacity: conversation.participantPhone ? 1 : 0.6
              }}
              title={conversation.participantPhone ? `Call ${conversation.participantPhone}` : 'Phone number not available'}
            >
              <Phone size={18} color="white" />
              {conversation.participantPhone && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'var(--lala-night)',
                    color: 'var(--lala-white)',
                    border: '1px solid var(--lala-border)'
                  }}
                >
                  {conversation.participantPhone}
                </div>
              )}
            </button>
            <button
              onClick={handleStartCall}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:opacity-70"
              style={{
                background: conversation.participantPhone ? 'var(--lala-gold)' : 'var(--lala-deep)',
                opacity: conversation.participantPhone ? 1 : 0.6
              }}
              title={conversation.participantPhone ? 'Video call' : 'Video call not available'}
            >
              <Video size={18} color={conversation.participantPhone ? 'var(--lala-deep)' : 'var(--lala-muted)'} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {conversation.messages.length === 0 ? (
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
              {conversation.messages.map((message, index) => {
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
                        background: isCurrentUser ? 'var(--lala-gold)' : 'var(--lala-card)',
                        color: isCurrentUser ? 'var(--lala-deep)' : 'var(--lala-white)',
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
      <BottomNav />
    </PhoneFrame>
  );
}
