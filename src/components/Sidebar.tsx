"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { slugify, type Program } from "@/lib/course";
import { isLessonComplete, getModuleProgress } from "@/lib/progress";

interface SidebarProps {
  program: Program;
  programSlug: string;
  currentLessonSlug?: string;
}

function SidebarContent({
  program,
  programSlug,
  currentLessonSlug,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Expand section containing current lesson on mount
  useEffect(() => {
    if (currentLessonSlug) {
      for (const section of program.sections) {
        const found = section.lessons.find((l) => slugify(l.title) === currentLessonSlug);
        if (found) {
          setExpandedSections(new Set([section.id]));
          break;
        }
      }
    }
  }, [currentLessonSlug, program]);

  // Track completion state
  useEffect(() => {
    const update = () => {
      const completed = new Set<string>();
      for (const sec of program.sections) {
        for (const lesson of sec.lessons) {
          if (isLessonComplete(lesson.id)) completed.add(lesson.id);
        }
      }
      setCompletedLessons(completed);
    };
    update();
    window.addEventListener("progress-updated", update);
    return () => window.removeEventListener("progress-updated", update);
  }, [program]);

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Scroll active lesson into view
  useEffect(() => {
    const el = document.querySelector("[data-active-lesson]");
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentLessonSlug]);

  return (
    <>
      {/* Back to program link */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Link
          href={`/${programSlug}`}
          onClick={onNavigate}
          className="flex items-center gap-2 text-[13px] font-semibold text-foreground hover:opacity-70 transition-opacity"
        >
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {program.title}
        </Link>
      </div>

      {/* Section accordion */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {program.sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const lessonIds = section.lessons.map((l) => l.id);
          const progress = getModuleProgress(lessonIds);

          return (
            <div key={section.id}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-surface-hover transition-colors text-left group"
              >
                <svg
                  className={`w-3 h-3 text-muted transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="flex-1 text-[13px] font-semibold text-foreground truncate">
                  {section.title}
                </span>
                <span className="text-[11px] text-muted font-medium tabular-nums">
                  {progress.completed}/{progress.total}
                </span>
              </button>

              {/* Lesson list — slides open */}
              {isExpanded && (
                <div className="pb-1">
                  {section.lessons.map((lesson) => {
                    const lessonSlug = slugify(lesson.title);
                    const isActive = currentLessonSlug === lessonSlug;
                    const isComplete = completedLessons.has(lesson.id);

                    return (
                      <Link
                        key={lesson.id}
                        href={`/${programSlug}/${lessonSlug}`}
                        onClick={onNavigate}
                        data-active-lesson={isActive ? "true" : undefined}
                        className={`flex items-center gap-2.5 pl-9 pr-3 py-2 text-[13px] transition-colors ${
                          isActive
                            ? "bg-sidebar-active text-foreground font-medium"
                            : "text-muted hover:text-foreground hover:bg-surface-hover"
                        }`}
                      >
                        {/* Completion circle */}
                        {isComplete ? (
                          <svg className="w-[18px] h-[18px] text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className={`w-[18px] h-[18px] flex-shrink-0 rounded-full border-2 ${
                            isActive ? "border-accent" : "border-[#d4d4d4]"
                          }`} />
                        )}
                        <span className="flex-1 truncate leading-tight">{lesson.title}</span>
                        {lesson.duration && (
                          <span className="text-[11px] text-muted-light flex-shrink-0 tabular-nums">{lesson.duration}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default function Sidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [props.currentLessonSlug]);

  return (
    <>
      {/* Hamburger button — visible below lg */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-[10px] left-3 z-50 p-2 rounded-lg bg-header-bg border border-border hover:bg-surface-hover transition-colors"
        aria-label="Open sidebar"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar — hidden below lg */}
      <aside className="hidden lg:flex w-[280px] min-w-[280px] bg-sidebar-bg border-r border-border h-screen overflow-y-auto flex-col">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 sidebar-overlay"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar panel */}
          <aside className="relative w-[280px] max-w-[80vw] bg-sidebar-bg h-full overflow-y-auto flex flex-col sidebar-slide shadow-xl">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-surface-hover transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent {...props} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
