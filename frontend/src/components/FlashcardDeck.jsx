import { useMemo, useState } from "react";
import Icon from "./Icon";

const shuffled = (list) => [...list].sort(() => Math.random() - 0.5);

export default function FlashcardDeck({ cards }) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(() => new Set());

  const card = deck[index];
  const remaining = useMemo(() => deck.filter((c) => !known.has(c.front)).length, [deck, known]);

  const go = (step) => {
    setFlipped(false);
    setIndex((i) => (i + step + deck.length) % deck.length);
  };
  const mark = (isKnown) => {
    setKnown((k) => {
      const next = new Set(k);
      if (isKnown) next.add(card.front);
      else next.delete(card.front);
      return next;
    });
    go(1);
  };
  const restart = () => {
    setKnown(new Set());
    setDeck(shuffled(cards));
    setIndex(0);
    setFlipped(false);
  };

  if (remaining === 0) {
    return (
      <div className="ai-start">
        <span className="empty-icon"><Icon name="check" size={26} /></span>
        <h3>You know all {deck.length} cards</h3>
        <p>Nice work. Shuffle the deck to go again, or take the quiz to test it properly.</p>
        <button className="btn btn-primary" onClick={restart}><Icon name="refresh" size={16} /> Shuffle and restart</button>
      </div>
    );
  }

  return (
    <div className="deck">
      <div className="quiz-progress">
        <div className="quiz-bar"><span style={{ width: `${(known.size / deck.length) * 100}%` }} /></div>
        <small>{known.size} of {deck.length} known</small>
      </div>

      <button
        className={`flashcard ${flipped ? "flipped" : ""} ${known.has(card.front) ? "is-known" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Showing the answer. Click to show the question" : "Showing the question. Click to reveal the answer"}
      >
        <small>{flipped ? "Answer" : `Card ${index + 1} of ${deck.length}`}</small>
        <strong>{flipped ? card.back : card.front}</strong>
        <span className="flashcard-hint">{flipped ? "Click to flip back" : "Click to flip"}</span>
      </button>

      <div className="deck-actions">
        <button className="btn btn-ghost" onClick={() => go(-1)} aria-label="Previous card"><Icon name="back" size={16} /></button>
        <button className="btn btn-ghost" onClick={() => mark(false)}>Still learning</button>
        <button className="btn btn-primary" onClick={() => mark(true)}><Icon name="check" size={16} /> I know this</button>
        <button className="btn btn-ghost" onClick={() => go(1)} aria-label="Next card"><Icon name="back" size={16} className="flip" /></button>
        <button className="icon-btn" onClick={restart} aria-label="Shuffle deck" title="Shuffle"><Icon name="refresh" size={16} /></button>
      </div>
    </div>
  );
}
