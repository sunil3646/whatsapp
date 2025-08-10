import React, { useEffect, useState, useRef } from 'react';

// Sample initial messages with timestamps and status
const sampleMessages = {
  Alice: [
    { _id: 1, from: 'Alice', body: "Hey! How's it going?", timestamp: Date.now() - 600000 },
    { _id: 2, from: 'me', body: 'I am good, thanks! How about you?', timestamp: Date.now() - 590000, status: 'read' },
  ],
  Bob: [
    { _id: 3, from: 'Bob', body: "Are we still meeting tomorrow?", timestamp: Date.now() - 500000 },
    { _id: 4, from: 'me', body: "Yes, looking forward to it!", timestamp: Date.now() - 490000, status: 'read' },
  ],
  Charlie: [
    { _id: 5, from: 'Charlie', body: 'Did you watch the game last night?', timestamp: Date.now() - 700000 },
    { _id: 6, from: 'me', body: 'Yeah! It was amazing!', timestamp: Date.now() - 680000, status: 'read' },
    { _id: 7, from: 'Charlie', body: 'Totally agree!', timestamp: Date.now() - 670000 },
  ],
};

function Messages({ wa_id }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Load initial messages on wa_id change
  useEffect(() => {
    if (!wa_id) {
      setMessages([]);
      return;
    }
    setMessages(sampleMessages[wa_id] || []);
  }, [wa_id]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate incoming new messages every 20 seconds (mock WebSocket)
  useEffect(() => {
    if (!wa_id) return;

    const interval = setInterval(() => {
      const newIncoming = {
        _id: Date.now(),
        from: wa_id,
        body: 'New message from ' + wa_id,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newIncoming]);
    }, 20000);

    return () => clearInterval(interval);
  }, [wa_id]);

  // Simulate ticking sent messages to read after 5 seconds
  useEffect(() => {
    const timeouts = messages
      .filter(msg => msg.from === 'me' && msg.status === 'sent')
      .map(msg =>
        setTimeout(() => {
          setMessages(prevMessages =>
            prevMessages.map(m =>
              m._id === msg._id ? { ...m, status: 'read' } : m
            )
          );
        }, 5000)
      );

    return () => timeouts.forEach(clearTimeout);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = {
      _id: Date.now(),
      from: 'me',
      body: input,
      timestamp: Date.now(),
      status: 'sent', // initial gray tick
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img
          src={`https://ui-avatars.com/api/?name=${wa_id}&background=random&length=1`}
          alt={wa_id}
          style={styles.avatar}
        />
        <span style={styles.name}>{wa_id}</span>
      </header>

      <div style={styles.messages}>
        {messages.map(msg => (
          <div
            key={msg._id}
            style={{
              ...styles.message,
              ...(msg.from === 'me' ? styles.sent : styles.received),
              position: 'relative',
              paddingBottom: 24, // space for time & ticks
            }}
          >
            {msg.body}

            {/* Sent message ticks */}
            {msg.from === 'me' && (
              <span style={{ ...styles.tick, position: 'absolute', bottom: 4, right: 10 }}>
                {msg.status === 'read' ? (
                  <span style={{ color: '#4fc3f7' }}>✔✔</span> // blue ticks
                ) : (
                  <span style={{ color: '#999' }}>✔</span> // gray tick
                )}
              </span>
            )}

            {/* Timestamp */}
            <div
              style={{
                ...styles.time,
                position: 'absolute',
                bottom: 2,
                right: msg.from === 'me' ? 35 : 10,
              }}
            >
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer style={styles.footer}>
        <input
          style={styles.input}
          placeholder="Type a message"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button style={styles.sendBtn} onClick={handleSend}>
          ➤
        </button>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    color: '#222',
  },
  messages: {
    flex: 1,
    padding: 15,
    overflowY: 'auto',
    backgroundColor: '#ece5dd',
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    maxWidth: '60%',
    marginBottom: 10,
    padding: '10px 15px',
    borderRadius: 20,
    fontSize: 15,
    wordBreak: 'break-word',
  },
  sent: {
    backgroundColor: '#dcf8c6',
    marginLeft: 'auto',
    borderBottomRightRadius: 0,
  },
  received: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderBottomLeftRadius: 0,
  },
  tick: {
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    display: 'flex',
    padding: '10px 15px',
    borderTop: '1px solid #ddd',
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    border: '1px solid #ccc',
    padding: '8px 15px',
    fontSize: 16,
    outline: 'none',
  },
  sendBtn: {
    backgroundColor: '#128c7e',
    border: 'none',
    color: 'white',
    borderRadius: '50%',
    width: 38,
    height: 38,
    marginLeft: 10,
    cursor: 'pointer',
    fontSize: 20,
    lineHeight: '38px',
    textAlign: 'center',
  },
};

export default Messages;
