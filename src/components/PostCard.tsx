import Link from "next/link";
import Avatar from "@/components/Avatar";
import { excerpt, timeAgo, type Label, type Post } from "@/lib/community";

function PinIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 3v2l1 1v4l3 3v2h-7v6l-1 1-1-1v-6H4v-2l3-3V6l1-1V3h8z" />
    </svg>
  );
}

export default function PostCard({ group, post, label }: { group: string; post: Post; label: Label | null }) {
  const thumb = post.imagePreview || post.videoLinks?.[0]?.thumbnail || "";
  const hasVideo = !post.imagePreview && !!post.videoLinks?.[0];

  return (
    <Link
      href={`/community/${group}/${post.slug}`}
      className="block bg-card-bg rounded-xl border border-border-card px-5 py-4 card-hover"
    >
      <div className="flex items-start gap-3">
        <Avatar user={post.user} size={40} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="font-semibold text-foreground">{post.user?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted">
            <span>{timeAgo(post.createdAt)}</span>
            {label && (
              <>
                <span>·</span>
                <span>{label.name}</span>
              </>
            )}
          </div>
        </div>

        {post.pinned && (
          <span className="flex items-center gap-1 text-[12px] text-muted font-medium shrink-0">
            <PinIcon />
            Pinned
          </span>
        )}
      </div>

      <div className="flex gap-4 mt-2.5">
        <div className="min-w-0 flex-1">
          {post.title && (
            <h3 className="font-bold text-[17px] text-foreground leading-snug mb-1">{post.title}</h3>
          )}
          <p className="text-[14px] text-foreground/90 leading-[1.5] line-clamp-2">{excerpt(post.content)}</p>
        </div>

        {thumb && (
          <div className="w-[92px] h-[62px] shrink-0 rounded-md overflow-hidden bg-black relative">
            <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
            {hasVideo && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3 text-[13px] text-muted">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          {post.upvotes}
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {post.commentCount}
        </span>
      </div>
    </Link>
  );
}
