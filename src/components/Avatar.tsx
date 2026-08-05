import type { CommunityUser } from "@/lib/community";

/** Skool shows a coloured initial when a member has no profile picture. */
const COLORS = ["#F87E13", "#009E5D", "#9A69B8", "#AE58D1", "#BDDBDD", "#32A29C", "#BB6EE7", "#E4572E"];

function colorFor(seed: string): string {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % COLORS.length;
  return COLORS[n];
}

export default function Avatar({
  user,
  size = 40,
  showLevel = true,
}: {
  user: CommunityUser | null;
  size?: number;
  showLevel?: boolean;
}) {
  const name = user?.name || user?.handle || "?";
  const style = { width: size, height: size };

  const face = user?.avatar ? (
    <img
      src={user.avatar}
      alt={name}
      style={style}
      className="rounded-full object-cover bg-[#e5e7eb]"
      loading="lazy"
    />
  ) : (
    <span
      style={{ ...style, backgroundColor: colorFor(name), fontSize: Math.round(size * 0.4) }}
      className="rounded-full flex items-center justify-center text-white font-semibold uppercase"
    >
      {name.charAt(0)}
    </span>
  );

  if (!showLevel || !user?.level) {
    return <span className="shrink-0 inline-flex">{face}</span>;
  }

  // Skool pins the member's level to the bottom-left of the avatar.
  const badge = Math.max(12, Math.round(size * 0.42));
  return (
    <span className="relative shrink-0 inline-flex">
      {face}
      <span
        style={{ width: badge, height: badge, fontSize: Math.round(badge * 0.62) }}
        className="absolute -bottom-0.5 -left-1 rounded-full bg-[#2563eb] text-white font-bold flex items-center justify-center ring-2 ring-card-bg"
      >
        {user.level}
      </span>
    </span>
  );
}
