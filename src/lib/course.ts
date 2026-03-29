import defaultCourseData from "@/data/course.json";
import defaultVideoMap from "@/data/video-map.json";

export interface Lesson {
  id: string;
  title: string;
  order: number;
  description: string;
  videoId: string;
  videoLenMs: number;
  videoFile: string;
  thumbnail: string;
  transcript: string;
  completed: boolean;
  // Computed helpers
  hasVideo?: boolean;
  duration?: string;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  order: number;
  sections: Section[];
}

export interface Course {
  title: string;
  extractedAt: string;
  programs: Program[];
}

export interface CourseEntry {
  id: string;
  title: string;
  course: Course;
  videoMap: Record<string, string>;
}

// ─── Multi-course registry ──────────────────────────────────────────
// To add a new course:
// 1. Place course.json and video-map.json in src/data/courses/<course-id>/
// 2. Import them below and add to COURSES array
//
// For now, use the default single-course data. Additional courses can be
// loaded dynamically or imported statically.

let additionalCourses: CourseEntry[] = [];

function getDefaultCourse(): CourseEntry {
  return {
    id: "default",
    title: (defaultCourseData as unknown as Course).title || "Course",
    course: defaultCourseData as unknown as Course,
    videoMap: defaultVideoMap as Record<string, string>,
  };
}

export function getAllCourses(): CourseEntry[] {
  return [getDefaultCourse(), ...additionalCourses];
}

export function registerCourse(entry: CourseEntry): void {
  if (!additionalCourses.find((c) => c.id === entry.id)) {
    additionalCourses.push(entry);
  }
}

// ─── Active course management ───────────────────────────────────────

let activeCourseId = "default";

export function getActiveCourseId(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("active-course-id") || "default";
  }
  return activeCourseId;
}

export function setActiveCourseId(id: string): void {
  activeCourseId = id;
  if (typeof window !== "undefined") {
    localStorage.setItem("active-course-id", id);
  }
}

export function getActiveCourseEntry(): CourseEntry {
  const id = getActiveCourseId();
  const all = getAllCourses();
  return all.find((c) => c.id === id) || all[0];
}

// ─── Course data accessors (use active course) ─────────────────────

export function getCourse(): Course {
  return getActiveCourseEntry().course;
}

export function getVideoUrl(lessonId: string): string {
  const entry = getActiveCourseEntry();
  return entry.videoMap[lessonId] || "";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

export function findProgram(programSlug: string): Program | null {
  const course = getCourse();
  return course.programs.find((p) => slugify(p.title) === programSlug) || null;
}

export function findLesson(
  programSlug: string,
  lessonSlug: string
): {
  program: Program;
  section: Section;
  lesson: Lesson;
  flatIndex: number;
  allLessons: { lesson: Lesson; section: Section }[];
} | null {
  const course = getCourse();
  const program = course.programs.find((p) => slugify(p.title) === programSlug);
  if (!program) return null;

  const allLessons: { lesson: Lesson; section: Section }[] = [];
  for (const section of program.sections) {
    for (const lesson of section.lessons) {
      allLessons.push({ lesson, section });
    }
  }

  const flatIndex = allLessons.findIndex((l) => slugify(l.lesson.title) === lessonSlug);
  if (flatIndex < 0) return null;

  const { lesson, section } = allLessons[flatIndex];
  return { program, section, lesson, flatIndex, allLessons };
}

export function getAdjacentLessons(
  programSlug: string,
  allLessons: { lesson: Lesson; section: Section }[],
  flatIndex: number
): {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
} {
  const prev =
    flatIndex > 0
      ? { slug: slugify(allLessons[flatIndex - 1].lesson.title), title: allLessons[flatIndex - 1].lesson.title }
      : null;
  const next =
    flatIndex < allLessons.length - 1
      ? { slug: slugify(allLessons[flatIndex + 1].lesson.title), title: allLessons[flatIndex + 1].lesson.title }
      : null;
  return { prev, next };
}
