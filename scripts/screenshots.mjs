import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

async function shot(path, name, options = {}) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  if (options.tab) {
    await page.getByRole("tab", { name: options.tab }).click();
    await page.waitForTimeout(600);
  }
  // Let the fade-up entrance animations finish before capturing.
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${OUT}/${name}.png`,
    fullPage: options.fullPage ?? false,
  });
  console.log(`captured ${name}`);
}

// Find the demo evaluation id from the API.
const res = await page.request.get(`${BASE}/api/evaluations`);
const evaluations = await res.json();
const demo = evaluations.find(
  (e) => e.status === "complete" && e.organizationName === "Federal Acquisition Office"
);
if (!demo) throw new Error("No complete evaluation found — run the demo first");

await shot("/", "dashboard");
await shot("/evaluation/new", "new-evaluation");
await shot(`/evaluation/${demo.id}`, "overview");
await shot(`/evaluation/${demo.id}`, "agent-council", { tab: "Agent Council" });
await shot(`/evaluation/${demo.id}`, "risk-scorecard", { tab: "Risk" });
await shot(`/evaluation/${demo.id}`, "vendor-comparison", { tab: "Vendors" });
await shot(`/evaluation/${demo.id}`, "roadmap", { tab: "Roadmap" });

await browser.close();
console.log("done");
