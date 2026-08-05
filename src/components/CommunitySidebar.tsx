import type { Community } from "@/lib/community";

import Avatar from "@/components/Avatar";

export default function CommunitySidebar({ community }: { community: Community }) {
  const { group, leaderboard } = community;
  const members = leaderboard || [];

  return (
    <aside className="w-[280px] shrink-0 space-y-4 hidden lg:block">
      <div className="bg-card-bg rounded-xl border border-border-card overflow-hidden">
        {group.cover && (
          <div className="aspect-[16/9] bg-black">
            <img src={group.cover} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-4">
          <h2 className="font-bold text-[16px] text-foreground">{group.name}</h2>
          <p className="text-[12px] text-muted mt-0.5">skool.com/{group.slug}</p>
          <p className="text-[13px] text-foreground/90 leading-[1.5] mt-3">{group.description}</p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border text-center">
            <div>
              <div className="font-bold text-[16px] text-foreground">{group.members.toLocaleString("en-US")}</div>
              <div className="text-[11px] text-muted">Members</div>
            </div>
            <div>
              <div className="font-bold text-[16px] text-foreground">{group.online}</div>
              <div className="text-[11px] text-muted">Online</div>
            </div>
            <div>
              <div className="font-bold text-[16px] text-foreground">{group.admins}</div>
              <div className="text-[11px] text-muted">Admins</div>
            </div>
          </div>
        </div>
      </div>

      {members.length > 0 && (
        <div className="bg-card-bg rounded-xl border border-border-card p-4">
          <h3 className="font-bold text-[14px] text-foreground mb-3">Leaderboard (30-day)</h3>
          <ul className="space-y-2.5">
            {members.slice(0, 10).map((entry, i) => (
              <li key={entry.user?.id || i} className="flex items-center gap-2.5 text-[13px]">
                <span className="w-5 text-center text-[11px] font-bold text-muted">{entry.rank ?? i + 1}</span>
                <Avatar user={entry.user} size={28} />
                <span className="truncate flex-1 text-foreground">{entry.user?.name || "Member"}</span>
                {entry.points != null && (
                  <span className="text-[12px] font-semibold text-muted">+{entry.points}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
