// books.model.js
const mongoose = require('mongoose');

const BarterSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Owner of this ledger entry
  fromUser: String,
  yourPreset: String,
  yourTokensGiven: Number,
  yourCap: Number,
  toUser: String,
  otherPreset: String,
  otherTokensReceived: Number,
  otherCap: Number,
  date: String,
  expenseEstimate: Number,
  progressPending: { type: Boolean, default: false },
  lastProgressNote: String,
  approved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Barter', BarterSchema);
