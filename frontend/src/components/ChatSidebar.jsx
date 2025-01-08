import React from "react";

function ChatSidebar({ chats, activeChatId, onSelectChat, onNewChat }) {
  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <button onClick={onNewChat}>+ New Chat</button>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={chat.id === activeChatId ? "active" : ""}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title ? chat.title : `Chat #${chat.id}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatSidebar;
