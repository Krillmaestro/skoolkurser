import Link from "next/link";
import CommunityHeader from "@/components/CommunityHeader";
import CommunitySidebar from "@/components/CommunitySidebar";
import PostCard from "@/components/PostCard";
import { getCommunity, getPosts, PAGE_SIZE } from "@/lib/community";

export const metadata = {
  title: "Community · Email Marketing Mastery",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const labelId = typeof sp.c === "string" ? sp.c : "";
  const page = Math.max(1, Number(typeof sp.p === "string" ? sp.p : 1) || 1);

  const community = getCommunity();
  const posts = getPosts(labelId || undefined);
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const slice = posts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const labelById = new Map(community.labels.map((l) => [l.id, l]));
  const qs = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const c = over.c !== undefined ? String(over.c) : labelId;
    const p = over.p !== undefined ? Number(over.p) : current;
    if (c) params.set("c", c);
    if (p > 1) params.set("p", String(p));
    const s = params.toString();
    return s ? `/community?${s}` : "/community";
  };

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader group={community.group} />

      <main className="max-w-[1100px] mx-auto px-6 py-6 flex gap-6">
        <div className="min-w-0 flex-1">
          {/* Upcoming event banner — Skool shows this above the filters */}
          {community.events.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-[13px] text-foreground mb-4">
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">{community.events[0].title}</span>
              <span className="text-muted">is the next scheduled call</span>
            </div>
          )}

          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Link
              href={qs({ c: "", p: 1 })}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                !labelId ? "bg-foreground text-white" : "bg-card-bg border border-border-card hover:bg-surface-hover"
              }`}
            >
              All
            </Link>
            {community.labels.map((l) => (
              <Link
                key={l.id}
                href={qs({ c: l.id, p: 1 })}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  labelId === l.id
                    ? "bg-foreground text-white"
                    : "bg-card-bg border border-border-card hover:bg-surface-hover"
                }`}
              >
                {l.name}
              </Link>
            ))}
          </div>

          <p className="text-[13px] text-muted mb-3">
            {posts.length.toLocaleString("en-US")} posts · page {current} of {totalPages}
          </p>

          <div className="space-y-3">
            {slice.map((post) => (
              <PostCard key={post.id} post={post} label={labelById.get(post.labelId) || null} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            {current > 1 ? (
              <Link
                href={qs({ p: current - 1 })}
                className="px-4 py-2 rounded-full bg-card-bg border border-border-card text-[13px] font-medium hover:bg-surface-hover"
              >
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            {current < totalPages ? (
              <Link
                href={qs({ p: current + 1 })}
                className="px-4 py-2 rounded-full bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover"
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        <CommunitySidebar community={community} />
      </main>
    </div>
  );
}
