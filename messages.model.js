// messages.model.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  offerId: { type: String, required: true },
  from: String,
  to: String,
  text: String,
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
