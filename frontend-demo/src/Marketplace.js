import React, { useState, useEffect } from "react";
import { getAllPresetsWithCap } from "./Presets";
import { addBarter } from "./BooksLogic";

export default function Marketplace({ username }) {
  const [offers, setOffers] = useState([]);
  const [offerText, setOfferText] = useState("");
  const [reveal, setReveal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msgOfferId, setMsgOfferId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");

  // Fetch offers
  const API_BASE = process.env.REACT_APP_API_BASE || "";

  useEffect(() => {
    fetch(`${API_BASE}/api/marketplace/offers`)
      .then(r => r.json())
      .then(setOffers)
      .catch(() => {
        // Ignore error, no demo mode logic needed
      });
  }, []);

  // Post new offer
  const [tokenAmount, setTokenAmount] = useState("");
  const userPresetName = localStorage.getItem("pop_demo_selected_preset");
  const presets = getAllPresetsWithCap();
  const userPreset = presets.find(p => p.name === userPresetName);
  const userCap = userPreset?.popTokenCap || 0;

  const handlePost = async e => {
    e.preventDefault();
    setOfferError("");
    if (!tokenAmount || isNaN(tokenAmount) || Number(tokenAmount) < 1 || Number(tokenAmount) > userCap) {
      setOfferError(`You must offer between 1 and ${userCap} tokens.`);
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/marketplace/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: username, offer: offerText, reveal, preset: userPresetName, tokenAmount: Number(tokenAmount), cap: userCap })
      });
      if (!resp.ok) {
        const err = await resp.json();
        setOfferError(err.error || "Failed to post offer.");
        setLoading(false);
        return;
      }
      setOfferText("");
      setTokenAmount("");
      setOfferError("");
      fetch(`${API_BASE}/api/marketplace/offers`).then(r => r.json()).then(setOffers);
    } catch (err) {
      setOfferError("Network error posting offer.");
    }
    setLoading(false);
  };



  // Remove offer
  const handleRemove = async id => {
    await fetch(`${API_BASE}/api/marketplace/offers/${id}`, { method: "DELETE" });
    fetch(`${API_BASE}/api/marketplace/offers`).then(r => r.json()).then(setOffers);
  };

  // Messaging
  const handleOpenMsg = offerId => {
    if (!offerId) {
      console.warn('No offerId provided to handleOpenMsg');
      return;
    }
    setMsgOfferId(offerId);
    setMessages([]); // Clear previous messages
    fetch(`${API_BASE}/api/marketplace/message/${offerId}`)
      .then(r => r.json())
      .then(setMessages)
      .catch(e => {
        setMessages([]);
        console.error('Error fetching messages:', e);
      });
    console.log('Modal opened for offerId:', offerId);
  };

  // Close modal and reset
  const handleCloseMsgModal = () => {
    setMsgOfferId(null);
    setMessages([]);
    setMsgText("");
    console.log('Modal closed');
  };

  const handleSendMsg = async e => {
    e.preventDefault();
    await fetch(`${API_BASE}/api/marketplace/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: username, to: "Other Party", offerId: msgOfferId, text: msgText })
    });
    setMsgText("");
    fetch(`${API_BASE}/api/marketplace/message/${msgOfferId}`)
      .then(r => r.json())
      .then(setMessages);
  };



  // Error state for offer posting
  const [offerError, setOfferError] = useState("");

  // Helper: is offer valid
  const isOfferValid =
    offerText &&
    tokenAmount &&
    !isNaN(tokenAmount) &&
    Number(tokenAmount) >= 1 &&
    Number(tokenAmount) <= userCap &&
    !loading;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-extrabold mb-6 text-blue-900 flex items-center gap-2">
        <span role="img" aria-label="market">🛒</span> Marketplace
      </h2>
      {/* User preset summary */}
      {userPreset && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl shadow flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
            {username[0]}
          </div>
          <div>
            <div className="font-semibold text-blue-900">{userPreset.name}</div>
            <div className="text-xs text-blue-700">PoP Cap: <span className="font-mono">{userCap}</span></div>
          </div>
        </div>
      )}
      {/* Offer creation */}
      <form onSubmit={handlePost} className="mb-6 flex flex-col md:flex-row md:items-end gap-4 bg-white p-4 rounded-xl shadow">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Offer Description</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={offerText}
            onChange={e => setOfferText(e.target.value)}
            placeholder="What do you want to barter?"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tokens Offered</label>
          <input
            type="number"
            min="1"
            max={userCap}
            className="border p-2 rounded w-28"
            value={tokenAmount}
            onChange={e => setTokenAmount(e.target.value)}
            placeholder={`Max ${userCap}`}
            required
          />
          <div className="text-xs text-blue-700 mt-1">You are offering <span className="font-bold">{tokenAmount || 0} / {userCap}</span> tokens</div>
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          disabled={!isOfferValid}
          type="submit"
        >
          Post Offer
        </button>
      </form>
      {offerError && (
        <div className="text-red-600 text-sm mb-4">{offerError}</div>
      )}
      {/* Offers feed */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><span role="img" aria-label="feed">📢</span> Offers Feed</h3>
        <div className="flex flex-col gap-4">
          {offers.length === 0 && <div className="text-gray-400">No offers yet.</div>}
          {offers.filter(o => o.reveal).map((o, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-4 flex items-center gap-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl font-bold text-green-700">
                {o.user[0]}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-900">{o.user}</div>
                <div className="text-xs text-gray-700">{o.offer}</div>
                <div className="text-xs text-green-700 mt-1">Preset: {o.preset || "?"}, Offering: <span className="font-mono">{o.tokenAmount} / {o.cap}</span> tokens</div>
              </div>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700"
                onClick={() => handleOpenMsg(o._id || o.id)}
              >
                Message
              </button>
            </div>
          ))}
        </div>
      </div>
      {msgOfferId && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
    onClick={handleCloseMsgModal}
    aria-modal="true"
    role="dialog"
  >
    <div
      className="relative w-full max-w-2xl md:w-1/2 h-1/2 bg-white rounded-2xl shadow-2xl flex flex-col animate-fade-in-up overflow-hidden"
      style={{ minHeight: '350px' }}
      onClick={e => e.stopPropagation()}
    >
      <button
        className="absolute top-4 right-4 text-gray-400 text-3xl hover:text-gray-600 transition-colors"
        onClick={handleCloseMsgModal}
        aria-label="Close chat"
        type="button"
      >
        &times;
      </button>
      <h4 className="font-bold text-xl mb-2 text-blue-800 text-center pt-4 pb-2">Chat</h4>
      <div className="flex-1 px-4 pb-2 overflow-y-auto custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center pt-10">No messages yet.</div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex mb-3 ${m.from === username ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-2xl px-4 py-2 max-w-[70%] text-sm shadow-md break-words ${
                m.from === username
                  ? 'bg-blue-100 text-blue-900 self-end animate-bounce-in-right'
                  : 'bg-gray-100 text-gray-800 self-start animate-bounce-in-left'
              }`}
            >
              <span className="block font-semibold text-xs mb-1 opacity-60">
                {m.from === username ? 'You' : m.from}
              </span>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSendMsg}
        className="flex items-center gap-2 px-4 py-3 border-t bg-white"
        autoComplete="off"
      >
        <input
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300 transition-all"
          value={msgText}
          onChange={e => setMsgText(e.target.value)}
          placeholder="Type your message..."
          autoFocus
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow transition-all disabled:opacity-50"
          type="submit"
          disabled={!msgText.trim()}
        >
          Send
        </button>
      </form>
    </div>
    {/* Animations */}
    <style>{`
      @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(60px) scale(0.98); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      }
      @keyframes bounce-in-right {
        0% { opacity: 0; transform: translateX(40px) scale(0.96); }
        100% { opacity: 1; transform: translateX(0) scale(1); }
      }
      .animate-bounce-in-right {
        animation: bounce-in-right 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      }
      @keyframes bounce-in-left {
        0% { opacity: 0; transform: translateX(-40px) scale(0.96); }
        100% { opacity: 1; transform: translateX(0) scale(1); }
      }
      .animate-bounce-in-left {
        animation: bounce-in-left 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 6px;
      }
    `}</style>
  </div>
)}
    </div>
  );
}
