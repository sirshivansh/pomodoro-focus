import { useState, useEffect } from "react";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus is the art of knowing what to ignore.", author: "James Clear" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "It's not about having time, it's about making time.", author: "Unknown" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "The successful warrior is the average person with laser-like focus.", author: "Bruce Lee" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
  { text: "Excellence is not a destination but a continuous journey.", author: "Brian Tracy" },
];

interface QuoteDisplayProps {
  running: boolean;
  sessionIndex?: number;
}

export default function QuoteDisplay({ running, sessionIndex = 0 }: QuoteDisplayProps) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 600);
    }, 30000);
    return () => clearInterval(id);
  }, [running]);

  // Pick a new quote when session starts
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setIdx(Math.floor(Math.random() * QUOTES.length));
      setVisible(true);
    }, 300);
    return () => clearTimeout(t);
  }, [sessionIndex]);

  const q = QUOTES[idx];

  return (
    <div
      className="text-center px-6 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)" }}
    >
      <p
        className="text-xs leading-relaxed"
        style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.38)", fontStyle: "italic" }}
      >
        "{q.text}"
      </p>
      <p
        className="text-xs mt-1.5 tracking-[0.1em]"
        style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.22)" }}
      >
        — {q.author}
      </p>
    </div>
  );
}
