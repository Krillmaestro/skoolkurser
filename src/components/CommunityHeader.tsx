"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CommunityGroup } from "@/lib/community";

const TABS = [
  { label: "Community", href: "/community" },
  { label: "Classroom", href: "/" },
];

export default function CommunityHeader({ group }: { group: CommunityGroup }) {
  const pathname = usePathname();

  return (
    <header className="bg-header-bg border-b border-border sticky top-0 z-50">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex items-center h-[52px] gap-3">
          {group.logo && (
            <img src={group.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
          )}
          <Link href="/community" className="font-bold text-[17px] text-foreground hover:opacity-70 transition-opacity">
            {group.name}
          </Link>
        </div>

        <nav className="flex items-center gap-6 -mb-px">
          {TABS.map((tab) => {
            const active =
              tab.href === "/community" ? pathname.startsWith("/community") : !pathname.startsWith("/community");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`py-3 text-[15px] transition-colors ${
                  active ? "nav-tab-active" : "text-tab-inactive hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
