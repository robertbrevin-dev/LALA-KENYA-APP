with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

old = """      setTimeout(() => {
        const responses = [
          "Thanks for reaching out! I'll get back to you shortly.",
          "Great question! Let me check on that for you.",   
          "I'm available to help with your booking.",        
          "Feel free to ask if you have any other questions!",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        // Add simulated response from other party
        sendSimulatedMessage(
          activeConversation?.id ?? "",
          conversation.participantId,
          activeConversation?.participantName,
          randomResponse
        );
      }, 2000);"""

if old in c:
    c = c.replace(old, "")
    print("Bot removed")
else:
    lines = c.split('\n')
    start = next((i for i,l in enumerate(lines) if 'setTimeout' in l and i > 100), None)
    if start:
        end = next((i for i,l in enumerate(lines) if i > start and '}, 2000);' in l), None)
        if end:
            lines = lines[:start] + lines[end+1:]
            c = '\n'.join(lines)
            print(f"Bot removed lines {start}-{end}")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
