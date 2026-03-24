"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCourse, slugify } from "@/lib/course";
import { getOverallProgress } from "@/lib/progress";
import CourseSwitcher from "@/components/CourseSwitcher";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="bg-header-bg border-b border-border sticky top-0 z-50">
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex items-center h-[52px] gap-4">
            <span className="font-semibold text-[15px] text-foreground tracking-tight">
              {course.title}
            </span>
            <CourseSwitcher />
            <nav className="flex items-center h-full ml-auto">
              <span className="nav-tab-active flex items-center h-full px-4 text-[14px] font-medium text-tab-active cursor-default">
                Classroom
              </span>
              <span className="flex items-center h-full px-4 text-[14px] font-medium text-tab-inactive cursor-default">
                Community
              </span>
              <span className="flex items-center h-full px-4 text-[14px] font-medium text-tab-inactive cursor-default">
                Calendar
              </span>
              <span className="flex items-center h-full px-4 text-[14px] font-medium text-tab-inactive cursor-default">
                Members
              </span>
              <span className="flex items-center h-full px-4 text-[14px] font-medium text-tab-inactive cursor-default">
                Leaderboards
              </span>
              <span className="flex items-center h-full px-4 text-[14px] font-medium text-tab-inactive cursor-default">
                About
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* Program card grid */}
      <main className="max-w-[960px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {course.programs.map((program) => {
            const progress = progresses[program.id] || { completed: 0, total: 0, percentage: 0 };
            const programSlug = slugify(program.title);

            return (
              <Link
                key={program.id}
                href={`/${programSlug}`}
                className="bg-card-bg rounded-xl border border-border-card overflow-hidden card-hover block"
              >
                {/* Cover image — 16:9 */}
                <div className="aspect-[16/9] bg-[#e5e5e5] relative overflow-hidden">
                  {program.coverImage ? (
                    <img
                      src={`/${program.coverImage}`}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#e5e5e5] flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#c4c4c4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="px-4 pt-3 pb-4">
                  <h3 className="font-bold text-foreground text-[15px] leading-snug mb-0.5">
                    {program.title}
                  </h3>
                  {program.description && (
                    <p className="text-[13px] text-muted line-clamp-2 leading-[1.4] mb-3">
                      {program.description}
                    </p>
                  )}
                  {!program.description && <div className="mb-3" />}

                  {/* Progress pill */}
                  <div className="progress-pill">
                    <div
                      className="progress-pill-fill"
                      style={{ width: `${Math.max(progress.percentage, progress.percentage > 0 ? 12 : 0)}%` }}
                    />
                    <div className="progress-pill-text">
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
