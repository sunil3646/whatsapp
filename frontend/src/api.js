import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getConversations = () => API.get('/conversations');
export const getMessages = (wa_id) => API.get(`/messages/${wa_id}`);
export const sendMessage = (messageData) => API.post('/messages', messageData);
