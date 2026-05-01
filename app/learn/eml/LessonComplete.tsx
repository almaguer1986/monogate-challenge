"use client";

import { useEffect, useState } from "react";

const ACCENT_GREEN = "#4ADE80";
const MUTED = "#6a6e85";
const STORAGE_KEY = "monogate.learn.eml.completed";

// Toggleable "mark this lesson complete" pill rendered at the bottom
// of every <Lesson>. Persists via the same localStorage key the
// /learn hub reads to drive the EML progress bar.
export default function LessonComplete({ num }: { num: number }) {
  const [done, setDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.includes(num)) {
          setDone(true);
        }
      }
    } catch {
      // localStorage unavailable -- stay false.
    }
    setHydrated(true);
  }, [num]);

  function toggle() {
    let next: number[];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const set = new Set<number>(
        Array.isArray(current) ? current.filter((n) => typeof n === "number") : [],
      );
      if (set.has(num)) {
        set.delete(num);
        setDone(false);
      } else {
        set.add(num);
        setDone(true);
      }
      next = Array.from(set).sort((a, b) => a - b);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Silently fail if localStorage is blocked (private browsing, etc).
    }
  }

  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 16,
        borderTop: "1px dashed rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={done}
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          padding: "6px 14px",
          borderRadius: 4,
          border: `1px solid ${done ? ACCENT_GREEN : "rgba(255,255,255,0.15)"}`,
          background: done ? `${ACCENT_GREEN}15` : "transparent",
          color: done ? ACCENT_GREEN : MUTED,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        {hydrated && done ? "✓ Lesson complete" : `Mark Lesson ${num} complete`}
      </button>
    </div>
  );
}
