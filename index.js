require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Barter = require('./books.model');
const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/popdemo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB model for offers
const Offer = require('./offers.model');
const messages = {}; // (Messages can stay in-memory for now)

// --- MARKETPLACE OFFERS API (MongoDB) ---
// Get all offers
app.get('/api/marketplace/offers', async (req, res) => {
  try {
    const offers = await Offer.find({});
    res.json(offers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Post a new offer
app.post('/api/marketplace/offers', async (req, res) => {
  try {
    const { user, offer, reveal, preset, tokenAmount, cap } = req.body;
    if (!user || !offer || !preset || !tokenAmount || !cap) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (tokenAmount > cap) {
      return res.status(400).json({ error: 'Token amount exceeds cap.' });
    }
    const newOffer = new Offer({ user, offer, reveal, preset, tokenAmount, cap });
    await newOffer.save();
    res.status(201).json(newOffer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Delete an offer
app.delete('/api/marketplace/offers/:id', async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// --- BOOKS LEDGER API (MongoDB) ---
// Get all barters for a user
app.get('/api/books/:username', async (req, res) => {
  try {
    const barters = await Barter.find({ username: req.params.username });
    res.json(barters);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Add a new barter for a user
app.post('/api/books/:username', async (req, res) => {
  try {
    const barter = new Barter({ ...req.body, username: req.params.username });
    await barter.save();
    res.status(201).json(barter);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Progress a barter day
app.patch('/api/books/:username/:barterId/progress', async (req, res) => {
  try {
    const barter = await Barter.findOne({ _id: req.params.barterId, username: req.params.username });
    if (!barter) return res.status(404).json({ error: 'Barter not found' });
    // Simulate outcome
    const outcome = Math.random();
    let adj = 0;
    let note = 'Normal day';
    if (outcome < 0.2) { adj = -Math.round(barter.expenseEstimate * 0.2); note = 'Bad day (loss)'; }
    else if (outcome > 0.8) { adj = Math.round(barter.expenseEstimate * 0.2); note = 'Good day (gain)'; }
    barter.expenseEstimate = Math.max(0, barter.expenseEstimate + adj);
    barter.lastProgressNote = note;
    barter.progressPending = true;
    await barter.save();
    res.json({ barter, note });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Approve day progression
app.patch('/api/books/:username/:barterId/approve', async (req, res) => {
  try {
    const barter = await Barter.findOne({ _id: req.params.barterId, username: req.params.username });
    if (!barter) return res.status(404).json({ error: 'Barter not found' });
    barter.progressPending = false;
    barter.approved = true;
    await barter.save();
    res.json(barter);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Minting Endpoints for SEA APIs ---

/**
 * Finverse OAuth & Data Pull
 * Flow:
 * 1. Frontend gets /api/minting/finverse/auth-url, redirects user to Finverse consent screen.
 * 2. User authorizes, Finverse redirects to /api/minting/finverse/callback with code.
 * 3. Backend exchanges code for access_token, fetches account & transactions, calculates PoP cap.
 */
const axios = require('axios');

app.get('/api/minting/finverse/auth-url', (req, res) => {
  const redirectUri = process.env.FINVERSE_REDIRECT_URI || 'http://localhost:4000/api/minting/finverse/callback';
  const url = `https://api.finverse.com/v1/auth/authorize?client_id=${process.env.FINVERSE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=accounts%20transactions`;
  res.json({ url });
});

app.get('/api/minting/finverse/callback', async (req, res) => {
  const code = req.query.code;
  const redirectUri = process.env.FINVERSE_REDIRECT_URI || 'http://localhost:4000/api/minting/finverse/callback';
  try {
    // Exchange code for access_token
    const tokenResp = await axios.post('https://api.finverse.com/v1/auth/token', {
      client_id: process.env.FINVERSE_CLIENT_ID,
      client_secret: process.env.FINVERSE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });
    const accessToken = tokenResp.data.access_token;
    // Fetch accounts
    const accountsResp = await axios.get('https://api.finverse.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    // Fetch transactions (first account only for demo)
    const accountId = accountsResp.data.accounts[0]?.id;
    const txResp = await axios.get(`https://api.finverse.com/v1/accounts/${accountId}/transactions`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    // Calculate PoP cap from transactions
    const txs = txResp.data.transactions;
    const daysOperating = 90; // last 3 months
    const sales = txs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const avgDailySales = sales / daysOperating;
    const basicOperatingCosts = txs.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) / daysOperating;
    const conservativeModifier = 0.7;
    const cap = Math.round(((avgDailySales * daysOperating) - (basicOperatingCosts * daysOperating)) * conservativeModifier);
    res.json({ popTokenCap: cap > 0 ? cap : 0, account: accountsResp.data.accounts[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * Brankas Statement API
 * Flow:
 * 1. Frontend POSTs to /api/minting/brankas with account details (or bank login info for demo)
 * 2. Backend calls Brankas Statement API, fetches statement, calculates PoP cap.
 */
app.post('/api/minting/brankas', async (req, res) => {
  // See Brankas Statement API docs for required fields
  const { bank_code, account_number, start_date, end_date } = req.body;
  if (!bank_code || !account_number || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const brankasResp = await axios.post('https://api.brankas.com/statement', {
      bank_code,
      account_number,
      start_date,
      end_date
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Apikey': process.env.BRANKAS_CLIENT_SECRET
      }
    });
    // Calculate PoP cap from statement
    const txs = brankasResp.data.transactions || [];
    const daysOperating = txs.length > 0 ? Math.ceil((new Date(end_date) - new Date(start_date)) / (1000*60*60*24)) : 1;
    const sales = txs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const avgDailySales = sales / daysOperating;
    const basicOperatingCosts = txs.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) / daysOperating;
    const conservativeModifier = 0.7;
    const cap = Math.round(((avgDailySales * daysOperating) - (basicOperatingCosts * daysOperating)) * conservativeModifier);
    res.json({ popTokenCap: cap > 0 ? cap : 0, account_number });
  } catch (e) {
    res.status(500).json({ error: e.response?.data || e.message });
  }
});

// --- Marketplace Endpoints ---
// Post a new offer
app.post('/api/marketplace/offers', (req, res) => {
  const { user, offer, reveal } = req.body;
  if (!user || !offer) return res.status(400).json({ error: 'Missing user or offer.' });
  const newOffer = { id: Date.now(), user, offer, reveal, created: new Date() };
  offers.push(newOffer);
  res.json({ success: true, offer: newOffer });
});
// Get all offers
app.get('/api/marketplace/offers', (req, res) => {
  res.json(offers);
});
// Remove an offer
app.delete('/api/marketplace/offers/:id', (req, res) => {
  const idx = offers.findIndex(o => o.id == req.params.id);
  if (idx !== -1) {
    offers.splice(idx, 1);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Offer not found.' });
});
// Messaging between matched users (only if both are interested)
app.post('/api/marketplace/message', (req, res) => {
  const { from, to, offerId, text } = req.body;
  if (!from || !to || !offerId || !text) return res.status(400).json({ error: 'Missing fields.' });
  // Only allow if both parties have expressed interest (simulated demo logic)
  if (!messages[offerId]) messages[offerId] = [];
  messages[offerId].push({ from, to, text, time: new Date() });
  res.json({ success: true });
});
// Get messages for an offer
app.get('/api/marketplace/message/:offerId', (req, res) => {
  res.json(messages[req.params.offerId] || []);
});

app.get('/', (req, res) => {
  res.send('PoP Demo Backend is running.');
});

app.listen(PORT, () => {
  console.log(`PoP Demo Backend running on port ${PORT}`);
});
