"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCourse, slugify } from "@/lib/course";
import { getOverallProgress } from "@/lib/progress";
import CourseSwitcher from "@/components/CourseSwitcher";
import SearchBar from "@/components/SearchBar";

export default function ClassroomPage() {
  const course = getCourse();
  const [progresses, setProgresses] = useState<Record<string, { completed: number; total: number; percentage: number }>>({});

  useEffect(() => {
    const update = () => {
      const pp: typeof progresses = {};
      for (const program of course.programs) {
        const allIds = program.sections.flatMap((s) => s.lessons.map((l) => l.id));
        pp[program.id] = getOverallProgress(allIds);
      }
      setProgresses(pp);
    };
    update();
    window.addEventListener("progress-updated", update);
    return () => window.removeEventListener("progress-updated", update);
  }, []);

  // Sort: programs with lessons first, empty (locked) at bottom
  const sortedPrograms = [...course.programs].sort((a, b) => {
    const aLessons = a.sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const bLessons = b.sections.reduce((acc, s) => acc + s.lessons.length, 0);
    if (aLessons === 0 && bLessons > 0) return 1;
    if (aLessons > 0 && bLessons === 0) return -1;
    return 0;
  });

  // Find first lesson slug for a program (for direct navigation)
  function getFirstLessonHref(programSlug: string, programId: string) {
    const program = course.programs.find((p) => p.id === programId);
    if (!program) return `/${programSlug}`;
    for (const sec of program.sections) {
      if (sec.lessons.length > 0) {
        return `/${programSlug}/${slugify(sec.lessons[0].title)}`;
      }
    }
    return `/${programSlug}`;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header — single row: course name + switcher + search */}
      <header className="bg-header-bg border-b border-border sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-center h-[52px] gap-3">
            <span className="font-bold text-[17px] text-foreground">
              {course.title}
            </span>
            <CourseSwitcher />
            <div className="ml-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </header>

      {/* Program card grid */}
      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedPrograms.map((program) => {
            const progress = progresses[program.id] || { completed: 0, total: 0, percentage: 0 };
            const programSlug = slugify(program.title);
            const totalLessons = program.sections.reduce((acc, s) => acc + s.lessons.length, 0);
            const isLocked = totalLessons === 0;
            const href = isLocked ? "#" : getFirstLessonHref(programSlug, program.id);

            return (
              <Link
                key={program.id}
                href={href}
                className={`bg-card-bg rounded-lg overflow-hidden card-hover block ${isLocked ? "cursor-not-allowed opacity-80" : ""}`}
              >
                {/* Cover image */}
                <div className="aspect-[16/9] bg-black relative overflow-hidden">
                  {program.coverImage ? (
                    <img
                      src={program.coverImage.startsWith("http") ? program.coverImage : `/${program.coverImage}`}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a]" />
                  )}
                  {/* Lock overlay for locked programs */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-white font-semibold text-[15px]">Locked</span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="px-4 pt-3 pb-4">
                  <h3 className="font-bold text-foreground text-[16px] leading-snug mb-1">
                    {program.title}
                  </h3>
                  {program.description && (
                    <p className="text-[14px] text-muted line-clamp-2 leading-[1.45] mb-3">
                      {program.description}
                    </p>
                  )}
                  {!program.description && <div className="mb-3" />}

                  {/* Progress pill — Skool style */}
                  <div className="progress-pill">
                    <div
                      className="progress-pill-fill"
                      style={{ width: `${Math.max(progress.percentage, progress.percentage > 0 ? 15 : 0)}%` }}
                    />
                    <div className={`progress-pill-text ${progress.percentage === 0 ? "progress-pill-text-zero" : ""}`}>
                      {progress.percentage}%
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
