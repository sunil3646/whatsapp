import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: String,
  meta_msg_id: String,
  wa_id: String,
  from: String,
  to: String,
  body: String,
  timestamp: Number,
  datetime: Date,
  type: String,
  status: String,
  outgoing: Boolean,
  raw: Object
});

export default mongoose.model('Message', MessageSchema);
