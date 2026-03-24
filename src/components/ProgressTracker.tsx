"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLessonComplete, toggleLessonComplete, markLessonComplete } from "@/lib/progress";

interface ProgressTrackerProps {
  lessonId: string;
  nextHref?: string;
}

export default function ProgressTracker({ lessonId, nextHref }: ProgressTrackerProps) {
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

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

  // "Complete & Continue" — marks complete AND navigates to next
  const handleCompleteAndContinue = useCallback(() => {
    markLessonComplete(lessonId);
    setCompleted(true);
    window.dispatchEvent(new Event("progress-updated"));
    if (nextHref) {
      router.push(nextHref);
    }
  }, [lessonId, nextHref, router]);

  if (completed) {
    return (
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium bg-[#dcfce7] text-[#16a34a] hover:bg-[#bbf7d0] transition-colors"
      >
        <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Completed
      </button>
    );
  }

  // Not completed — show "Complete & Continue" if there's a next lesson
  if (nextHref) {
    return (
      <button
        onClick={handleCompleteAndContinue}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold bg-accent hover:bg-accent-hover text-white transition-colors"
      >
        Complete & Continue
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  // Last lesson — just "Mark Complete"
  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium bg-surface text-muted hover:bg-surface-hover hover:text-foreground border border-border transition-colors"
    >
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
      Mark Complete
    </button>
  );
}
