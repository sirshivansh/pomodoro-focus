import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";

interface FocusGoalProps {
  value: string;
  onChange: (v: string) => void;
}

export default function FocusGoal({ value, onChange }: FocusGoalProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onChange(draft.trim()); setEditing(false); };

  return (
    <div className="w-full">
      {editing ? (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none text-sm text-center"
            style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.95)", letterSpacing: "0.03em" }}
            placeholder="What are you concentrating on?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
            maxLength={80}
            data-testid="input-focus-goal"
          />
          <button onClick={commit} className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}>
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setDraft(value); setEditing(false); }} className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          data-testid="button-edit-focus-goal"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 group"
          style={{
            background: value ? "rgba(255,255,255,0.06)" : "transparent",
            border: value ? "1px solid rgba(255,255,255,0.12)" : "1px dashed rgba(255,255,255,0.2)",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              color: value ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
              letterSpacing: "0.03em",
            }}
          >
            {value || "What are you concentrating on?"}
          </span>
          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color: "rgba(255,255,255,0.6)" }} />
        </button>
      )}
    </div>
  );
}
