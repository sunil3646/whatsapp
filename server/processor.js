// server/processor.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'your_mongo_uri_here';
const payloadDir = path.join(__dirname, 'payloads'); // unzip files here

// Message schema (match it with server models)
const messageSchema = new mongoose.Schema({
  id: { type: String, index: true, unique: true, sparse: true },
  meta_msg_id: { type: String, index: true, sparse: true },
  wa_id: String, // phone id (sender or receiver)
  from: String,
  to: String,
  body: String,
  timestamp: Number,
  datetime: Date,
  type: String,
  status: { type: String, enum: ['sent','delivered','read','unknown'], default: 'unknown' },
  status_history: [{ status: String, timestamp: Number, datetime: Date }],
  raw: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Message = mongoose.model('ProcessedMessage', messageSchema);

async function connect() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
}

function toDate(ts) {
  if (!ts) return null;
  // if ts is seconds, convert
  if (String(ts).length === 10) return new Date(+ts * 1000);
  return new Date(+ts);
}

async function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON in ${filePath}`, e);
    return;
  }

  // Heuristics: payload may contain message or status updates
  // Adapt this mapping to match sample payload structure
  // Example structures:
  // { "messages": [ { id, from, to, timestamp, text: { body } } ] }
  // { "statuses": [ { id / meta_msg_id, status, timestamp } ] }

  if (payload.messages && Array.isArray(payload.messages)) {
    for (const msg of payload.messages) {
      const doc = {
        id: msg.id || msg.message_id || null,
        meta_msg_id: msg.meta_msg_id || null,
        wa_id: msg.from || msg.to || msg.wa_id || null,
        from: msg.from || null,
        to: msg.to || null,
        body: (msg.text && msg.text.body) || msg.body || msg.message || null,
        timestamp: +msg.timestamp || Date.now(),
        datetime: toDate(msg.timestamp || Date.now()),
        type: msg.type || (msg.text ? 'text' : 'unknown'),
        status: msg.status || 'sent',
        raw: msg
      };

      // Upsert by id or meta_msg_id
      const query = {};
      if (doc.id) query.$or = [{ id: doc.id }, { meta_msg_id: doc.id }];
      else if (doc.meta_msg_id) query.$or = [{ meta_msg_id: doc.meta_msg_id }, { id: doc.meta_msg_id }];
      else if (doc.from && doc.timestamp) query.$and = [{ from: doc.from }, { timestamp: doc.timestamp }];

      try {
        const updated = await Message.findOneAndUpdate(query, {
          $setOnInsert: doc,
          $set: { datetime: doc.datetime, body: doc.body, type: doc.type, wa_id: doc.wa_id, raw: doc.raw },
          $push: { status_history: { status: doc.status, timestamp: doc.timestamp, datetime: doc.datetime } }
        }, { upsert: true, new: true });
        console.log('Upserted message:', updated._id);
      } catch (e) {
        console.error('Error upserting message', e);
      }
    }
  }

  if (payload.statuses && Array.isArray(payload.statuses)) {
    for (const st of payload.statuses) {
      const msgId = st.id || st.message_id || st.meta_msg_id;
      const status = st.status || st.delivery || 'unknown';
      const ts = +st.timestamp || Date.now();

      const query = msgId ? { $or: [{ id: msgId }, { meta_msg_id: msgId }] } : null;
      if (!query) continue;

      try {
        const doc = await Message.findOneAndUpdate(query, {
          $set: { status: status, datetime: toDate(ts) },
          $push: { status_history: { status, timestamp: ts, datetime: toDate(ts) } }
        }, { new: true });
        if (doc) console.log(`Updated status for message ${msgId} => ${status}`);
        else console.warn(`No message found for status update id=${msgId}`);
      } catch (e) {
        console.error('Error updating status', e);
      }
    }
  }
}

async function run() {
  await connect();
  const files = fs.readdirSync(payloadDir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    console.log('Processing', f);
    await processFile(path.join(payloadDir, f));
  }
  console.log('Done processing payloads');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
