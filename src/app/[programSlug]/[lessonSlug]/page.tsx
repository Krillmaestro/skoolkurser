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
          <Link href="/" className="text-[13px] text-accent hover:underline">Back to classroom</Link>
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        program={program}
        programSlug={programSlug}
        currentLessonSlug={lessonSlug}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Top breadcrumb bar */}
        <header className="bg-header-bg border-b border-border sticky top-0 z-40">
          <div className="flex items-center h-[48px] px-6 lg:pl-6 pl-14 gap-2">
            <Link href="/" className="text-[13px] font-semibold text-foreground hover:opacity-70 transition-opacity">
              {course.title}
            </Link>
            <CourseSwitcher />
            <svg className="w-3 h-3 text-muted-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/${programSlug}`} className="text-[13px] text-muted hover:text-foreground transition-colors">
              {program.title}
            </Link>
            <svg className="w-3 h-3 text-muted-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[13px] text-muted truncate">{section.title}</span>
          </div>
        </header>

        <div className="max-w-[800px] mx-auto px-6 py-6">
          {/* Lesson title */}
          <h1 className="text-[22px] font-bold text-foreground mb-4 leading-tight">{lesson.title}</h1>

          {/* Video player */}
          {lesson.hasVideo && (
            <VideoPlayer
              src={videoUrl}
              lessonId={lesson.id}
              poster={lesson.thumbnail ? `/${lesson.thumbnail}` : undefined}
              onEnded={handleVideoEnded}
            />
          )}

          {/* Actions bar — completion toggle + navigation */}
          <div className="flex items-center justify-between mt-4 py-2">
            <ProgressTracker lessonId={lesson.id} />

            <div className="flex items-center gap-2">
              {prev && (
                <Link
                  href={`/${programSlug}/${prev.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface-hover"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Link>
              )}
              {next && (
                <Link
                  href={`/${programSlug}/${next.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors"
                >
                  Next Lesson
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          {lesson.description && (
            <div className="mt-6">
              <div className="bg-card-bg border border-border-card rounded-xl p-5">
                <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap">
                  {lesson.description}
                </p>
              </div>
            </div>
          )}

          {/* Transcript */}
          <Transcript text={lesson.transcript} />
        </div>
      </main>
    </div>
  );
}
