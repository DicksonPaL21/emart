import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const stage = process.argv[2] || "final";
await mkdir(`.verification/${stage}`, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];
try {
  for (const width of [320, 375, 768, 1280, 1920]) {
    for (const route of ["login", "dashboard", "history", "setting", "about", "error"]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:3000/${route}`);
      await page.waitForTimeout(1100);
      if (!(await page.evaluate(() => Array.from(document.styleSheets).some((sheet) => sheet.cssRules.length > 0)))) {
        throw new Error(`Stylesheet did not load for ${route} at ${width}px`);
      }
      if (route === "dashboard") await page.getByRole("button", { name: "Pause updates" }).click();
      await page.screenshot({
        path: `.verification/${stage}/${route}-${width}.png`,
        fullPage: true,
      });
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      report.push({
        route,
        width,
        errors,
        overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        violations: audit.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
      });
      await context.close();
    }
  }
  await writeFile(`.verification/${stage}/report.json`, JSON.stringify(report, null, 2));
  if (report.some((entry) => entry.errors.length || entry.overflow || entry.violations.length)) {
    process.exitCode = 1;
  }
  console.log(
    JSON.stringify(
      report.map((entry) => ({
        ...entry,
        violations: entry.violations.map((v) => ({ id: v.id, count: v.nodes.length })),
      })),
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
