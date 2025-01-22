import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import "./styles/main.css";

function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Fetch the list of chats for the sidebar
  const fetchChats = async () => {
    try {
      const res = await axios.get("https://intelligenttutor.onrender.com/api/chats");
      setChats(res.data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleCreateChat = async () => {
    try {
      const res = await axios.post("https://intelligenttutor.onrender.com/api/chats", {
        title: "Untitled Chat"
      });
      const newChat = res.data;
      setActiveChatId(newChat.id);
      fetchChats();
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  return (
    <div className="app-container">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleCreateChat}
      />
      {activeChatId ? (
        <ChatWindow chatId={activeChatId} />
      ) : (
        <div className="chat-window-placeholder">
          <p>Select or create a new chat</p>
        </div>
      )}
    </div>
  );
}

export default App;
