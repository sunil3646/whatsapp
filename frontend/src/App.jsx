import React, { useState } from 'react';
import Conversations from './components/Conversations';
import Messages from './components/Messages';

const sampleConversations = [
  {
    wa_id: 'Alice',
    lastMessage: { timestamp: Date.now() - 600000, body: "Hey! How's it going?" },
    count: 2,
  },
  {
    wa_id: 'Bob',
    lastMessage: { timestamp: Date.now() - 900000, body: "Let's catch up tomorrow." },
    count: 1,
  },
  {
    wa_id: 'Charlie',
    lastMessage: { timestamp: Date.now() - 1800000, body: 'Did you see the game last night?' },
    count: 3,
  },
];

function App() {
  const [selectedWaId, setSelectedWaId] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#ededed' }}>
      <div style={{ width: 360, borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        <header style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <img
            src="https://randomuser.me/api/portraits/men/75.jpg"
            alt="Profile"
            style={{ width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', alignSelf: 'flex-start' }}
          />
          <input
            type="search"
            placeholder="Search or start new chat"
            style={{ padding: '8px 12px', borderRadius: 20, border: 'none', backgroundColor: '#f6f6f6', outline: 'none', fontSize: 14, width: '100%', boxSizing: 'border-box' }}
          />
        </header>
        <Conversations
          conversations={sampleConversations}
          selectedWaId={selectedWaId}
          onSelectConversation={setSelectedWaId}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        {selectedWaId ? <Messages wa_id={selectedWaId} /> : <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', fontSize: 18 }}>Select a conversation to start chatting</div>}
      </div>
    </div>
  );
}

export default App;
