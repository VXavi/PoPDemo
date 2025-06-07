
import logo from './logo.svg';
import './App.css';

import React, { useState } from "react";
import { QRCodeSVG } from 'qrcode.react';
import Marketplace from "./Marketplace";
import PRESETS, { getPresetWithCap, getAllPresetsWithCap } from "./Presets";
import Books from "./Books";
import Contacts from "./Contacts";


function App() {
  const [username, setUsername] = useState("");
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(true);

  // On mount, restore username from localStorage if present
  React.useEffect(() => {
    const saved = localStorage.getItem("pop_demo_username");
    if (saved) {
      setUsername(saved);
      setShowUsernamePrompt(false);
    }
  }, []);

  const [showPresetSelect, setShowPresetSelect] = useState(false);
  const [selectedPresetName, setSelectedPresetName] = useState("");
  const [tab, setTab] = useState("minting");
  const [popCap, setPopCap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // On mount, check if Finverse callback (code in URL), fetch PoP cap if so
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setLoading(true);
      fetch(`/api/minting/finverse/callback?code=${code}`)
        .then(r => r.json())
        .then(data => {
          if (data.popTokenCap !== undefined) {
            setPopCap(data.popTokenCap);
            setError("");
          } else {
            setError("Could not calculate PoP cap. Try again.");
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Error fetching PoP cap.");
          setLoading(false);
        });
      // Remove ?code=... from URL for cleaner UX
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Placeholder handlers for demo
  const [finverseUrl, setFinverseUrl] = useState("");
  const [showQR, setShowQR] = useState(false);

  // Save username to localStorage when set
  React.useEffect(() => {
    if (username && !showUsernamePrompt) {
      localStorage.setItem("pop_demo_username", username);
    }
  }, [username, showUsernamePrompt]);


  const handleFinverseConnect = async (qr = false) => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/minting/finverse/auth-url");
      const data = await resp.json();
      setFinverseUrl(data.url);
      if (qr) {
        setShowQR(true);
      } else {
        window.location.href = data.url; // Redirect to OAuth
      }
    } catch (e) {
      setError("Failed to connect to Finverse.");
    }
    setLoading(false);
  };


  const handleBrankasConnect = () => {
    alert("Brankas Statement Connect coming soon (demo)");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      {/* New User button */}
      {!showUsernamePrompt && (
        <div className="w-full max-w-lg flex justify-end mb-2">
          <button
            className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={() => {
              localStorage.removeItem("pop_demo_username");
              setUsername("");
              setShowUsernamePrompt(true);
            }}
          >
            New User
          </button>
        </div>
      )}
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-lg mb-6">
        <div className="flex space-x-4 mb-6">
          <button
            className={`tab-btn${tab === "minting" ? " active" : ""}`}
            onClick={() => setTab("minting")}
          >
            Minting
          </button>
          <button
            className={`tab-btn${tab === "marketplace" ? " active" : ""}`}
            onClick={() => setTab("marketplace")}
          >
            Marketplace
          </button>
          <button
            className={`tab-btn${tab === "books" ? " active" : ""}`}
            onClick={() => setTab("books")}
          >
            Books
          </button>
          <button
            className={`tab-btn${tab === "contacts" ? " active" : ""}`}
            onClick={() => setTab("contacts")}
          >
            Contacts
          </button>
        </div>
        {tab === "minting" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mint your PoP Tokens</h2>
            <div className="flex flex-col space-y-3 mb-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleFinverseConnect(false)}
                disabled={loading}
              >
                Connect with Finverse (Desktop)
              </button>
              <button
                className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleFinverseConnect(true)}
                disabled={loading}
              >
                Show QR for Mobile
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleBrankasConnect}
                disabled={loading}
              >
                Connect with Brankas
              </button>
              <button
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowPresetSelect(true)}
                disabled={loading}
              >
                Use a Demo Preset
              </button>
              {showQR && finverseUrl && (
                <div className="flex flex-col items-center mt-4">
                  <div className="mb-2 font-semibold text-blue-700">Scan to Connect (Finverse)</div>
                  <QRCodeSVG value={finverseUrl} size={180} />
                  <a className="mt-2 text-xs text-blue-600 underline" href={finverseUrl} target="_blank" rel="noopener noreferrer">Open in new tab</a>
                  <button className="mt-2 text-xs text-gray-500 underline" onClick={() => setShowQR(false)}>Hide QR</button>
                </div>
              )}
            </div>
            {showPresetSelect && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-xl w-full max-w-md">
                  <h3 className="font-semibold text-lg mb-2">Select a Demo Business Preset</h3>
                  <select
                    className="border px-2 py-1 rounded w-full mb-4"
                    value={selectedPresetName}
                    onChange={e => setSelectedPresetName(e.target.value)}
                  >
                    <option value="">-- Select a preset --</option>
                    {PRESETS.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <button
                      className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={!selectedPresetName}
                      onClick={() => {
                        setShowPresetSelect(false);
                        setPopCap(getPresetWithCap(PRESETS.find(p => p.name === selectedPresetName)).popTokenCap);
                        localStorage.setItem("pop_demo_selected_preset", selectedPresetName);
                        setSelectedPresetName("");
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                      onClick={() => setShowPresetSelect(false)}
                    >
                      Cancel
                    </button>
                  </div>
                  {selectedPresetName && (
                    <div className="mt-4 p-2 bg-gray-50 border rounded">
                      <div className="font-bold">{PRESETS.find(p => p.name === selectedPresetName).name}</div>
                      <div>Type: {PRESETS.find(p => p.name === selectedPresetName).businessType}</div>
                      <div>Location: {PRESETS.find(p => p.name === selectedPresetName).location}</div>
                      <div>Net Value: {PRESETS.find(p => p.name === selectedPresetName).currency} {PRESETS.find(p => p.name === selectedPresetName).netValue}</div>
                      <div>Modifier: {PRESETS.find(p => p.name === selectedPresetName).popModifier}</div>
                      <div className="italic text-xs mt-2">{PRESETS.find(p => p.name === selectedPresetName).narrative}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {loading && <div className="text-blue-600">Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {popCap && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="text-lg font-bold text-blue-700">Your PoP Token Cap:</div>
                <div className="text-2xl font-extrabold">{popCap} PoP tokens</div>
              </div>
            )}
          </div>
        )}
        {tab === "marketplace" && <Marketplace username={username} />}
        {tab === "books" && <Books username={username} />}
        {tab === "contacts" && <Contacts username={username} />}
      </div>
      {showUsernamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Enter your username for this session</h2>
            <input
              type="text"
              className="border p-2 rounded mb-4 text-lg"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
            />
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold"
              disabled={!username.trim()}
              onClick={() => setShowUsernamePrompt(false)}
            >
              Start
            </button>
          </div>
        </div>
      )}
      <div className="text-xs text-gray-400">PoP Demo &mdash; No data stored</div>
    </div>
  );
}


export default App;
