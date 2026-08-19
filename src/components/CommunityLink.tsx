"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getActiveCourseEntry } from "@/lib/course";

/**
 * The classroom header only offers the Community tab for courses that were
 * extracted with one. Rendered after mount because the active course lives in
 * localStorage.
 */
export default function CommunityLink() {
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const entry = getActiveCourseEntry();
    setCourseId(entry.hasCommunity ? entry.id : null);
  }, []);

  if (!courseId) return null;

  return (
    <Link
      href={`/community/${courseId}`}
      className="px-3 py-1.5 rounded-full text-[13px] font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
    >
      Community
    </Link>
  );
}
