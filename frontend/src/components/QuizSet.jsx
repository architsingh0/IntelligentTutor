import React, { useState } from "react";
import { FaExpand, FaTimes } from "react-icons/fa";
import "../styles/QuizSet.css";

function QuizSet({ questions }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!questions || !questions.length) {
    return <p>No quiz questions to display.</p>;
  }

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const handleSelect = (qIndex, answer, correctAnswer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: {
        answer,
        correct: answer === correctAnswer
      }
    }));
  };

  return (
    <div className={`quiz-set ${isFullScreen ? "fullscreen-mode" : ""}`}>
      {/* If in fullscreen, show the X in the modal's top-right corner */}
      {isFullScreen && (
        <div className="quiz-modal-backdrop">
          <div className="quiz-inner-wrapper">
            <button className="quiz-close-btn" onClick={toggleFullScreen}>
              <FaTimes size={24} />
            </button>

            <h3>Quiz</h3>
            {questions.map((q, index) => {
              const userSelection = selectedAnswers[index];
              const isCorrect = userSelection?.correct;
              return (
                <div key={index} className="quiz-question-block">
                  <p className="quiz-question-text">{q.question}</p>
                  <ul>
                    {[q.correct_answer, ...q.wrong_answers]
                      .sort()
                      .map((option, i) => {
                        const isSelected = userSelection?.answer === option;
                        let optionClass = "";
                        if (isSelected) {
                          optionClass = isCorrect ? "correct" : "wrong";
                        }
                        return (
                          <li
                            key={i}
                            className={`quiz-option ${optionClass}`}
                            onClick={() =>
                              handleSelect(index, option, q.correct_answer)
                            }
                          >
                            {option}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If not in fullscreen, show the normal inline quiz plus expand button */}
      {!isFullScreen && (
        <>
          <button className="quiz-fullscreen-toggle-btn" onClick={toggleFullScreen}>
            <FaExpand size={16} />
          </button>
          <h3>Quiz</h3>
          {questions.map((q, index) => {
            const userSelection = selectedAnswers[index];
            const isCorrect = userSelection?.correct;
            return (
              <div key={index} className="quiz-question-block">
                <p className="quiz-question-text">{q.question}</p>
                <ul>
                  {[q.correct_answer, ...q.wrong_answers].sort().map((option, i) => {
                    const isSelected = userSelection?.answer === option;
                    let optionClass = "";
                    if (isSelected) {
                      optionClass = isCorrect ? "correct" : "wrong";
                    }
                    return (
                      <li
                        key={i}
                        className={`quiz-option ${optionClass}`}
                        onClick={() =>
                          handleSelect(index, option, q.correct_answer)
                        }
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default QuizSet;
