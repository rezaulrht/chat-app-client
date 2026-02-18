// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState } from "react";
import Sidebar from "./SidebarChats";
import ChatWindow from "./ChatWindow";
import chatData from "../../../public/chatData.json";

export default function ChatDashboard() {
  const [activeChatId, setActiveChatId] = useState(chatData.chats[0].id);

  // Create a local state for all messages so we can add new ones
  const [allMessages, setAllMessages] = useState(chatData.messages);

  const activeChat = chatData.chats.find((c) => c.id === activeChatId);
  const messages = allMessages[activeChatId] || [];

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now(), // Unique ID based on time
      sender: "Me",
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
      status: "delivered",
    };

    // Update the message state for the specific chat ID
    setAllMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage],
    }));
  };

  return (
    <div className="flex h-screen w-full bg-[#05050A] overflow-hidden font-sans">
      <Sidebar
        chats={chatData.chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />
      <ChatWindow
        chat={activeChat}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
