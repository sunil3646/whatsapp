export const sampleConversations = [
  {
    wa_id: "Alice",
    lastMessage: {
      timestamp: Date.now() - 1000 * 60 * 5,
      body: "Hey, how are you?",
    },
    count: 3,
  },
  {
    wa_id: "Bob",
    lastMessage: {
      timestamp: Date.now() - 1000 * 60 * 60,
      body: "Let's meet tomorrow.",
    },
    count: 1,
  },
  {
    wa_id: "Charlie",
    lastMessage: {
      timestamp: Date.now() - 1000 * 60 * 2,
      body: "Did you check the report?",
    },
    count: 5,
  },
];
