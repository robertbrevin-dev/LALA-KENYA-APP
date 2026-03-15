with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    """                const isCurrentUser = currentUser && message.senderId === currentUser.id;
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
                        borderBottomLeftRadius: isCurrentUser ? '16px' : '4px',""",
    """                const isCurrentUser = currentUser && message.senderId === currentUser.id;
                const isHostMessage = message.senderId === (remoteConv?.host_id || activeConversation?.participantId);
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
                        background: isHostMessage ? 'rgba(59,130,246,0.85)' : 'var(--lala-gold)',
                        color: isHostMessage ? '#fff' : 'var(--lala-deep)',
                        borderBottomRightRadius: isCurrentUser ? '4px' : '16px',
                        borderBottomLeftRadius: isCurrentUser ? '16px' : '4px',"""
)

print("Done" if "isHostMessage" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
