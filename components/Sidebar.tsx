'use client';

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Home, CalendarDays, Flag, Activity } from "lucide-react";
import { cn } from "@/Lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();
  const params = useParams();
  const currentYear = Number(params.year) || 2024;
  const years = [2024];

  const linkBase = "flex items-center gap-3 px-4 py-2 text-sm font-mono tracking-wider transition-colors";
  const linkInactive = "text-text-dim hover:text-text hover:bg-panel-elev";
  const linkActive = "text-text bg-panel-elev border-l-2 border-red";

  return (
    <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-[15%] flex-col border-r border-border-subtle bg-panel z-30">
      <div className="px-4 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
          <h1 className="font-display text-sm font-bold tracking-tighter">F1 CONTROL ROOM</h1>
        </div>
        <p className="label-mono mt-1">v1 · INSTRUMENT</p>
      </div>

      <nav className="scrollbar-none flex-1 overflow-x-auto overflow-y-auto py-3">
        <div className="px-4 mb-2 label-mono">Navigation</div>
        <Link href="/" className={cn(linkBase, pathname === "/" ? linkActive : linkInactive)}>
          <Home size={14} /> HOME
        </Link>
        <Link href={`/season/${currentYear}`} className={cn(linkBase, pathname.startsWith("/season") ? linkActive : linkInactive)}>
          <CalendarDays size={14} /> SEASON
        </Link>
        <Link href={`/race/${currentYear}/1`} className={cn(linkBase, pathname.startsWith("/race") ? linkActive : linkInactive)}>
          <Flag size={14} /> RACES
        </Link>
        <Link href="/driver-record" className={cn(linkBase, pathname.startsWith("/driver-record") ? linkActive : linkInactive)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 14a8 8 0 1 1 16 0" />
            <path d="M4 14h8" />
            <path d="M12 14h6" />
            <path d="M18 14v3a3 3 0 0 1-3 3h-3" />
            <path d="M6 14v2" />
          </svg>
          DRIVER RECORD
        </Link>

        <div className="px-4 mt-6 mb-2 label-mono">Season</div>
        <div className="px-4 pb-2">
          {years.map((y) => (
            <Link
              key={y}
              href={`/season/${y}`}
              className={cn(
                "block py-1.5 font-mono text-xs tracking-wider",
                pathname.includes(`/season/${y}`) || currentYear === y ? "text-red" : "text-text-dim hover:text-text"
              )}
            >
              · {y}
            </Link>
          ))}
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-green" />
          <span className="label-mono">MOCK DATA · LIVE</span>
        </div>
      </div>
    </aside>
  );
};
