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
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!!getActiveCourseEntry().hasCommunity);
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/community"
      className="px-3 py-1.5 rounded-full text-[13px] font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
    >
      Community
    </Link>
  );
}
