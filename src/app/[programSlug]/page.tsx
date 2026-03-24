"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { findProgram, slugify } from "@/lib/course";
import Link from "next/link";

// This page redirects to the first lesson (Skool has no separate program page)
export default function ProgramPage({
  params,
}: {
  params: Promise<{ programSlug: string }>;
}) {
  const { programSlug } = use(params);
  const router = useRouter();
  const program = findProgram(programSlug);

  useEffect(() => {
    if (!program) return;
    // Find first lesson and redirect
    for (const sec of program.sections) {
      if (sec.lessons.length > 0) {
        router.replace(`/${programSlug}/${slugify(sec.lessons[0].title)}`);
        return;
      }
    }
  }, [program, programSlug, router]);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2 text-foreground">Program not found</h1>
          <Link href="/" className="text-[14px] text-accent hover:underline">Back to classroom</Link>
        </div>
      </div>
    );
  }

  // Show brief loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-muted text-[14px]">Loading...</div>
    </div>
  );
}
