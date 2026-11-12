import { useMemo, useState } from "react";
import Icon from "./Icon";

const LETTERS = ["A", "B", "C", "D"];

export default function QuizPlayer({ questions, onRegenerate, onSaveMissed, regenerating }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState({}); // questionIndex -> letter
  const finished = index >= questions.length;

  const score = useMemo(
    () => questions.reduce((n, q, i) => n + (picked[i] === q.answer ? 1 : 0), 0),
    [questions, picked]
  );
  const missed = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => picked[i] && picked[i] !== q.answer);

  const restart = () => {
    setPicked({});
    setIndex(0);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz">
        <div className="quiz-result">
          <h3>
            You got {score} of {questions.length}
          </h3>
          <p>
            {pct >= 80
              ? "Strong grasp of this one. A quick re-read of anything you missed and you're set."
              : pct >= 50
              ? "A solid start. Review the questions you missed below, then try again."
              : "This one's worth another pass. Skim the summary, then retake the quiz."}
          </p>
          <div className="quiz-actions">
            <button className="btn btn-primary" onClick={restart}>
              <Icon name="refresh" size={16} /> Retake quiz
            </button>
            <button className="btn btn-ghost" onClick={onRegenerate} disabled={regenerating}>
              {regenerating ? "Writing new questions…" : "New set of questions"}
            </button>
            {missed.length > 0 && (
              <button className="btn btn-ghost" onClick={() => onSaveMissed(missed.map((m) => m.q))}>
                <Icon name="note" size={16} /> Save missed questions as a note
              </button>
            )}
          </div>
        </div>

        {missed.length > 0 && (
          <div className="quiz-review">
            <h4>To review</h4>
            {missed.map(({ q, i }) => (
              <div key={i} className="quiz-review-item">
                <p className="quiz-q">{q.question}</p>
                <p className="quiz-wrong">
                  Your answer: {picked[i]}. {q.options[LETTERS.indexOf(picked[i])]}
                </p>
                <p className="quiz-right">
                  Correct: {q.answer}. {q.options[LETTERS.indexOf(q.answer)]}
                </p>
                {q.explanation && <p className="quiz-why">{q.explanation}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const q = questions[index];
  const choice = picked[index];

  return (
    <div className="quiz">
      <div className="quiz-progress" aria-label={`Question ${index + 1} of ${questions.length}`}>
        <div className="quiz-bar">
          <span style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
        <small>
          Question {index + 1} of {questions.length}
        </small>
      </div>

      <h3 className="quiz-q">{q.question}</h3>

      <div className="quiz-options" role="group" aria-label="Answer choices">
        {q.options.map((text, i) => {
          const letter = LETTERS[i];
          let state = "";
          if (choice) {
            if (letter === q.answer) state = "correct";
            else if (letter === choice) state = "wrong";
            else state = "dim";
          }
          return (
            <button
              key={letter}
              className={`quiz-option ${state}`}
              disabled={!!choice}
              onClick={() => setPicked((p) => ({ ...p, [index]: letter }))}
            >
              <span className="quiz-letter">{letter}</span>
              <span>{text}</span>
              {state === "correct" && <Icon name="check" size={18} className="quiz-mark" />}
              {state === "wrong" && <Icon name="x" size={18} className="quiz-mark" />}
            </button>
          );
        })}
      </div>

      {choice && (
        <div className="quiz-feedback" role="status">
          <strong>{choice === q.answer ? "Correct." : `Not quite. The answer is ${q.answer}.`}</strong>
          {q.explanation && <p>{q.explanation}</p>}
          <button className="btn btn-primary" onClick={() => setIndex(index + 1)} autoFocus>
            {index + 1 === questions.length ? "See results" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}
