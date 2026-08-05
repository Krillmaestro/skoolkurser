import Avatar from "@/components/Avatar";
import PostContent from "@/components/PostContent";
import { timeAgo, type Comment } from "@/lib/community";

function AttachmentList({ attachments }: { attachments: Comment["attachments"] }) {
  if (!attachments?.length) return null;
  return (
    <div className="mt-2 space-y-2">
      {attachments.map((a) =>
        a.contentType?.startsWith("image/") ? (
          <img
            key={a.id}
            src={a.thumbUrl || a.url}
            alt={a.fileName}
            className="max-w-[360px] w-full h-auto rounded-lg border border-border"
            loading="lazy"
          />
        ) : (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] text-[#2563eb] hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            {a.fileName || "Attachment"}
          </a>
        )
      )}
    </div>
  );
}

function CommentItem({ comment, depth }: { comment: Comment; depth: number }) {
  return (
    <li className={depth > 0 ? "pl-6 border-l border-border" : ""}>
      <div className="flex items-start gap-2.5 py-3">
        <Avatar user={comment.user} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px] flex-wrap">
            <span className="font-semibold text-foreground">{comment.user?.name || "Unknown"}</span>
            <span className="text-muted text-[12px]">· {timeAgo(comment.createdAt)}</span>
          </div>
          <PostContent content={comment.content} className="mt-1 text-[14px]" />
          <AttachmentList attachments={comment.attachments} />
          {comment.upvotes > 0 && (
            <div className="mt-1.5 text-[12px] text-muted flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              {comment.upvotes}
            </div>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <ul className="ml-4">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CommentThread({ comments }: { comments: Comment[] }) {
  if (!comments?.length) return null;
  return (
    <ul className="divide-y divide-border">
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} depth={0} />
      ))}
    </ul>
  );
}
