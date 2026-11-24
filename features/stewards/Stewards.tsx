"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { OrbStatus } from "@/components/v2/OrbStatus";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import type { AskBody, AssistantCitation } from "@/Lib/api/v2/payloads";
import { AnswerText } from "./components/AnswerText";
import { CitationPanel } from "./components/CitationPanel";
import { useAsk, type Turn } from "./useAsk";

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 2017 }, (_, i) => THIS_YEAR - i);
const ROUNDS = Array.from({ length: 24 }, (_, i) => i + 1);

const TOOL_LABEL: Record<string, string> = {
  search_documents: "FIA regulations and stewards' decisions",
  search_race_data: "our race data",
};
const ERROR_HELP: Record<string, { text: string; retry: boolean }> = {
  auth_expired: { text: "The assistant is offline: its Claude login has expired and the operator needs to renew it. Asking again will not help until then.", retry: false },
  rate_limited: { text: "The assistant has reached its usage limit. Wait a few minutes, then retry.", retry: true },
  llm_failed: { text: "The assistant could not produce an answer this time. Retry, or rephrase the question.", retry: true },
  timeout: { text: "The assistant took too long to answer. Retry, or ask a narrower question.", retry: true },
  internal: { text: "The assistant failed unexpectedly. Retry in a moment.", retry: true },
  network: { text: "The connection failed.", retry: true },
};

function TurnView({ turn, onOpen, onRetry }: { turn: Turn; onOpen: (c: AssistantCitation) => void; onRetry: () => void }) {
  const { body, done, error } = turn;
  const help = error ? ERROR_HELP[error.code] ?? { text: error.message, retry: true } : null;
  return (
    <VStack gap={2}>
      <div className="f1-turn-q">
        <Text>{body.question}</Text>
        {body.year ? <Text color="secondary" className="f1-num"> {body.year} round {body.round ?? "any"}</Text> : null}
      </div>
      <Card padding={4}>
        <VStack gap={3} aria-busy={turn.running}>
          {turn.running ? (
            <OrbStatus phase={turn.phase} message={turn.reconnecting ? `Connection dropped, reconnecting (attempt ${turn.reconnecting})` : turn.statusMessage} />
          ) : null}

          {done?.not_found ? (
            <VStack gap={1}>
              <Heading level={3}>Evidence not found</Heading>
              <Text>
                The assistant searched {done.tools_used.length ? done.tools_used.map((t) => TOOL_LABEL[t] ?? t.replace(/_/g, " ")).join(" and ") : "the available sources"} and found nothing
                relevant to answer from. It only answers from those documents, so it will not guess. Try rephrasing, or add a year and round.
              </Text>
            </VStack>
          ) : turn.text ? (
            <AnswerText text={turn.text} citations={turn.citations} onOpen={onOpen} />
          ) : null}

          {turn.citations && turn.citations.length > 0 ? (
            <VStack gap={1} as="section" aria-label="Sources">
              <Text weight="semibold">Sources</Text>
              <VStack gap={1} as="ol" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {turn.citations.map((c) => (
                  <li key={c.id}>
                    <HStack gap={2} align="center">
                      <button type="button" className="f1-chip" onClick={() => onOpen(c)} aria-label={`Source ${c.n}: ${c.title}. Open details`}>{c.n}</button>
                      <Text color="secondary">{c.title}{c.article ? `, Article ${c.article}` : ""}{c.page ? `, page ${c.page}` : ""}</Text>
                    </HStack>
                  </li>
                ))}
              </VStack>
            </VStack>
          ) : null}

          {done?.long_quotes ? <Text color="secondary">Some quotations in this answer are longer than the 300-character limit. Check the source before relying on the wording.</Text> : null}
          {done?.invalid_citations?.length ? <Text color="secondary">The answer referenced {done.invalid_citations.join(", ")}, which are not among its sources. Treat those statements as unverified.</Text> : null}

          {done ? (
            <Text color="secondary" className="f1-num" style={{ fontSize: "0.85em" }}>
              {done.grounded ? "Grounded in the sources" : "Not fully grounded"} · {done.rounds} {done.rounds === 1 ? "round" : "rounds"} · {done.evidence_items} evidence items · cost ${done.cost_usd.toFixed(3)}
            </Text>
          ) : null}

          {error && help ? (
            <VStack gap={2} role="alert">
              <Text weight="semibold">Something went wrong</Text>
              <Text>{help.text}</Text>
              {error.code !== "network" ? <Text color="secondary" className="f1-num">Code: {error.code}</Text> : <Text color="secondary">{error.message}</Text>}
              {help.retry ? <div><Button label="Retry" variant="secondary" onClick={onRetry} /></div> : null}
            </VStack>
          ) : null}

          {turn.cancelled ? (
            <HStack gap={3} align="center">
              <Text color="secondary">Cancelled.</Text>
              <Button label="Ask again" variant="ghost" size="sm" onClick={onRetry} />
            </HStack>
          ) : null}
        </VStack>
      </Card>
    </VStack>
  );
}

