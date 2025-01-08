import React, { useState, useEffect } from "react";
import { FaExpand, FaTimes } from "react-icons/fa";
import "../styles/FlashcardSet.css";

function FlashcardSet({ cards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [transitionStage, setTransitionStage] = useState("");
  const [pendingIndex, setPendingIndex] = useState(null);

  if (!cards || !cards.length) {
    return <p>No flashcards to display.</p>;
  }

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const toggleFullScreen = () => {
    setIsFlipped(false);
    setTransitionStage("");
    setIsFullScreen((prev) => !prev);
  };

  const handleNext = () => {
    if (transitionStage) return;
    setIsFlipped(false);
    setPendingIndex((currentIndex + 1) % cards.length);
    setTransitionStage("slide-out-left");
  };

  const handlePrev = () => {
    if (transitionStage) return;
    setIsFlipped(false);
    setPendingIndex(
      currentIndex - 1 < 0 ? cards.length - 1 : currentIndex - 1
    );
    setTransitionStage("slide-out-right");
  };

  useEffect(() => {
    if (transitionStage === "slide-out-left") {
      const timer = setTimeout(() => {
        setCurrentIndex(pendingIndex);
        setTransitionStage("slide-in-right");
      }, 300);
      return () => clearTimeout(timer);
    } else if (transitionStage === "slide-out-right") {
      const timer = setTimeout(() => {
        setCurrentIndex(pendingIndex);
        setTransitionStage("slide-in-left");
      }, 300);
      return () => clearTimeout(timer);
    } else if (
      transitionStage === "slide-in-left" ||
      transitionStage === "slide-in-right"
    ) {
      const timer = setTimeout(() => {
        setTransitionStage("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, pendingIndex, currentIndex]);

  return (
    <div className={`flashcard-set ${isFullScreen ? "fullscreen-mode" : ""}`}>
      {/* Close icon (top-right X) if we're in fullscreen */}
      {isFullScreen && (
        <div className="flashcard-fullscreen-close" onClick={toggleFullScreen}>
          <FaTimes size={24} />
        </div>
      )}

      <div
        className={`flashcard-container ${transitionStage} ${
          isFlipped ? "flipped" : ""
        }`}
      >
        <div className="flashcard" onClick={handleFlip}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <h3>{currentCard.term}</h3>
            </div>
            <div className="flashcard-back">
              <p>{currentCard.definition}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen expand button (only if not in fullscreen) */}
      {!isFullScreen && (
        <button className="fullscreen-toggle-btn" onClick={toggleFullScreen}>
          <FaExpand size={16} />
        </button>
      )}

      <div className="flashcard-controls">
        <button onClick={handlePrev}>&larr; Prev</button>
        <button onClick={handleFlip}>Flip</button>
        <button onClick={handleNext}>Next &rarr;</button>
      </div>

      <p className="flashcard-status">
        Card {currentIndex + 1} of {cards.length}
      </p>
    </div>
  );
}

export default FlashcardSet;
