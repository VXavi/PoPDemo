import React, { useState, useEffect } from "react";
import { getAllPresetsWithCap } from "./Presets";
import { getBarters, progressBarterDay, approveProgress } from "./BooksLogic";

function percent(val, cap) {
  return cap ? ((val / cap) * 100).toFixed(1) : "0.0";
}

function revenueShare(tokens, cap, grossRevenue) {
  // Estimate revenue share based on % of cap exchanged
  return cap ? ((tokens / cap) * grossRevenue).toFixed(2) : "0.00";
}

function expenseShare(tokens, cap, totalExpense) {
  // Estimate share of expenses based on % of cap exchanged
  return cap ? ((tokens / cap) * totalExpense).toFixed(2) : "0.00";
}

export default function Books({ username }) {
  const [barters, setBarters] = useState([]);
  const [presets, setPresets] = useState([]);
  const [progressing, setProgressing] = useState(null); // index of barter being progressed
  const [approval, setApproval] = useState(null); // index of barter waiting for approval

  useEffect(() => {
    setPresets(getAllPresetsWithCap());
    if (username) {
      (async () => {
        const barters = await getBarters(username);
        setBarters(Array.isArray(barters) ? barters : []);
      })();
    }
  }, [username]);

  const handleProgressDay = async (barterId) => {
    setProgressing(barterId);
    try {
      const { barter, note } = await progressBarterDay(username, barterId);
      const barters = await getBarters(username);
      setBarters(Array.isArray(barters) ? barters : []);
      alert(`Day progressed for this exchange. Outcome: ${note}`);
    } catch (e) {
      alert('Error progressing barter: ' + e.message);
    }
    setProgressing(null);
  };

  const handleApprove = async (barterId) => {
    try {
      await approveProgress(username, barterId);
      const barters = await getBarters(username);
      setBarters(Array.isArray(barters) ? barters : []);
    } catch (e) {
      alert('Error approving barter: ' + e.message);
    }
    setApproval(null);
  };


  // Use the user's selected preset for this session if available
  const selectedPresetName = localStorage.getItem("pop_demo_selected_preset");
  const yourPreset = presets.find(p => p.name === selectedPresetName) || presets.find(p => p.name === barters[0]?.yourPreset);
  const yourCap = yourPreset?.popTokenCap || 0;
  const yourGross = yourPreset?.grossMonthlyRevenue || 0;
  const yourExpense = yourPreset?.expenses || 0;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-extrabold mb-6 text-blue-900 flex items-center gap-2">
        <span role="img" aria-label="book">📚</span> Books: Token Exchange & Responsibility Ledger
      </h2>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 border-l-4 border-blue-600">
          <div className="font-semibold text-blue-700 mb-1">Your PoP Token Cap</div>
          <div className="text-4xl font-extrabold text-blue-900 mb-2">{yourCap} <span className="text-base font-bold text-blue-500">tokens</span></div>
          <div className="flex gap-4 mt-3">
            <div className="bg-blue-200 rounded px-3 py-1 text-blue-900 font-mono text-sm">Gross: {yourGross}</div>
            <div className="bg-blue-100 rounded px-3 py-1 text-blue-700 font-mono text-sm">Expenses: {yourExpense}</div>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-6 border-l-4 border-green-600 flex flex-col justify-center">
          <div className="font-semibold text-green-700 mb-1 flex items-center gap-2"><span role="img" aria-label="exchange">🔄</span> Exchange Summary</div>
          <div className="text-3xl font-extrabold text-green-900">{barters.length}</div>
          <div className="text-green-700 text-xs mt-1">Total Exchanges</div>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2"><span role="img" aria-label="ledger">📊</span> Your Exchanges</h3>
      <div className="flex flex-col gap-6">
        {barters.map((b, i) => {
          const otherPreset = presets.find(p => p.name === b.otherPreset);
          const otherCap = otherPreset?.popTokenCap || 0;
          const otherGross = otherPreset?.grossMonthlyRevenue || 0;
          const otherExpense = otherPreset?.expenses || 0;
          return (
            <div key={i} className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl font-bold text-blue-700">
                  {b.fromUser[0]}
                </div>
                <div className="text-gray-700 font-semibold">{b.fromUser} <span className="text-xs text-gray-400">({b.yourPreset})</span></div>
                <span className="mx-2 text-lg text-blue-500">→</span>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl font-bold text-green-700">
                  {b.toUser[0]}
                </div>
                <div className="text-gray-700 font-semibold">{b.toUser} <span className="text-xs text-gray-400">({b.otherPreset})</span></div>
                <div className="ml-auto text-xs text-gray-400">{b.date}</div>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 mb-3">
                <div className="flex flex-col items-center">
                  <span className="text-blue-700 font-bold text-lg">{b.yourTokensGiven}</span>
                  <span className="text-xs text-gray-500">Tokens You Gave</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">{percent(b.yourTokensGiven, yourCap)}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-green-700 font-bold text-lg">{b.otherTokensReceived}</span>
                  <span className="text-xs text-gray-500">Tokens You Got</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">{percent(b.otherTokensReceived, otherCap)}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-base text-blue-900">{revenueShare(b.yourTokensGiven, yourCap, yourGross)}</span>
                  <span className="text-xs text-gray-500">Your Revenue Share</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-base text-green-900">{revenueShare(b.otherTokensReceived, otherCap, otherGross)}</span>
                  <span className="text-xs text-gray-500">Their Revenue Share</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-base text-blue-700">{expenseShare(b.yourTokensGiven, yourCap, yourExpense)}</span>
                  <span className="text-xs text-gray-500">Your Expense Share</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-base text-green-700">{expenseShare(b.otherTokensReceived, otherCap, otherExpense)}</span>
                  <span className="text-xs text-gray-500">Their Expense Share</span>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <div className="bg-blue-50 px-2 py-1 rounded">Your Cap: <span className="font-mono text-blue-700">{yourCap}</span></div>
                <div className="bg-green-50 px-2 py-1 rounded">Their Cap: <span className="font-mono text-green-700">{otherCap}</span></div>
                <div className="bg-yellow-50 px-2 py-1 rounded">Est. Expense Pool: <span className="font-mono text-yellow-700">{b.expenseEstimate}</span></div>
              </div>
              {/* Progress Day Controls */}
              <div className="mt-4 flex items-center gap-4">
                {b.progressPending ? (
                  <>
                    <button className="bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed" disabled>
                      Progress Pending Approval
                    </button>
                    <span className="text-xs text-yellow-700">Both parties must approve to progress the day.</span>
                    {b.lastProgressNote && (
                      <span className="ml-4 text-xs text-gray-500">Last: {b.lastProgressNote}</span>
                    )}
                    {/* If current user is the approver, show approve button */}
                    {username && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded font-semibold ml-4" onClick={() => handleApprove(i)}>
                        Approve Progress
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
                    disabled={!username}
                    onClick={() => handleProgressDay(i)}
                  >
                    Progress Day
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400 mt-10">
        <div className="font-bold mb-1 flex items-center gap-2"><span role="img" aria-label="future">🧮</span> Future: Real Accounting API</div>
        <div className="text-xs text-yellow-900">When the Accounting API is available, this tab will fetch real-time token balances, exchange rates, and expense/revenue splits for all parties and tokens.</div>
      </div>
    </div>
  );
}
