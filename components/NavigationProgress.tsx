"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function isInternalNavAnchor(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
  if (!anchor) return false;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href") ?? "";
  return href.startsWith("/");
}

function isExplicitNavTrigger(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[data-nav-trigger="true"]'));
}

export function NavigationProgress() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const doneTimer = useRef<number | null>(null);

  const start = () => {
    const bar = document.getElementById("nav-progress");
    if (!bar) return;
    bar.classList.remove("nav-progress--done");
    bar.classList.add("nav-progress--active");
  };

  const complete = () => {
    const bar = document.getElementById("nav-progress");
    if (!bar) return;
    bar.classList.remove("nav-progress--active");
    bar.classList.add("nav-progress--done");

    if (doneTimer.current) {
      window.clearTimeout(doneTimer.current);
    }

    doneTimer.current = window.setTimeout(() => {
      bar.classList.remove("nav-progress--done");
    }, 400);
  };

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (isInternalNavAnchor(event.target) || isExplicitNavTrigger(event.target)) {
        start();
      }
    };

    const onPopState = () => {
      start();
    };

    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("popstate", onPopState);
      if (doneTimer.current) {
        window.clearTimeout(doneTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (pathname !== previousPathname.current) {
      previousPathname.current = pathname;
      complete();
    }
  }, [pathname]);

  return <div id="nav-progress" aria-hidden="true" />;
}
