'use client';

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Home, CalendarDays, Flag, Activity, FileText } from "lucide-react";
import { cn } from "@/Lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();
  const params = useParams();
  const currentYear = Number(params.year) || new Date().getFullYear();
  const baseYear = new Date().getFullYear();
  const years = [baseYear, baseYear - 1, baseYear - 2];

  const linkBase = "flex items-center gap-3 px-4 py-2 text-sm font-mono tracking-wider transition-colors";
  const linkInactive = "text-text-dim hover:text-text hover:bg-panel-elev";
  const linkActive = "text-text bg-panel-elev border-l-2 border-red";

  return (
    <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-[15%] flex-col border-r border-border-subtle bg-panel z-30">
      <div className="px-4 py-5 border-b border-border-subtle">
        <div className="flex flex-col">
          <img src="/Logo_icon.png" alt="F1 Control Room" className="  ml-[-7px]" />
          <p className="font-mono text-[10px] text-text-dim mt-3 tracking-wider">All data is from the server</p>
        </div>
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
        <Link href={`/drivers?year=${currentYear}`} className={cn(linkBase, pathname.startsWith("/drivers") ? linkActive : linkInactive)}>
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
          DRIVERS
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

        <div className="px-4 mt-6 mb-2 label-mono">External</div>
        <a
          href={(() => {
            const url = process.env.NEXT_PUBLIC_API_DOCS_URL;
            if (!url) return "#";
            return url.startsWith("http://") || url.startsWith("https://")
              ? url
              : `http://${url}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(linkBase, linkInactive)}
        >
          <FileText size={14} /> API DOCS
        </a>
      </nav>

    </aside>
  );
};
