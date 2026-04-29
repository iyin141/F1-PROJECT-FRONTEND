"use client"

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getRaceDetail } from "@/Api_services";

export default function HomePage() {
  const info = useQuery({ queryKey: ['todos'], queryFn: () => getRaceDetail(2024, 1) });
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">F1 Platform</p>
        <h1 className="mt-3 font-display text-5xl tracking-wide text-foreground">Frontend Scaffold Ready</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted">
          Root page is restored so Turbopack can emit the /page endpoint correctly during development.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/api/races/2024"
            className="rounded-lg border border-border-strong bg-surface-elevated px-4 py-2 text-sm text-foreground transition hover:border-accent"
          >
            Try API Route
          </Link>
   
        </div>
      </section>
    </main>
  );
}
