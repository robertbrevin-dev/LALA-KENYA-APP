import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import BackRefreshBar from '../components/BackRefreshBar';

export default function Messages() {
  const { conversations } = useApp();
  const navigate = useNavigate();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <PhoneFrame>
      <BackRefreshBar />
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Header */}
        <div className="px-6 pt-14 pb-5">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[28px] mb-2"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 900,
              color: 'var(--lala-white)'
            }}
          >
            Messages
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[14px]"
            style={{ color: 'var(--lala-soft)' }}
          >
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </motion.p>
        </div>

        {/* Conversations List */}
        <div className="px-6 pb-24">
          {conversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-16"
            >
              <div className="text-[60px] mb-4">💬</div>
              <p 
                className="text-[14px]"
                style={{ color: 'var(--lala-soft)' }}
              >
                No messages yet.<br />
                Book a property to start chatting with hosts.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/conversation/${conversation.id}`)}
                  className="p-4 rounded-2xl cursor-pointer transition-all hover:opacity-90"
                  style={{
                    background: 'var(--lala-card)',
                    border: '1px solid var(--lala-border)',
                  }}
                >
                  <div className="flex gap-3">
                    {/* Property Image */}
                    <div 
                      className="w-14 h-14 rounded-xl flex-shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${conversation.propertyImage})` }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-[14px] truncate"
                            style={{ 
                              color: 'var(--lala-white)',
                              fontWeight: 600
                            }}
                          >
                            {conversation.participantName}
                          </h3>
                          <p 
                            className="text-[12px] truncate"
                            style={{ color: 'var(--lala-soft)' }}
                          >
                            {conversation.propertyTitle}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span 
                            className="text-[11px]"
                            style={{ color: 'var(--lala-muted)' }}
                          >
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                              style={{
                                background: 'var(--lala-gold)',
                                color: 'var(--lala-deep)',
                                fontWeight: 700
                              }}
                            >
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                      <p 
                        className="text-[13px] truncate"
                        style={{ 
                          color: conversation.unreadCount > 0 ? 'var(--lala-white)' : 'var(--lala-muted)',
                          fontWeight: conversation.unreadCount > 0 ? 500 : 400
                        }}
                      >
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
