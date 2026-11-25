import { expect, test } from "@playwright/test";

// Mock mode serves fixtures for the v2 endpoints (track map, mini-sectors, delta, telemetry, chaos, assistant).
// Flows follow plan 02, adapted to the real routes.

test("race hub: clicking a mini-sector opens the telemetry lab with start_m and end_m", async ({ page }) => {
  const labRequest = page.waitForRequest(
    (r) => r.url().includes("/telemetry/") && r.url().includes("start_m=") && r.url().includes("end_m=") && r.url().includes("format=columnar"),
  );
  await page.goto("/race/2024/8");
  const sector = page.locator('[data-sector="6"]'); // mini-sector 7
  await expect(sector).toBeVisible();
  await sector.dispatchEvent("click"); // the sector path sits under a wider outline path; a real click would hit the outline
  await expect(page).toHaveURL(/\/race\/2024\/8\/telemetry\?/);
  const url = new URL(page.url());
  expect(Number(url.searchParams.get("start_m"))).toBeLessThan(Number(url.searchParams.get("end_m")));
  const u = new URL((await labRequest).url());
  expect(Number(u.searchParams.get("start_m"))).toBeLessThan(Number(u.searchParams.get("end_m")));
  expect(u.searchParams.get("channels")).toContain("speed");
});

test("telemetry lab: scrubbing moves the map marker and the readout", async ({ page }) => {
  await page.goto("/race/2024/8/telemetry?drivers=NOR,PIA&lap=fastest");
  const plots = page.locator(".u-over");
  await expect(plots).toHaveCount(7); // delta + speed, throttle, brake, gear, rpm, drs
  const marker = page.locator('svg circle[r="34"]');
  await expect(marker).toHaveAttribute("visibility", "hidden");
  const box = (await plots.nth(2).boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.2, box.y + 10);
  await page.mouse.move(box.x + box.width * 0.4, box.y + 10);
  await expect(marker).toHaveAttribute("visibility", "visible");
  const cx1 = await marker.getAttribute("cx");
  await page.mouse.move(box.x + box.width * 0.8, box.y + 10);
  await expect.poll(async () => marker.getAttribute("cx")).not.toBe(cx1);
  await expect(page.getByText(/\d+ m/).first()).toBeVisible();
});

test("stewards: a question streams text and shows at least one citation chip", async ({ page }) => {
  await page.goto("/stewards");
  await page.getByLabel("Your question").fill("What does Article 33.4 say?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.locator(".f1-chip").first()).toBeVisible();
  await expect(page.getByText(/Based on the documents/)).toBeVisible();
  await page.locator(".f1-chip").first().click();
  await expect(page.getByRole("dialog")).toContainText("Evidence the answer rests on");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("stewards: a dropped stream reconnects and still finishes", async ({ page }) => {
  await page.goto("/stewards");
  await page.getByLabel("Your question").fill("drop the connection halfway");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByText(/Grounded in the sources/)).toBeVisible({ timeout: 30_000 });
});

test("chaos model page renders the calibration chart", async ({ page }) => {
  await page.goto("/chaos/model");
  await expect(page.getByRole("heading", { name: "Calibration and accuracy" })).toBeVisible();
  const chart = page.getByRole("img", { name: /Reliability diagram/ });
  await expect(chart).toBeVisible();
  await expect(chart.locator("canvas").first()).toBeVisible();
});

// Legacy leakage: the Astryx reset and theme must not change legacy pages after client navigation from a v2 page.
const snapshot = () => {
  const pick = (sel: string, props: string[]) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
  };
  return {
    body: pick("body", ["background-color", "color", "font-family", "margin", "line-height"]),
    html: pick("html", ["color-scheme"]),
    sidebar: pick("aside", ["background-color", "border-right-width", "padding"]),
    navLink: pick("aside nav a", ["padding", "font-size", "letter-spacing", "display"]),
    h1: pick("h1", ["font-size", "font-weight", "margin"]),
    button: pick("button", ["padding", "background-color", "font-family"]),
  };
};

test("legacy pages look the same after navigating from a v2 page", async ({ page, browser }) => {
  test.skip(process.env.E2E_MODE === "mock", "legacy pages always call the real backend, so this needs the live stack");
  // Baseline: a fresh load of the legacy page.
  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto("/season/2024");
  await fresh.locator("aside nav a").first().waitFor();
  const baseline = await fresh.evaluate(snapshot);

  // Client navigation: v2 race hub, then the legacy sidebar link to the season page.
  await page.goto("/race/2024/8");
  await expect(page.locator('[data-sector="0"]')).toBeVisible();
  await page.locator('aside nav a[href^="/season"]').click();
  await expect(page).toHaveURL(/\/season\//);
  await page.locator("aside nav a").first().waitFor();
  const after = await page.evaluate(snapshot);

  expect(after).toEqual(baseline);
});
