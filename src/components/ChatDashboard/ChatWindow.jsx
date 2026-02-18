// src/components/ChatDashboard/ChatWindow.jsx
"use client";
import React, { useState } from "react";
import { Phone, Video, Info, Plus, Smile, Send } from "lucide-react";

export default function ChatWindow({ chat, messages, onSendMessage }) {
  const [text, setText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSendMessage(text);
    setText(""); // Clear input after sending
  };

  if (!chat) return <div className="flex-1 bg-[#05050A]" />;

  return (
    <main className="flex-1 flex flex-col bg-[#0B0E11] relative h-full">
      <header className="h-20 border-b border-slate-800/50 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <img src={chat.avatar} className="w-10 h-10 rounded-xl" alt="" />
          <div>
            <h2 className="font-bold text-white text-sm">{chat.name}</h2>
            <p className="text-[10px] text-teal-500">{chat.online ? "Online" : "Offline"}</p>
          </div>
        </div>
        <div className="flex gap-4 text-slate-400">
          <Phone size={18} className="cursor-pointer hover:text-white" />
          <Video size={18} className="cursor-pointer hover:text-white" />
          <Info size={18} className="cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                msg.isMe
                  ? "bg-teal-900/20 text-white rounded-br-none border border-teal-500/20 shadow-lg shadow-teal-500/5"
                  : "bg-[#1C2227] text-slate-300 rounded-bl-none"
              }`}
            >
              {msg.text}
              <div className="text-[9px] mt-2 opacity-50 text-right">
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-6">
        <div className="bg-[#15191C] rounded-2xl flex items-center p-2.5 border border-slate-800 focus-within:border-teal-500/50 transition-all">
          <Plus
            size={20}
            className="text-slate-500 mx-2 cursor-pointer hover:text-teal-400"
          />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-200 px-2"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Smile
            size={20}
            className="text-slate-500 mx-2 cursor-pointer hover:text-teal-400"
          />
          <button
            type="submit"
            className="bg-teal-400 p-2.5 rounded-xl text-black ml-2 hover:bg-teal-300 transition-colors active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </main>
  );
}
