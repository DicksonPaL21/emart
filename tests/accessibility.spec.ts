import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("200% text resize and forced colors retain usable controls", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/setting');
  await page.addStyleTag({content:'html { font-size: 200%; }'});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({forcedColors:'active'});
  await page.getByLabel('Random MAC', {exact:true}).focus();
  await page.keyboard.press('Space');
  await expect(page.getByLabel('Random MAC', {exact:true})).toBeChecked();
  await expect(page.locator('#macInterval')).toBeEnabled();
});

test("calculator is accessible at 320px with reduced motion and dismisses by Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Calculator", exact: true }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(await page.getByRole("dialog").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Calculator", exact: true })).toBeFocused();
});
test("skip link and route focus support keyboard navigation", async ({ page }) => {
  await page.goto("/about");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.getByRole("link", { name: "History", exact: true }).click();
  await expect(page.locator("main")).toBeFocused();
  await expect(page).toHaveTitle("History | EMART");
});
test("settings loaded flags correctly enable dependent controls; failure never says saved", async ({
  page,
}) => {
  await page.route("**/config.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ssidName: "EMART",
        ssidPassword: "password",
        ssidHidden: true,
        channel: 6,
        macAp: "AA:BB:CC:DD:EE:FF",
        randMacAp: true,
        macInterval: 30,
        serverUsername: "admin",
        serverPassword: "admin",
        wifiStatus: true,
        wifiName: "client",
        wifiPassword: "password",
      }),
    }),
  );
  await page.route("**/configSave.json*", (route) => route.fulfill({ status: 200, body: "false" }));
  await page.goto("/setting");
  await expect(page.locator("#macAp")).toBeDisabled();
  await expect(page.locator("#macInterval")).toBeEnabled();
  await expect(page.locator("#wifiName")).toBeEnabled();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status").first()).toContainText("response error configSave.json");
  await expect(page.getByText("saved", { exact: true })).toHaveCount(0);
});
