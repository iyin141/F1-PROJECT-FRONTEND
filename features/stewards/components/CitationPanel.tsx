"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { AssistantCitation } from "@/Lib/api/v2/payloads";

/** Side panel for one citation. Radix Dialog gives the focus trap, Escape to close and focus return to the chip. */
export function CitationPanel({ citation, onClose }: { citation: AssistantCitation | null; onClose: () => void }) {
  const c = citation;
  const meta = c ? [c.doc_type, c.article ? `Article ${c.article}` : null, c.page ? `page ${c.page}` : null, c.section, c.year, c.race].filter(Boolean).join(" · ") : "";
  return (
    <Dialog.Root open={c !== null} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Overlay className="f1-sheet-overlay" />
      <Dialog.Content className="f1-sheet" aria-describedby="f1-sheet-desc">
        {c ? (
          <VStack gap={3}>
            <Text className="f1-num" color="secondary">Source {c.n} of this answer</Text>
            <Dialog.Title asChild>
              <h2 style={{ margin: 0 }}>{c.title}</h2>
            </Dialog.Title>
            <Dialog.Description id="f1-sheet-desc" asChild>
              <Text color="secondary">{meta}</Text>
            </Dialog.Description>
            <Text weight="semibold">Evidence the answer rests on</Text>
            <blockquote className="f1-quote">
              <mark>{c.extract}</mark>
            </blockquote>
            <Text color="secondary">Up to 300 characters are quoted. Open the source for the full text.</Text>
            {c.url ? (
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="f1-link">
                Open the FIA source (new tab)
              </a>
            ) : (
              <Text color="secondary">No source link is available for this item.</Text>
            )}
            <Dialog.Close asChild>
              <Button label="Close" variant="secondary" />
            </Dialog.Close>
          </VStack>
        ) : null}
      </Dialog.Content>
    </Dialog.Root>
  );
}
