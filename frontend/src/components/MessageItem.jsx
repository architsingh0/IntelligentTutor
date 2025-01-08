import React from "react";
import FlashcardSet from "./FlashcardSet";
import QuizSet from "./QuizSet";

function MessageItem({ message }) {
  const { role, content, message_type } = message;

  if (message_type === "text") {
    return (
      <div className={`chat-message ${role}`}>
        <p>{content}</p>
      </div>
    );
  }

  let parsedData;
  try {
    parsedData = JSON.parse(content);
  } catch (err) {
    return (
      <div className={`chat-message ${role}`}>
        <p>Invalid JSON data. Unable to render {message_type}.</p>
        <pre>{content}</pre>
      </div>
    );
  }

  if (message_type === "flashcards") {
    return (
      <div className={`chat-message ${role}`}>
        <FlashcardSet cards={parsedData} />
      </div>
    );
  } else if (message_type === "quiz") {
    return (
      <div className={`chat-message ${role}`}>
        <QuizSet questions={parsedData} />
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`chat-message ${role}`}>
      <p>{content}</p>
    </div>
  );
}

export default MessageItem;
