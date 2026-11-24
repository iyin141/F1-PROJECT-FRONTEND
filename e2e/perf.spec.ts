import { expect, test } from "@playwright/test";

// Interaction budget for the telemetry lab (plan 02: under 100 ms). `?bench=1` makes the page script 300 cursor
// moves across the synced plots once data is drawn and write the JS time per move to #lab-bench.
test("telemetry lab: cursor moves stay far inside the 100 ms interaction budget", async ({ page }) => {
  await page.goto("/race/2024/8/telemetry?drivers=NOR,PIA,VER&lap=fastest&bench=1");
  const out = page.locator("#lab-bench");
  await expect(out).toHaveAttribute("data-bench", /cursorMoves/);
  const r = JSON.parse((await out.getAttribute("data-bench"))!);
  expect(r.cursorMoves).toBe(300);
  expect(r.cursorP95Ms).toBeLessThan(16); // one frame; the plan budget is 100 ms
  expect(r.redrawAllMs).toBeLessThan(100);
});
