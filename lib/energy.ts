/** Preserve the device UI's variable precision, including its threshold behavior. */
export function allocatedDecimals(value: number): string {
  return value.toFixed(value < 10 ? 4 : value < 100 ? 3 : value < 1000 ? 2 : value < 10000 ? 1 : 0);
}
export function maskCapacity(value: number, capacity: number): number {
  for (const percentage of [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90]) {
    const limit = (percentage * capacity) / 100;
    if (value < limit) return limit;
  }
  return capacity;
}
export function calculateEnergy(
  voltage: number,
  amount: number,
  hours: number,
  cost: number,
  mode: string,
) {
  const power = mode === "Watts" ? amount : voltage * amount;
  return [1, hours, hours * 7, hours * 30, hours * 365].map((duration) => ({
    energy: allocatedDecimals((power * duration) / 1000),
    cost: allocatedDecimals(((power * duration) / 1000) * cost),
  }));
}
export type HistoryRow = [number, number, number];
export type HistorySummary = {
  electricityCost: number[];
  energyCost: number[];
  consumption: number[];
  totalConsumed: number[];
};
export const emptySummary: HistorySummary = {
  electricityCost: [0, 0],
  energyCost: [0, 0, 0, 0],
  consumption: [0, 0, 0, 0],
  totalConsumed: [0, 0],
};
export function historyPage(rows: HistoryRow[], page: number) {
  return rows.slice(page * 20, page * 20 + 20).reverse();
}
/** Debug history intentionally accumulates on each page visit, as in the original. */
export function accumulateDebugHistory(
  previous: HistorySummary,
  rows: HistoryRow[],
): HistorySummary {
  const result = {
    electricityCost: [5.68, 5.68],
    energyCost: [...previous.energyCost],
    consumption: [...previous.consumption],
    totalConsumed: [...previous.totalConsumed],
  };
  for (const [time, energy, cost] of rows) {
    if (new Date(time).getDate() === 1) {
      result.consumption[3] = result.consumption[2];
      result.energyCost[3] = result.energyCost[2];
      result.consumption[2] = 0;
      result.energyCost[2] = 0;
    }
    result.consumption[1] = energy;
    result.energyCost[1] = cost;
    result.consumption[2] += energy;
    result.energyCost[2] += cost;
    result.totalConsumed[0] += cost;
    result.totalConsumed[1] += energy;
  }
  return result;
}
