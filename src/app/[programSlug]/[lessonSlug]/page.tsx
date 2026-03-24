"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { findLesson, getAdjacentLessons, getVideoUrl, slugify, getCourse } from "@/lib/course";
import Sidebar from "@/components/Sidebar";
import VideoPlayer from "@/components/VideoPlayer";
import Transcript from "@/components/Transcript";
import ProgressTracker from "@/components/ProgressTracker";
import Link from "next/link";
import CourseSwitcher from "@/components/CourseSwitcher";

export default function LessonPage({
  params,
}: {
  params: Promise<{ programSlug: string; lessonSlug: string }>;
}) {
  const { programSlug, lessonSlug } = use(params);
  const router = useRouter();
  const course = getCourse();
  const result = findLesson(programSlug, lessonSlug);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2 text-foreground">Lesson not found</h1>
          <Link href="/" className="text-[14px] text-accent hover:underline">Back to classroom</Link>
        </div>
      </div>
    );
  }

  const { program, section, lesson, flatIndex, allLessons } = result;
  const { prev, next } = getAdjacentLessons(programSlug, allLessons, flatIndex);
  const videoUrl = getVideoUrl(lesson.id);

  const handleVideoEnded = useCallback(() => {
    if (next) {
      setTimeout(() => {
        router.push(`/${programSlug}/${next.slug}`);
      }, 1500);
    }
  }, [next, programSlug, router]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header — same two-row Skool header as classroom */}
      <header className="bg-header-bg border-b border-border sticky top-0 z-50">
        <div className="px-6 lg:pl-[312px]">
          {/* Row 1: Group name */}
          <div className="flex items-center h-[52px] gap-3 pl-10 lg:pl-0">
            <Link href="/" className="font-bold text-[17px] text-foreground hover:opacity-70 transition-opacity">
              {course.title}
            </Link>
            <CourseSwitcher />
          </div>
          {/* Row 2: Nav tabs */}
          <nav className="flex items-center gap-1 -mb-px pl-10 lg:pl-0">
            <Link href="/" className="flex items-center px-3 pb-3 text-[14px] font-medium text-tab-inactive hover:text-foreground transition-colors">
              Community
            </Link>
            <span className="nav-tab-active flex items-center px-3 pb-3 text-[14px] font-medium cursor-default">
              Classroom
            </span>
            <span className="flex items-center px-3 pb-3 text-[14px] font-medium text-tab-inactive cursor-default">
              Calendar
            </span>
            <span className="flex items-center px-3 pb-3 text-[14px] font-medium text-tab-inactive cursor-default">
              Members
            </span>
            <span className="flex items-center px-3 pb-3 text-[14px] font-medium text-tab-inactive cursor-default">
              Map
            </span>
            <span className="flex items-center px-3 pb-3 text-[14px] font-medium text-tab-inactive cursor-default">
              Leaderboards
            </span>
            <span className="flex items-center px-3 pb-3 text-[14px] font-medium text-tab-inactive cursor-default">
              About
            </span>
          </nav>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          program={program}
          programSlug={programSlug}
          currentLessonSlug={lessonSlug}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[800px] mx-auto px-6 py-6">
            {/* Lesson title */}
            <h1 className="text-[22px] font-bold text-foreground mb-5 leading-tight">{lesson.title}</h1>

            {/* Video player */}
            {lesson.hasVideo && (
              <VideoPlayer
                src={videoUrl}
                lessonId={lesson.id}
                poster={lesson.thumbnail ? `/${lesson.thumbnail}` : undefined}
                onEnded={handleVideoEnded}
              />
            )}

            {/* Actions bar — completion + navigation */}
            <div className="flex items-center justify-between mt-5 py-2">
              <ProgressTracker lessonId={lesson.id} nextHref={next ? `/${programSlug}/${next.slug}` : undefined} />

              <div className="flex items-center gap-2">
                {prev && (
                  <Link
                    href={`/${programSlug}/${prev.slug}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface-hover"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Link>
                )}
                {next && (
                  <Link
                    href={`/${programSlug}/${next.slug}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-full transition-colors"
                  >
                    Next Lesson
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* Description — plain text, no card wrapper (Skool style) */}
            {lesson.description && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-[14px] text-foreground leading-[1.7] whitespace-pre-wrap lesson-description">
                  {lesson.description}
                </p>
              </div>
            )}

            {/* Transcript */}
            <Transcript text={lesson.transcript} />
          </div>
        </main>
      </div>
    </div>
  );
}