/** `/stewards`: chat over the rules and stewards' decisions, streamed, with source chips and a side panel. */
export function Stewards() {
  const { turns, send, retry, cancel, busy } = useAsk();
  const reduced = usePrefersReducedMotion();
  const [question, setQuestion] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [round, setRound] = useState<number | "">("");
  const [open, setOpen] = useState<AssistantCitation | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" }); }, [turns.length, reduced]);
  const last = turns.at(-1);
  // Screen-reader status: phase changes while running, then one line when it ends. Tokens are not announced.
  const announce = !last ? "" : last.running ? last.statusMessage : last.error ? "The answer failed." : last.cancelled ? "Cancelled." : last.done ? "Answer ready." : "";

  const submit = (q: string, y: number | "" = year, r: number | "" = round) => {
    const text = q.trim();
    if (!text || busy) return;
    const body: AskBody = { question: text };
    if (y !== "") { body.year = y; if (r !== "") body.round = r; }
    send(body);
    setQuestion("");
  };

  const raceStarter = () => {
    const y = year === "" ? 2024 : year;
    const r = round === "" ? 8 : round;
    setYear(y); setRound(r);
    submit("Was the penalty at this race consistent with past decisions?", y, r);
  };

  return (
    <VStack gap={4} padding={4} style={{ maxWidth: 860, margin: "0 auto", minHeight: "100vh" }}>
      <VStack gap={1}>
        <Heading level={1}>Ask the stewards</Heading>
        <Text color="secondary">Answers come only from FIA regulations, stewards&apos; decisions and our race data. Every claim points to its source, and when there is no evidence it says so.</Text>
      </VStack>

      <div className="f1-sr-only" role="status" aria-live="polite">{announce}</div>

      {turns.length === 0 ? (
        <Card padding={4}>
          <VStack gap={3}>
            <Text weight="semibold">Try one of these</Text>
            <HStack gap={2} wrap="wrap">
              <Button label="What does Article 33.4 say?" variant="secondary" onClick={() => submit("What does Article 33.4 say?")} />
              <Button label="What is the penalty for causing a collision?" variant="secondary" onClick={() => submit("What is the penalty for causing a collision?")} />
              <Button label="Was the penalty at this race consistent with past decisions?" variant="secondary" onClick={raceStarter} />
            </HStack>
            <Text color="secondary">The last one uses the race chosen below (2024 round 8 if none is chosen).</Text>
          </VStack>
        </Card>
      ) : (
        <VStack gap={4}>
          {turns.map((t) => (
            <TurnView key={t.id} turn={t} onOpen={setOpen} onRetry={() => retry(t.id)} />
          ))}
        </VStack>
      )}

      <div ref={end} />

      <form
        onSubmit={(e) => { e.preventDefault(); submit(question); }}
        style={{ position: "sticky", bottom: 0, paddingBlock: 12, background: "var(--color-background-body)" }}
      >
        <VStack gap={2}>
          <textarea
            className="f1-textarea"
            aria-label="Your question"
            placeholder="Ask about a regulation or a stewards' decision"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(question); } }}
          />
          <HStack gap={3} wrap="wrap" align="center" justify="between">
            <HStack gap={2} align="center" wrap="wrap">
              <Text color="secondary" as="span">Race (optional)</Text>
              <select className="f1-select" aria-label="Year" value={year} onChange={(e) => { const v = e.target.value; setYear(v === "" ? "" : Number(v)); if (v === "") setRound(""); }}>
                <option value="">Any year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className="f1-select" aria-label="Round" value={round} disabled={year === ""} onChange={(e) => setRound(e.target.value === "" ? "" : Number(e.target.value))}>
                <option value="">Any round</option>
                {ROUNDS.map((r) => <option key={r} value={r}>Round {r}</option>)}
              </select>
            </HStack>
            <HStack gap={2}>
              {busy ? <Button label="Cancel" variant="secondary" onClick={cancel} /> : null}
              <Button label="Ask" variant="primary" type="submit" isDisabled={busy || !question.trim()} />
            </HStack>
          </HStack>
        </VStack>
      </form>

      <CitationPanel citation={open} onClose={() => setOpen(null)} />
    </VStack>
  );
}
