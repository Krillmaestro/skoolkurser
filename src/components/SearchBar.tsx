"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCourse, slugify } from "@/lib/course";

interface SearchResult {
  lessonTitle: string;
  sectionTitle: string;
  programTitle: string;
  programSlug: string;
  lessonSlug: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const course = getCourse();

  // Build flat lesson index once
  const lessonIndex = useMemo(() => {
    const items: (SearchResult & { searchText: string })[] = [];
    for (const program of course.programs) {
      const programSlug = slugify(program.title);
      for (const section of program.sections) {
        for (const lesson of section.lessons) {
          items.push({
            lessonTitle: lesson.title,
            sectionTitle: section.title,
            programTitle: program.title,
            programSlug,
            lessonSlug: slugify(lesson.title),
            searchText: `${lesson.title} ${lesson.transcript || ""}`.toLowerCase(),
          });
        }
      }
    }
    return items;
  }, [course]);

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return lessonIndex
      .filter((item) => item.searchText.includes(q))
      .slice(0, 10);
  }, [debouncedQuery, lessonIndex]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function handleSelect(result: SearchResult) {
    setIsOpen(false);
    setQuery("");
    router.push(`/${result.programSlug}/${result.lessonSlug}`);
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-[400px]">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder="Search lessons..."
          className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-surface rounded-lg border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 py-1 max-h-[360px] overflow-y-auto">
          {results.map((result, i) => (
            <button
              key={`${result.programSlug}-${result.lessonSlug}-${i}`}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-3 py-2 hover:bg-surface-hover transition-colors"
            >
              <div className="text-[13px] text-foreground truncate">{result.lessonTitle}</div>
              <div className="text-[11px] text-muted mt-0.5 truncate">
                {result.programTitle} &middot; {result.sectionTitle}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && debouncedQuery.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 py-3 px-3">
          <p className="text-[13px] text-muted text-center">No results found</p>
        </div>
      )}
    </div>
  );
}
