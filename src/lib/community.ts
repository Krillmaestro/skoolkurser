import emmCommunity from "@/data/courses/email-marketerz/community.json";
import earlyaiCommunity from "@/data/courses/earlyaidopters/community.json";

export interface CommunityUser {
  id: string;
  handle: string;
  name: string;
  bio: string;
  avatar: string;
  /** Skool gamification level, shown as a badge on the avatar. */
  level?: number;
  mrrStatus?: string;
  location?: string;
}

export interface LeaderboardEntry {
  rank: number;
  points: number;
  user: CommunityUser | null;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  size: number;
}

export interface VideoLink {
  url: string;
  provider: number;
  video_id: string;
  thumbnail: string;
  len_ms: number;
  title: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  attachments: Attachment[];
  user: CommunityUser;
  replies: Comment[];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  upvotes: number;
  commentCount: number;
  labelId: string;
  imagePreview: string;
  attachments: Attachment[];
  videoLinks: VideoLink[];
  poll: { entries: { text: string; count: number }[] } | null;
  user: CommunityUser | null;
  comments: Comment[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description: string;
  posts: number;
}

export interface CommunityGroup {
  slug: string;
  name: string;
  description: string;
  color: string;
  logo: string;
  cover: string;
  members: number;
  admins: number;
  online: number;
  totalPosts: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
}

export interface Community {
  group: CommunityGroup;
  labels: Label[];
  posts: Post[];
  events: CommunityEvent[];
  leaderboard: LeaderboardEntry[];
}

// One replica community per course that was extracted with one. The route
// segment (/community/<group>) matches the course id in course.ts.
const COMMUNITIES: Record<string, Community> = {
  "email-marketerz": emmCommunity as unknown as Community,
  earlyaidopters: earlyaiCommunity as unknown as Community,
};

export const COMMUNITY_GROUPS = Object.keys(COMMUNITIES);

export const PAGE_SIZE = 30;

export function getCommunity(group: string): Community | null {
  return COMMUNITIES[group] || null;
}

export function getLabel(group: string, id: string): Label | null {
  return getCommunity(group)?.labels.find((l) => l.id === id) || null;
}

export function getPosts(group: string, labelId?: string): Post[] {
  const all = getCommunity(group)?.posts || [];
  if (!labelId) return all;
  return all.filter((p) => p.labelId === labelId);
}

export function getPost(group: string, slug: string): Post | null {
  return getCommunity(group)?.posts.find((p) => p.slug === slug) || null;
}

/** "16h ago", "5d ago", "Mar 3" — matching how Skool labels post times. */
export function timeAgo(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function countComments(list: Comment[]): number {
  let n = 0;
  for (const c of list) n += 1 + countComments(c.replies || []);
  return n;
}

/** First line of a post body, with Skool's list markup stripped. */
export function excerpt(content: string, max = 220): string {
  const flat = content
    .replace(/\[ul\]|\[ol(?::\d+)?\]/g, "")
    .replace(/\[li\]/g, " • ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\\([()[\]])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}...` : flat;
}
