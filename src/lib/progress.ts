"use client";

const STORAGE_KEY = "skool-course-progress";

interface ProgressData {
  completedLessons: string[];
}

function getProgress(): ProgressData {
  if (typeof window === "undefined") return { completedLessons: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedLessons: [] };
    return JSON.parse(raw);
  } catch {
    return { completedLessons: [] };
  }
}

function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isLessonComplete(lessonId: string): boolean {
  return getProgress().completedLessons.includes(lessonId);
}

export function toggleLessonComplete(lessonId: string): boolean {
  const data = getProgress();
  const idx = data.completedLessons.indexOf(lessonId);
  if (idx >= 0) {
    data.completedLessons.splice(idx, 1);
    saveProgress(data);
    return false;
  } else {
    data.completedLessons.push(lessonId);
    saveProgress(data);
    return true;
  }
}

export function markLessonComplete(lessonId: string): void {
  const data = getProgress();
  if (!data.completedLessons.includes(lessonId)) {
    data.completedLessons.push(lessonId);
    saveProgress(data);
  }
}

export function getModuleProgress(lessonIds: string[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const data = getProgress();
  const completed = lessonIds.filter((id) =>
    data.completedLessons.includes(id)
  ).length;
  return {
    completed,
    total: lessonIds.length,
    percentage: lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0,
  };
}

export function getOverallProgress(allLessonIds: string[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  return getModuleProgress(allLessonIds);
}
