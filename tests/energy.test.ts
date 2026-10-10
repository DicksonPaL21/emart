import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allocatedDecimals,
  calculateEnergy,
  maskCapacity,
  historyPage,
  accumulateDebugHistory,
  emptySummary,
  type HistoryRow,
} from "../lib/energy.ts";
import { configSaveUrl, emptyConfig } from "../lib/device.ts";

test("precision and gauge thresholds retain verified reference outputs", () => {
  // Recorded from the original dashboard functions before legacy-source removal.
  const cases: [number, number, string][] = [
    [0, 2.6, "0.0000"],
    [0.001, 2.6, "0.0010"],
    [2.5999, 2.6, "2.5999"],
    [2.6, 13, "2.6000"],
    [9.9999, 13, "9.9999"],
    [10, 13, "10.000"],
    [13, 26, "13.000"],
    [26, 52, "26.000"],
    [99.99, 104, "99.990"],
    [100, 104, "100.00"],
    [234, 260, "234.00"],
    [260, 260, "260.00"],
    [999, 260, "999.00"],
    [1000, 260, "1000.0"],
    [9999, 260, "9999.0"],
    [10000, 260, "10000"],
  ];
  for (const [value, capacity, formatted] of cases) {
    assert.equal(maskCapacity(value, 260), capacity);
    assert.equal(allocatedDecimals(value), formatted);
  }
});
test("calculator retains hourly/daily/weekly/monthly/yearly formulas and Watts bypass", () => {
  const result = calculateEnergy(220, 2, 8, 5.68, "Amps");
  assert.deepEqual(result, [
    { energy: "0.4400", cost: "2.4992" },
    { energy: "3.5200", cost: "19.994" },
    { energy: "24.640", cost: "139.96" },
    { energy: "105.60", cost: "599.81" },
    { energy: "1284.8", cost: "7297.7" },
  ]);
  assert.deepEqual(calculateEnergy(0, 440, 8, 5.68, "Watts"), result);
});
test("history reverses only the selected 20-row slice and retains demo accumulation", () => {
  const rows: HistoryRow[] = Array.from({ length: 41 }, (_, i) => [
    new Date(2026, 0, i + 1).getTime(),
    1,
    5.68,
  ]);
  assert.equal(historyPage(rows, 0)[0][0], rows[19][0]);
  assert.equal(historyPage(rows, 1)[0][0], rows[39][0]);
  assert.equal(historyPage(rows, 2).length, 1);
  const first = accumulateDebugHistory(emptySummary, rows.slice(0, 20));
  const second = accumulateDebugHistory(first, rows.slice(20, 40));
  assert.equal(first.totalConsumed[1], 20);
  assert.equal(second.totalConsumed[1], 40);
  assert.equal(second.consumption[3], 31);
  assert.equal(second.consumption[2], 9);
  assert.equal(accumulateDebugHistory(second, rows.slice(20, 40)).totalConsumed[1], 60);
});
test("settings preserves firmware field names and conditional parameter omission", () => {
  const base = {
    ...emptyConfig,
    ssidName: "emart",
    ssidPassword: "password",
    channel: 6,
    macAp: "AA:BB:CC:DD:EE:FF",
    serverUsername: "admin",
    serverPassword: "admin",
  };
  assert.equal(
    configSaveUrl(base),
    "configSave.json?ssidName=emart&ssidPassword=password&ssidHidden=false&channel=6&macAp=AA:BB:CC:DD:EE:FF&randMacAp=false&serverUsername=admin&serverPassword=admin&wifiStatus=false",
  );
  const query = configSaveUrl({
    ...base,
    randMacAp: true,
    macInterval: 30,
    wifiStatus: true,
    wifiName: "client",
    wifiPassword: "password",
  });
  assert.ok(!query.includes("macAp="));
  assert.ok(query.includes("randMacAp=true&macInterval=30"));
  assert.ok(query.endsWith("wifiStatus=true&wifiName=client&wifiPassword=password"));
});
