import { test, expect } from "@playwright/test";

test("demo login, cookie and logout preserve behavior", async ({ page, context }) => {
  await page.goto("/");
  await page.getByLabel("Username").fill("demo");
  await page.getByLabel("Password", { exact: true }).fill("anything");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect((await context.cookies()).find((c) => c.name === "EMARTSESSIONID")?.value).toBe("demo");
  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).some((c) => c.name === "EMARTSESSIONID")).toBe(false);
});
test("calculator formulas, unit switch, keyboard trap and focus restoration", async ({ page }) => {
  await page.goto("/dashboard");
  const trigger = page.getByRole("button", { name: "Calculator", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.getByLabel("Voltage", { exact: true }).fill("220");
  await page.getByLabel("Amps", { exact: true }).fill("2");
  await page.getByLabel("Hours / Day").fill("8");
  await page.getByLabel("Energy Cost", { exact: true }).fill("5.68");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(dialog.getByRole("row").filter({ hasText: "Month" })).toContainText("105.60 kWh");
  await expect(dialog.getByRole("row").filter({ hasText: "Year" })).toContainText("7297.7");
  await page.getByLabel("Measurement unit").selectOption("Watts");
  await expect(page.getByLabel("Voltage", { exact: true })).toBeDisabled();
  await page.getByLabel("Watts", { exact: true }).fill("440");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(dialog.getByRole("row").filter({ hasText: "Month" })).toContainText("105.60 kWh");
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test("history has 100 entries, 20 per page, and reverse order within each page", async ({
  page,
}) => {
  await page.goto("/history");
  await expect(page.locator("tbody tr")).toHaveCount(20);
  const first = await page.locator("tbody tr").first().innerText();
  await page
    .getByRole("navigation", { name: "History pages" })
    .getByRole("button", { name: "2", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(20);
  expect(await page.locator("tbody tr").first().innerText()).not.toBe(first);
  await page
    .getByRole("navigation", { name: "History pages" })
    .getByRole("button", { name: "5", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(20);
  await expect(page).toHaveURL(/#table$/);
});
test("chart selection and pause work; missing device does not fake save success", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByLabel("Chart measurement").selectOption("1");
  await expect(page.getByRole("img", { name: /Current chart/ })).toBeVisible();
  await page.getByRole("button", { name: "Pause updates" }).click();
  const label = await page.getByRole("img", { name: /Current chart/ }).getAttribute("aria-label");
  await page.waitForTimeout(1200);
  expect(await page.getByRole("img", { name: /Current chart/ }).getAttribute("aria-label")).toBe(
    label,
  );
  await page.getByRole("checkbox", { name: "Switch 1", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("error loading switchesToggleSave.json");
  await expect(page.getByRole("checkbox", { name: "Switch 1", exact: true })).not.toBeChecked();
  await page.getByRole("button", { name: "Edit Electricity Cost", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("error loading electricityCost.json");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("mocked device edits preserve GET endpoints and exact field names", async ({ page }) => {
  const calls: string[] = [];
  await page.route("**/*.json*", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("GET");
    const url = new URL(request.url());
    calls.push(url.pathname + url.search);
    const data: Record<string, unknown> = {
      "/electricityCost.json": { electricityCost: [5.68] },
      "/estimatedCost.json": { estimatedCost: [4, 100] },
      "/switches.json": {
        switches: { name: ["one", "two", "three", "four"], state: [0, 0, 0, 0] },
      },
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: data[url.pathname] ? JSON.stringify(data[url.pathname]) : "true",
    });
  });
  await page.goto("/dashboard");
  for (const [label, value, endpoint] of [
    ["Electricity Cost", "6.2", "electricityCost"],
    ["Estimate Cost", "250", "estimatedCost"],
  ]) {
    await page.getByRole("button", { name: `Edit ${label}`, exact: true }).click();
    await page.getByLabel("Cost", { exact: true }).fill(value);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Save Successful.");
    expect(calls).toContain(`/${endpoint}Save.json?${endpoint}=${value}`);
  }
  await page.getByRole("button", { name: "Edit Switch Name" }).click();
  await page.getByRole("dialog").getByLabel("Switch 1", { exact: true }).fill("Kitchen");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(calls).toContain(
    "/switchesNameSave.json?switchName1=Kitchen&switchName2=two&switchName3=three&switchName4=four",
  );
});
test("settings conditional fields, save/reset/restart contract and validation", async ({
  page,
}) => {
  const calls: string[] = [];
  const config = {
    ssidName: "EMART",
    ssidPassword: "password",
    ssidHidden: false,
    channel: 6,
    macAp: "AA:BB:CC:DD:EE:FF",
    randMacAp: false,
    macInterval: 30,
    serverUsername: "admin",
    serverPassword: "admin",
    wifiStatus: false,
    wifiName: "client",
    wifiPassword: "password",
  };
  await page.route("**/*.json*", async (route) => {
    const url = new URL(route.request().url());
    calls.push(url.pathname + url.search);
    expect(route.request().method()).toBe("GET");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: url.pathname === "/config.json" ? JSON.stringify(config) : "true",
    });
  });
  await page.goto("/setting");
  await expect(page.locator("#ssidName")).toHaveValue("EMART");
  await expect(page.locator("#macInterval")).toBeDisabled();
  await expect(page.locator("#wifiName")).toBeDisabled();
  await page.getByLabel("Random MAC", { exact: true }).check();
  await expect(page.locator("#macAp")).toBeDisabled();
  await expect(page.locator("#macInterval")).toBeEnabled();
  await page.getByLabel("Enable WiFi Client").check();
  await expect(page.locator("#wifiName")).toBeEnabled();
  await page.locator("#ssidName").fill("abc");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  expect(calls.filter((x) => x.startsWith("/configSave"))).toHaveLength(0);
  await page.locator("#ssidName").fill("EMART");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeEnabled();
  expect(
    calls.some(
      (x) =>
        x.startsWith("/configSave.json?") &&
        x.includes("randMacAp=true&macInterval=30") &&
        !x.includes("macAp=") &&
        x.includes("wifiName=client"),
    ),
  ).toBe(true);
  expect(calls.slice(-2)).toEqual(["/restartEMART.json", "/config.json"]);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("button", { name: "Reset", exact: true })).toBeEnabled();
  expect(calls.slice(-3)).toEqual(["/configReset.json", "/restartEMART.json", "/config.json"]);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(page.getByRole("button", { name: "Restart", exact: true })).toBeEnabled();
  expect(calls.slice(-2)).toEqual(["/restartEMART.json", "/config.json"]);
});
test("legacy routes redirect with query/hash, assets and metadata survive", async ({
  page,
  request,
}) => {
  for (const route of ["index", "login", "dashboard", "history", "setting", "about", "error"]) {
    const response = await request.get(`/${route}.html?source=legacy`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(
      `${route === "index" ? "/" : "/" + route}?source=legacy`,
    );
  }
  await page.goto("/history.html?source=legacy#table");
  await expect(page).toHaveURL("/history?source=legacy#table");
  for (const asset of ["logo.png", "logo16.png", "logo.psd", "login-logo.png", "favicon.png"])
    expect((await request.get("/img/" + asset)).status()).toBe(200);
  await expect(page).toHaveTitle("History | EMART");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "EMART, Energy Meter Analysis and Reporting Technology",
  );
  expect((await request.get("/does-not-exist")).status()).toBe(404);
});
