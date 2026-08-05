import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import CommentThread from "@/components/CommentThread";
import CommunityHeader from "@/components/CommunityHeader";
import CommunitySidebar from "@/components/CommunitySidebar";
import PostContent from "@/components/PostContent";
import { countComments, getCommunity, getLabel, getPost, timeAgo } from "@/lib/community";

export function generateStaticParams() {
  return getCommunity().posts.map((p) => ({ postSlug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ postSlug: string }> }) {
  const { postSlug } = await params;
  const post = getPost(postSlug);
  return { title: post ? `${post.title} · Community` : "Post" };
}

export default async function PostPage({ params }: { params: Promise<{ postSlug: string }> }) {
  const { postSlug } = await params;
  const post = getPost(postSlug);
  if (!post) notFound();

  const community = getCommunity();
  const label = getLabel(post.labelId);
  const fetched = countComments(post.comments);

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader group={community.group} />

      <main className="max-w-[1100px] mx-auto px-6 py-6 flex gap-6">
        <div className="min-w-0 flex-1">
          <Link href="/community" className="text-[13px] text-muted hover:text-foreground inline-flex items-center gap-1.5 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to community
          </Link>

          <article className="bg-card-bg rounded-xl border border-border-card px-6 py-5">
            <div className="flex items-start gap-3">
              <Avatar user={post.user} size={44} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[14px] text-foreground">{post.user?.name || "Unknown"}</div>
                <div className="text-[12px] text-muted">
                  {timeAgo(post.createdAt)}
                  {label && <> · {label.name}</>}
                </div>
              </div>
              {post.pinned && <span className="text-[12px] text-muted font-medium">Pinned</span>}
            </div>

            {post.title && <h1 className="text-[22px] font-bold text-foreground mt-4 leading-snug">{post.title}</h1>}

            <PostContent content={post.content} className="mt-3" />

            {/* Image / file attachments */}
            {post.attachments.length > 0 && (
              <div className="mt-4 space-y-3">
                {post.attachments.map((a) =>
                  a.contentType?.startsWith("image/") ? (
                    <img
                      key={a.id}
                      src={a.url || a.thumbUrl}
                      alt={a.fileName}
                      className="max-w-full h-auto rounded-lg border border-border"
                      loading="lazy"
                    />
                  ) : (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-border hover:bg-surface-hover"
                    >
                      <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span className="text-[14px] text-foreground truncate">{a.fileName || "Attachment"}</span>
                    </a>
                  )
                )}
              </div>
            )}

            {/* Linked videos — Skool embeds these inline */}
            {post.videoLinks.length > 0 && (
              <div className="mt-4 space-y-3">
                {post.videoLinks.map((v, i) => {
                  const ytId = v.video_id || v.url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/)?.[1];
                  return ytId ? (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={v.title || "Video"}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline text-[14px]">
                      {v.title || v.url}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Poll results */}
            {post.poll?.entries && (
              <div className="mt-4 space-y-2">
                {(() => {
                  const total = post.poll.entries.reduce((a, e) => a + (e.count || 0), 0) || 1;
                  return post.poll.entries.map((e, i) => {
                    const pct = Math.round(((e.count || 0) / total) * 100);
                    return (
                      <div key={i} className="relative rounded-lg border border-border overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-[#ede9fe]" style={{ width: `${pct}%` }} />
                        <div className="relative flex items-center justify-between px-3 py-2 text-[14px]">
                          <span>{e.text}</span>
                          <span className="text-muted font-medium">
                            {e.count} · {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border text-[13px] text-muted">
              <span>{post.upvotes} likes</span>
              <span>{post.commentCount} comments</span>
            </div>
          </article>

          <section className="mt-5 bg-card-bg rounded-xl border border-border-card px-6 py-4">
            <h2 className="font-bold text-[15px] text-foreground mb-1">
              {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
            </h2>
            {fetched < post.commentCount && (
              <p className="text-[12px] text-muted mb-2">
                {fetched} of {post.commentCount} captured at extraction time
              </p>
            )}
            {post.comments.length > 0 ? (
              <CommentThread comments={post.comments} />
            ) : (
              <p className="text-[14px] text-muted py-3">No comments captured for this post.</p>
            )}
          </section>
        </div>

        <CommunitySidebar community={community} />
      </main>
    </div>
  );
}
