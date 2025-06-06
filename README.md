# PoP Demo Backend

This backend will support the live Minting and Marketplace demo for the PoP (Proof of Productivity) platform, to be embedded in the Squarespace site for investor and user trials.

## Features
- Secure API endpoints for:
  - Minting: Connect to SEA e-wallet/bank APIs (Brankas/Finverse) to fetch productivity data and calculate PoP token cap.
  - Marketplace: Allow users to post, reveal, and take down barter offers for PoP tokens (no persistent storage after session).
  - Messaging: Allow private messaging between users only if both are interested in a barter (ephemeral, no permanent storage).

## Security & Privacy
- No persistent storage of user data or messages.
- Only authenticated (passworded) users can access the demo.
- All API keys and secrets are kept server-side.

## Tech Stack
- Node.js + Express (API server)
- Brankas/Finverse SDKs for SEA financial data integration
- In-memory session storage (no database)
- CORS enabled for frontend demo app

## Setup
1. `npm install`
2. Add `.env` with Brankas/Finverse sandbox credentials
3. `npm start` or `npm run dev`

---

*This backend is for demo purposes only. No user data is stored beyond the session.*
