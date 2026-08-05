"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { findLesson, getAdjacentLessons, getVideoSource, getCourse } from "@/lib/course";
import RichDoc from "@/components/RichDoc";
import Sidebar from "@/components/Sidebar";
import VideoPlayer from "@/components/VideoPlayer";
import Transcript from "@/components/Transcript";
import ProgressTracker from "@/components/ProgressTracker";
import Link from "next/link";
import CourseSwitcher from "@/components/CourseSwitcher";
import SearchBar from "@/components/SearchBar";
import CommunityLink from "@/components/CommunityLink";

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
  const video = getVideoSource(lesson.id);

  const handleVideoEnded = useCallback(() => {
    if (next) {
      setTimeout(() => {
        router.push(`/${programSlug}/${next.slug}`);
      }, 1500);
    }
  }, [next, programSlug, router]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header — single row: course name + switcher + search */}
      <header className="bg-header-bg border-b border-border sticky top-0 z-50">
        <div className="px-6 lg:pl-[312px]">
          <div className="flex items-center h-[52px] gap-3 pl-10 lg:pl-0">
            <Link href="/" className="font-bold text-[17px] text-foreground hover:opacity-70 transition-opacity">
              {course.title}
            </Link>
            <CourseSwitcher />
            <CommunityLink />
            <div className="ml-auto">
              <SearchBar />
            </div>
          </div>
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

            {/* Video player — show when video-map has an entry */}
            {video && (
              <VideoPlayer
                src={video.url}
                kind={video.type}
                lessonId={lesson.id}
                poster={
                  lesson.thumbnail
                    ? lesson.thumbnail.startsWith("http")
                      ? lesson.thumbnail
                      : `/${lesson.thumbnail}`
                    : undefined
                }
                onEnded={handleVideoEnded}
              />
            )}

            {/* Locked programs show titles only — same as Skool */}
            {!video && lesson.locked && (
              <div className="w-full aspect-video bg-[#111] rounded-xl flex flex-col items-center justify-center gap-2 text-white/70">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-[14px] font-medium">Locked on Skool — not included in this membership</p>
              </div>
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

            {/* Description — rich text when Skool stored formatting, plain otherwise */}
            {(lesson.descriptionDoc?.length || lesson.description) && (
              <div className="mt-6 pt-6 border-t border-border lesson-description">
                {lesson.descriptionDoc?.length ? (
                  <RichDoc doc={lesson.descriptionDoc} />
                ) : (
                  <p className="text-[14px] text-foreground leading-[1.7] whitespace-pre-wrap">
                    {lesson.description}
                  </p>
                )}
              </div>
            )}

            {/* Lesson attachments — Skool serves these through signed URLs we
                cannot mint, so the replica lists them without a download. */}
            {lesson.resources && lesson.resources.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h2 className="text-[14px] font-bold text-foreground mb-2">Attachments</h2>
                <ul className="space-y-2">
                  {lesson.resources.map((r: any, i: number) => (
                    <li
                      key={r.file_id || i}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-border text-[14px]"
                    >
                      <svg className="w-5 h-5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span className="text-foreground">{r.title || r.file_name}</span>
                      <span className="text-muted text-[12px] ml-auto">{r.file_name}</span>
                    </li>
                  ))}
                </ul>
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
