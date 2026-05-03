import { useState } from "react";
import { Pencil, X } from "lucide-react";

interface FocusGoalProps {
  value: string;
  onChange: (v: string) => void;
}

export default function FocusGoal({ value, onChange }: FocusGoalProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  return (
    <div className="w-full animate-fade-in-up delay-100">
      {editing ? (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-full"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none text-sm text-center"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 300,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.04em",
            }}
            placeholder="What are you concentrating on?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") { setDraft(value); setEditing(false); }
            }}
            maxLength={80}
            data-testid="input-focus-goal"
          />
          <button
            onClick={commit}
            className="w-6 h-6 flex items-center justify-center rounded-full transition-all"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => { setDraft(value); setEditing(false); }}
            className="w-6 h-6 flex items-center justify-center rounded-full"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          data-testid="button-edit-focus-goal"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 group"
          style={{
            background: value ? "rgba(255,255,255,0.04)" : "transparent",
            border: value ? "1px solid rgba(255,255,255,0.08)" : "1px dashed rgba(255,255,255,0.12)",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 300,
              fontSize: "13px",
              color: value ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
              letterSpacing: "0.04em",
            }}
          >
            {value || "What are you concentrating on?"}
          </span>
          <Pencil
            className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "rgba(255,255,255,0.35)" }}
          />
        </button>
      )}
    </div>
  );
}
