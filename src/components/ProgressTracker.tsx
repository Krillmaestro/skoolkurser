"use client";

import { useState, useCallback, useEffect } from "react";
import { isLessonComplete, toggleLessonComplete } from "@/lib/progress";

interface ProgressTrackerProps {
  lessonId: string;
}

export default function ProgressTracker({ lessonId }: ProgressTrackerProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isLessonComplete(lessonId));
  }, [lessonId]);

  useEffect(() => {
    const handler = () => setCompleted(isLessonComplete(lessonId));
    window.addEventListener("progress-updated", handler);
    return () => window.removeEventListener("progress-updated", handler);
  }, [lessonId]);

  const handleToggle = useCallback(() => {
    const newState = toggleLessonComplete(lessonId);
    setCompleted(newState);
    window.dispatchEvent(new Event("progress-updated"));
  }, [lessonId]);

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
        completed
          ? "bg-[#dcfce7] text-[#16a34a] hover:bg-[#bbf7d0]"
          : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground border border-border"
      }`}
    >
      {completed ? (
        <>
          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Completed
        </>
      ) : (
        <>
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>
          Mark Complete
        </>
      )}
    </button>
  );
}
