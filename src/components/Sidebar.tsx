"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { slugify, type Program } from "@/lib/course";
import { isLessonComplete, getModuleProgress, getOverallProgress } from "@/lib/progress";

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
  // All sections expanded by default
  const allSectionIds = useMemo(() => new Set(program.sections.map((s) => s.id)), [program]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(allSectionIds);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Track overall progress
  const allLessonIds = useMemo(
    () => program.sections.flatMap((s) => s.lessons.map((l) => l.id)),
    [program]
  );
  const [overallProgress, setOverallProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  useEffect(() => {
    const update = () => {
      const completed = new Set<string>();
      for (const sec of program.sections) {
        for (const lesson of sec.lessons) {
          if (isLessonComplete(lesson.id)) completed.add(lesson.id);
        }
      }
      setCompletedLessons(completed);
      setOverallProgress(getOverallProgress(allLessonIds));
    };
    update();
    window.addEventListener("progress-updated", update);
    return () => window.removeEventListener("progress-updated", update);
  }, [program, allLessonIds]);

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Scroll active lesson into view
  useEffect(() => {
    setTimeout(() => {
      const el = document.querySelector("[data-active-lesson]");
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 100);
  }, [currentLessonSlug]);

  return (
    <>
      {/* Program title + progress pill */}
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-[15px] font-bold text-foreground hover:opacity-70 transition-opacity leading-snug block"
        >
          {program.title}
        </Link>
        {/* Progress pill — same style as classroom cards */}
        <div className="progress-pill mt-3">
          <div
            className="progress-pill-fill"
            style={{ width: `${Math.max(overallProgress.percentage, overallProgress.percentage > 0 ? 15 : 0)}%` }}
          />
          <div className={`progress-pill-text ${overallProgress.percentage === 0 ? "progress-pill-text-zero" : ""}`}>
            {overallProgress.percentage}%
          </div>
        </div>
      </div>

      {/* Section accordion */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {program.sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const lessonIds = section.lessons.map((l) => l.id);
          const progress = getModuleProgress(lessonIds);
          const hasActiveLessonInSection = section.lessons.some(
            (l) => slugify(l.title) === currentLessonSlug
          );

          return (
            <div key={section.id}>
              {/* Section header — chevron on RIGHT */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-surface-hover transition-colors text-left ${
                  hasActiveLessonInSection && isExpanded ? "bg-[#fafafa]" : ""
                }`}
              >
                <span className="flex-1 text-[13px] font-semibold text-foreground truncate">
                  {section.title}
                </span>
                <span className="text-[11px] text-muted-light font-medium tabular-nums flex-shrink-0 mr-1">
                  {progress.completed}/{progress.total}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-muted-light transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Lesson list */}
              {isExpanded && (
                <div className="pb-1 sidebar-lessons-enter">
                  {section.lessons.map((lesson, idx) => {
                    const lessonSlug = slugify(lesson.title);
                    const isActive = currentLessonSlug === lessonSlug;
                    const isComplete = completedLessons.has(lesson.id);

                    return (
                      <Link
                        key={lesson.id}
                        href={`/${programSlug}/${lessonSlug}`}
                        onClick={onNavigate}
                        data-active-lesson={isActive ? "true" : undefined}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors ${
                          isActive
                            ? "bg-sidebar-active text-foreground font-medium"
                            : "text-muted hover:text-foreground hover:bg-surface-hover"
                        }`}
                      >
                        {/* Lesson number/emoji */}
                        <span className="w-5 text-center text-[12px] text-muted-light flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="flex-1 truncate leading-tight">{lesson.title}</span>
                        {/* Checkmark on the right for completed */}
                        {isComplete && (
                          <svg className="w-[16px] h-[16px] text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
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
        className="lg:hidden fixed top-[14px] left-3 z-50 p-2 rounded-lg bg-header-bg border border-border hover:bg-surface-hover transition-colors"
        aria-label="Open sidebar"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar — hidden below lg */}
      <aside className="hidden lg:flex w-[300px] min-w-[300px] bg-sidebar-bg border-r border-border h-screen overflow-y-auto flex-col">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 sidebar-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[300px] max-w-[80vw] bg-sidebar-bg h-full overflow-y-auto flex flex-col sidebar-slide shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-surface-hover transition-colors z-10"
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
