"use client";

import { useState, useRef, useEffect } from "react";
import { getAllCourses, getActiveCourseId, setActiveCourseId } from "@/lib/course";

export default function CourseSwitcher() {
  const courses = getAllCourses();
  const [activeId, setActiveId] = useState(getActiveCourseId());
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeCourse = courses.find((c) => c.id === activeId) || courses[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(id: string) {
    setActiveCourseId(id);
    setActiveId(id);
    setIsOpen(false);
    window.location.href = "/";
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[13px] text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
        {activeCourse.title}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-surface border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => handleSelect(course.id)}
              className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                course.id === activeId
                  ? "bg-sidebar-active text-foreground font-medium"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <div className="font-medium">{course.title}</div>
              <div className="text-[11px] text-muted-light mt-0.5">
                {course.course.programs.length} program{course.course.programs.length !== 1 ? "s" : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
