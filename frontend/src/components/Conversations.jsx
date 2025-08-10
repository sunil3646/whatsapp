import React from 'react';

function Conversations({ conversations, selectedWaId, onSelectConversation }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {conversations.map(({ wa_id, lastMessage, count }) => {
        const isSelected = wa_id === selectedWaId;
        return (
          <div
            key={wa_id}
            onClick={() => onSelectConversation(wa_id)}
            style={{
              display: 'flex',
              padding: 12,
              cursor: 'pointer',
              backgroundColor: isSelected ? '#d6f5d6' : 'transparent',
              borderBottom: '1px solid #eee',
              alignItems: 'center',
            }}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${wa_id}&background=random&length=1`}
              alt={wa_id}
              style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 12 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong>{wa_id}</strong>
                <span style={{ fontSize: 12, color: '#999' }}>
                  {lastMessage?.timestamp ? formatTime(lastMessage.timestamp) : ''}
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#555', position: 'relative' }}>
                <span style={{ display: 'inline-block' }}>
                  {lastMessage?.body?.slice(0, 40) || 'No messages yet'}
                </span>
                {count > 1 && (
                  <span
                    style={{
                      backgroundColor: '#25D366',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '0 6px',
                      fontSize: 12,
                      marginLeft: 8,
                      position: 'absolute',
                      right: -20,
                      top: -2,
                      fontWeight: 'bold',
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Conversations;
