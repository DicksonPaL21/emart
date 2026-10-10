import { test, expect } from "@playwright/test";
test.use({ baseURL: "http://127.0.0.1:3002" });

test("live mode retains cookie guard and unauthenticated About navigation", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/about");
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Login", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Logout" })).toHaveCount(0);
});
test("live dashboard consumes initial HTTP data, socket updates and refresh sends", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "EMARTSESSIONID", value: "demo", url: "http://127.0.0.1:3002" },
  ]);
  const initial = {
    capacity: [260, 100, 26000, 99999],
    consumption: [1.5, 2.5],
    electricityCost: [5.68],
    estimatedCost: [100, 200],
    switches: { name: ["Kitchen", "Bedroom", "Office", "Other"], state: [0, 1, 0, 0] },
  };
  await page.route("**/dataDashboard.json", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(initial) }),
  );
  await page.route("**/switchesToggleSave.json?switch1=true", (route) =>
    route.fulfill({ status: 200, body: "true" }),
  );
  let send: ((data: string) => void) | undefined;
  const messages: string[] = [];
  await page.routeWebSocket("ws://127.0.0.1:81/dashboard", (socket) => {
    send = (data) => socket.send(data);
    socket.onMessage((data) => {
      messages.push(String(data));
      socket.send(JSON.stringify({ switches: { ...initial.switches, state: [1, 1, 0, 0] } }));
    });
  });
  await page.goto("/dashboard");
  await expect(page.getByText("1.5000 kWh", { exact: true })).toBeVisible();
  await expect.poll(() => Boolean(send)).toBe(true);
  send!(JSON.stringify({ chart: [230, 2, 460, 1000], consumption: [3, 2.5] }));
  await expect(page.getByRole("figure", { name: "Voltage: 230.00 V" })).toBeVisible();
  await expect(page.getByText("3.0000 kWh", { exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Bedroom", exact: true })).toBeChecked();
  await page.getByRole("checkbox", { name: "Kitchen", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Kitchen", exact: true })).toBeChecked();
  expect(messages).toContain("");
});
test("live history uses device values, reverse slices and unchanged units", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "EMARTSESSIONID", value: "demo", url: "http://127.0.0.1:3002" },
  ]);
  const history = Array.from({ length: 25 }, (_, i) => [
    new Date(2026, 0, i + 1).getTime(),
    i + 1,
    (i + 1) * 5.68,
  ]);
  await page.route("**/dataHistory.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        electricityCost: [5.68, 6],
        energyCost: [0, 4, 5, 6],
        consumption: [0, 7, 8, 9],
        totalConsumed: [10, 11],
        history,
      }),
    }),
  );
  await page.goto("/history");
  await expect(page.locator("tbody tr")).toHaveCount(20);
  await expect(page.locator("tbody tr").first()).toContainText("20.0000 kW");
  await page
    .getByRole("navigation", { name: "History pages" })
    .getByRole("button", { name: "2", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await expect(page.locator("tbody tr").first()).toContainText("25.0000 kW");
  await expect(page.getByText("11.0000 kW", { exact: true })).toBeVisible();
});
