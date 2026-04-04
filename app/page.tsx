import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-zinc-100">
      <section className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-red-500">F1 Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold">Frontend Integration</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Phase 2 schedule and standings are available on the races page.
        </p>
        <Link
          href="/races"
          className="mt-6 inline-flex rounded-md border border-red-700 bg-red-700/20 px-5 py-2 text-sm font-medium text-red-200 transition hover:bg-red-700/30"
        >
          Open Races Page
        </Link>
      </section>
    </main>
  );
}
