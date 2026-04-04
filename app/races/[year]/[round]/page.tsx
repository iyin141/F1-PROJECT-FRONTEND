"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getPracticeSessionResults,
  getQualifyingResults,
  getRaceDetail,
  getRaceResults,
} from "@/Api_services/races";
import type {
  PracticeResult,
  PracticeResultsResponse,
  PracticeSessionName,
  QualifyingResult,
  QualifyingResultsResponse,
  RaceDetailResponse,
  RaceResult,
  RaceResultsResponse,
} from "@/types/races";

type TabId = "overview" | "results" | "qualifying" | "practice";

function formatRaceDate(value: string | null) {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function ResultsTable({ rows }: { rows: RaceResult[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-900 text-zinc-400">
          <tr>
            <th className="px-3 py-2">Pos</th>
            <th className="px-3 py-2">Driver</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-3 py-2">Grid</th>
            <th className="px-3 py-2">Laps</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.driver_name}-${index}`} className="border-t border-zinc-800 text-zinc-200">
              <td className="px-3 py-2">{row.position ?? "-"}</td>
              <td className="px-3 py-2">{row.driver_name}</td>
              <td className="px-3 py-2">{row.team}</td>
              <td className="px-3 py-2">{row.grid_position ?? "-"}</td>
              <td className="px-3 py-2">{row.laps}</td>
              <td className="px-3 py-2">{row.status}</td>
              <td className="px-3 py-2">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QualifyingTable({ rows }: { rows: QualifyingResult[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-900 text-zinc-400">
          <tr>
            <th className="px-3 py-2">Pos</th>
            <th className="px-3 py-2">Driver</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-3 py-2">Q1</th>
            <th className="px-3 py-2">Q2</th>
            <th className="px-3 py-2">Q3</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.driver_name}-${index}`} className="border-t border-zinc-800 text-zinc-200">
              <td className="px-3 py-2">{row.position ?? "-"}</td>
              <td className="px-3 py-2">{row.driver_name}</td>
              <td className="px-3 py-2">{row.team}</td>
              <td className="px-3 py-2">{row.q1_time ?? "-"}</td>
              <td className="px-3 py-2">{row.q2_time ?? "-"}</td>
              <td className="px-3 py-2">{row.q3_time ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PracticeTable({ rows }: { rows: PracticeResult[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-900 text-zinc-400">
          <tr>
            <th className="px-3 py-2">Pos</th>
            <th className="px-3 py-2">Driver</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-3 py-2">Lap Time</th>
            <th className="px-3 py-2">Lap #</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.driver_code}-${index}`} className="border-t border-zinc-800 text-zinc-200">
              <td className="px-3 py-2">{row.position}</td>
              <td className="px-3 py-2">{row.driver_code}</td>
              <td className="px-3 py-2">{row.team}</td>
              <td className="px-3 py-2">{row.lap_time ?? "-"}</td>
              <td className="px-3 py-2">{row.lap_number ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RaceWeekendPage() {
  const params = useParams<{ year: string; round: string }>();

  const year = Number(params.year);
  const round = Number(params.round);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [practiceSession, setPracticeSession] = useState<PracticeSessionName>("fp1");
  const [loading, setLoading] = useState(true);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [raceDetail, setRaceDetail] = useState<RaceDetailResponse | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResultsResponse | null>(null);
  const [qualifyingResults, setQualifyingResults] =
    useState<QualifyingResultsResponse | null>(null);
  const [practiceResults, setPracticeResults] = useState<PracticeResultsResponse | null>(null);

  const isInvalidRouteParams = useMemo(
    () => !Number.isInteger(year) || !Number.isInteger(round) || year < 1950 || round < 1,
    [round, year],
  );

  useEffect(() => {
    if (isInvalidRouteParams) {
      setError("Invalid race route parameters.");
      setLoading(false);
      return;
    }

    async function loadWeekendData() {
      setLoading(true);
      setError(null);

      try {
        const [detailResponse, resultsResponse, qualifyingResponse] = await Promise.all([
          getRaceDetail(year, round),
          getRaceResults(year, round),
          getQualifyingResults(year, round),
        ]);

        setRaceDetail(detailResponse);
        setRaceResults(resultsResponse);
        setQualifyingResults(qualifyingResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load race weekend data.");
      } finally {
        setLoading(false);
      }
    }

    loadWeekendData();
  }, [isInvalidRouteParams, round, year]);

  useEffect(() => {
    if (isInvalidRouteParams) return;

    async function loadPracticeData() {
      setPracticeLoading(true);
      setPracticeError(null);

      try {
        const response = await getPracticeSessionResults(year, round, practiceSession);
        setPracticeResults(response);
      } catch (err) {
        setPracticeError(err instanceof Error ? err.message : "Failed to load practice data.");
      } finally {
        setPracticeLoading(false);
      }
    }

    loadPracticeData();
  }, [isInvalidRouteParams, practiceSession, round, year]);

  const qualifyingRows = qualifyingResults?.qualifying ?? raceResults?.results.qualifying ?? [];
  const raceRows = raceResults?.results.race ?? [];
  const winner = raceRows.find((row) => row.position === 1) ?? null;
  const pole = qualifyingRows.find((row) => row.position === 1) ?? null;
  const finishers = raceRows.filter((row) => row.status.toLowerCase() === "finished").length;
  const totalPoints = raceRows.reduce((acc, row) => acc + row.points, 0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(232,0,45,0.16),transparent_40%),#050505] px-6 py-8 text-zinc-100 md:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <Link
          href={`/races?year=${Number.isFinite(year) ? year : new Date().getFullYear()}`}
          className="inline-flex rounded-md border border-zinc-700 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-zinc-300 transition hover:border-red-700 hover:text-red-300"
        >
          Back to Calendar
        </Link>

        <header className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-red-500">
            {Number.isFinite(year) ? year : "--"} Season · Round {Number.isFinite(round) ? round : "--"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {raceDetail?.name ?? "Race Weekend"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {raceDetail
              ? `${raceDetail.location}, ${raceDetail.country} · ${formatRaceDate(raceDetail.date)}`
              : "Loading race metadata..."}
          </p>
        </header>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-700/50 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
                activeTab === "overview"
                  ? "border-red-700 bg-red-700/20 text-red-200"
                  : "border-zinc-700 text-zinc-300 hover:border-red-700"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("results")}
              className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
                activeTab === "results"
                  ? "border-red-700 bg-red-700/20 text-red-200"
                  : "border-zinc-700 text-zinc-300 hover:border-red-700"
              }`}
            >
              Results
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("qualifying")}
              className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
                activeTab === "qualifying"
                  ? "border-red-700 bg-red-700/20 text-red-200"
                  : "border-zinc-700 text-zinc-300 hover:border-red-700"
              }`}
            >
              Qualifying
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("practice")}
              className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
                activeTab === "practice"
                  ? "border-red-700 bg-red-700/20 text-red-200"
                  : "border-zinc-700 text-zinc-300 hover:border-red-700"
              }`}
            >
              Practice
            </button>
          </div>

          {loading ? (
            <div className="h-64 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/70" />
          ) : null}

          {!loading && activeTab === "overview" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Winner</p>
                <p className="mt-1 text-sm text-zinc-100">{winner?.driver_name ?? "-"}</p>
                <p className="text-xs text-zinc-400">{winner?.team ?? "No race data"}</p>
              </article>
              <article className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Pole</p>
                <p className="mt-1 text-sm text-zinc-100">{pole?.driver_name ?? "-"}</p>
                <p className="text-xs text-zinc-400">{pole?.team ?? "No qualifying data"}</p>
              </article>
              <article className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Finishers</p>
                <p className="mt-1 text-sm text-zinc-100">{finishers}</p>
                <p className="text-xs text-zinc-400">Out of {raceRows.length || 0} classified</p>
              </article>
              <article className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Points Awarded</p>
                <p className="mt-1 text-sm text-zinc-100">{totalPoints}</p>
                <p className="text-xs text-zinc-400">Top ten + bonuses</p>
              </article>
            </div>
          ) : null}

          {!loading && activeTab === "results" ? (
            <ResultsTable rows={raceResults?.results.race ?? []} />
          ) : null}

          {!loading && activeTab === "qualifying" ? (
            <QualifyingTable rows={qualifyingRows} />
          ) : null}

          {!loading && activeTab === "practice" ? (
            <div>
              <div className="mb-3 flex items-center gap-3">
                <label className="text-xs uppercase tracking-[0.15em] text-zinc-400">Session</label>
                <select
                  value={practiceSession}
                  onChange={(event) => setPracticeSession(event.target.value as PracticeSessionName)}
                  className="rounded-md border border-zinc-700 bg-black px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-zinc-200 outline-none ring-red-500 transition focus:ring-2"
                >
                  <option value="fp1">FP1</option>
                  <option value="fp2">FP2</option>
                  <option value="fp3">FP3</option>
                </select>
              </div>

              {practiceError ? (
                <div className="mb-3 rounded-md border border-red-700/50 bg-red-950/30 p-3 text-sm text-red-200">
                  {practiceError}
                </div>
              ) : null}

              {practiceLoading ? (
                <div className="h-64 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/70" />
              ) : (
                <PracticeTable rows={practiceResults?.practice ?? []} />
              )}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
