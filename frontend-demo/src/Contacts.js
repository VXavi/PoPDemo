import React, { useState, useEffect } from "react";

// Placeholder contacts and messages for initial UI
const mockContacts = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

const mockMessages = {
  1: [
    { from: "Alice", text: "Hi, are you interested in the barter?" },
    { from: "You", text: "Yes, let's discuss details!" }
  ],
  2: [
    { from: "Bob", text: "Offer still available?" }
  ],
  3: []
};

export default function Contacts({ username }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setContacts(mockContacts);
    if (mockContacts.length > 0) {
      setSelectedContactId(mockContacts[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedContactId) {
      setMessages(mockMessages[selectedContactId] || []);
    }
  }, [selectedContactId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: "You", text: input }]);
    setInput("");
    // TODO: Send message to backend
  };

  return (
    <div className="flex h-[80vh] w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Sidebar: Contacts */}
      <div className="w-1/3 bg-gray-100 border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-4 text-blue-800">Contacts</h2>
        <ul>
          {contacts.map(c => (
            <li
              key={c.id}
              className={`p-2 rounded-lg cursor-pointer mb-2 ${selectedContactId === c.id ? 'bg-blue-200 text-blue-900 font-semibold' : 'hover:bg-blue-50'}`}
              onClick={() => setSelectedContactId(c.id)}
            >
              {c.name}
            </li>
          ))}
        </ul>
      </div>
      {/* Main: Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-blue-50">
          <h3 className="font-semibold text-blue-800 text-xl">
            {contacts.find(c => c.id === selectedContactId)?.name || "Select a contact"}
          </h3>
        </div>
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center pt-10">No messages yet.</div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex mb-3 ${m.from === "You" ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-2xl px-4 py-2 max-w-[70%] text-sm shadow-md break-words ${
                  m.from === "You"
                    ? 'bg-blue-100 text-blue-900 self-end'
                    : 'bg-gray-100 text-gray-800 self-start'
                }`}
              >
                <span className="block font-semibold text-xs mb-1 opacity-60">
                  {m.from}
                </span>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSendMessage}
          className="flex p-4 border-t border-gray-200 bg-white"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-400 mr-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
