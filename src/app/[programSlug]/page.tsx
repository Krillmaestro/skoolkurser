"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { findProgram, slugify, getCourse } from "@/lib/course";
import { isLessonComplete, getModuleProgress, getOverallProgress } from "@/lib/progress";
import CourseSwitcher from "@/components/CourseSwitcher";

export default function ProgramPage({
  params,
}: {
  params: Promise<{ programSlug: string }>;
}) {
  const { programSlug } = use(params);
  const course = getCourse();
  const program = findProgram(programSlug);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const update = () => {
      if (!program) return;
      const completed = new Set<string>();
      for (const sec of program.sections) {
        for (const lesson of sec.lessons) {
          if (isLessonComplete(lesson.id)) completed.add(lesson.id);
        }
      }
      setCompletedSet(completed);
    };
    update();
    window.addEventListener("progress-updated", update);
    return () => window.removeEventListener("progress-updated", update);
  }, [program]);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2 text-foreground">Program not found</h1>
          <Link href="/" className="text-[13px] text-accent hover:underline">Back to classroom</Link>
        </div>
      </div>
    );
  }

  const allLessonIds = program.sections.flatMap((s) => s.lessons.map((l) => l.id));
  const overallProgress = getOverallProgress(allLessonIds);

  // Find first incomplete lesson, or first lesson
  let resumeLesson = program.sections[0]?.lessons[0];
  for (const sec of program.sections) {
    for (const lesson of sec.lessons) {
      if (!completedSet.has(lesson.id)) {
        resumeLesson = lesson;
        break;
      }
    }
    if (resumeLesson && !completedSet.has(resumeLesson.id)) break;
  }

  const resumeLink = resumeLesson ? `/${programSlug}/${slugify(resumeLesson.title)}` : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-header-bg border-b border-border sticky top-0 z-50">
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex items-center h-[52px] gap-4">
            <Link href="/" className="font-semibold text-[15px] text-foreground tracking-tight hover:opacity-80">
              {course.title}
            </Link>
            <CourseSwitcher />
            <nav className="flex items-center h-full ml-auto">
              <Link
                href="/"
                className="nav-tab-active flex items-center h-full px-3 text-[13px] font-medium text-tab-active"
              >
                Classroom
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 py-8">
        {/* Program header card */}
        <div className="bg-card-bg border border-border-card rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-[20px] font-bold text-foreground mb-1">{program.title}</h1>
              {program.description && (
                <p className="text-[14px] text-muted leading-relaxed mb-4">{program.description}</p>
              )}
              <div className="flex items-center gap-4">
                {resumeLink && (
                  <Link
                    href={resumeLink}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors"
                  >
                    {overallProgress.completed > 0 ? "Continue" : "Start Course"}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                <span className="text-[13px] text-muted">
                  {overallProgress.completed}/{overallProgress.total} completed
                </span>
              </div>
            </div>
            {/* Circular progress indicator */}
            <div className="flex-shrink-0">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e5e5" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none" stroke="#16a34a" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - overallProgress.percentage / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
                  {overallProgress.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections with lessons */}
        <div className="space-y-3">
          {program.sections.map((section) => {
            const sectionLessonIds = section.lessons.map((l) => l.id);
            const sectionProgress = getModuleProgress(sectionLessonIds);

            return (
              <div key={section.id} className="bg-card-bg border border-border-card rounded-xl overflow-hidden">
                {/* Section header */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-foreground">{section.title}</h2>
                    <p className="text-[12px] text-muted mt-0.5">
                      {section.lessons.length} lessons · {sectionProgress.completed} completed
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-progress-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-progress-fill rounded-full transition-all duration-500"
                        style={{ width: `${sectionProgress.percentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted font-medium min-w-[28px] text-right">
                      {sectionProgress.percentage}%
                    </span>
                  </div>
                </div>

                {/* Lesson list */}
                <div className="border-t border-border">
                  {section.lessons.map((lesson, idx) => {
                    const isComplete = completedSet.has(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        href={`/${programSlug}/${slugify(lesson.title)}`}
                        className={`lesson-item flex items-center gap-3 px-5 py-3 ${
                          idx < section.lessons.length - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        {/* Completion indicator */}
                        {isComplete ? (
                          <svg className="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-[#d4d4d4]" />
                        )}

                        {/* Video/doc icon */}
                        {lesson.hasVideo ? (
                          <svg className="w-4 h-4 text-muted-light flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-muted-light flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}

                        <span className="flex-1 text-[13px] text-foreground truncate">{lesson.title}</span>

                        {lesson.duration && (
                          <span className="text-[12px] text-muted flex-shrink-0">{lesson.duration}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
