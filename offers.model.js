// offers.model.js
const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  user: { type: String, required: true },
  offer: { type: String, required: true },
  reveal: { type: Boolean, default: true },
  preset: String,
  tokenAmount: Number,
  cap: Number,
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', OfferSchema);
