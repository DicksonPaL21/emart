"use client";
import { useEffect, useState } from "react";
import { DEBUG_MODE, deviceJson } from "@/lib/device";
import {
  accumulateDebugHistory,
  emptySummary,
  historyPage,
  type HistoryRow,
  type HistorySummary,
} from "@/lib/energy";
import { Panel, Metric } from "@/components/shared/panel";
import { Notice, useNotice } from "@/components/shared/notice";
import { Button } from "@/components/ui/button";

export function History() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [page, setPage] = useState(0);
  const { message, setMessage, fail } = useNotice();
  useEffect(() => {
    if (!DEBUG_MODE && !document.cookie) return;
    let disposed = false;
    let retry: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        if (DEBUG_MODE) {
          const now = Date.now();
          const demo: HistoryRow[] = Array.from({ length: 100 }, (_, index) => {
            const energy = Math.random();
            return [now + (index + 1) * 86400000, energy, energy * 5.68];
          });
          await Promise.resolve();
          if (!disposed) {
            setRows(demo);
            setSummary(accumulateDebugHistory(emptySummary, demo.slice(0, 20)));
          }
        } else {
          const data = await deviceJson<Partial<HistorySummary> & { history?: HistoryRow[] }>(
            "dataHistory.json",
            1000,
          );
          if (!disposed) {
            setSummary({ ...emptySummary, ...data });
            setRows(data.history ?? []);
          }
        }
      } catch (error) {
        if (!disposed) {
          fail(error);
          retry = setTimeout(load, 1000);
        }
      }
    }
    void load();
    return () => {
      disposed = true;
      clearTimeout(retry);
    };
  }, [fail]);
  const cost = (value: number) => `₱ ${value.toFixed(DEBUG_MODE ? 4 : 2)}`;
  return (
    <>
      <Notice message={message} dismiss={() => setMessage("")} />
      <div className="grid items-start gap-6 sm:grid-cols-[1fr_3fr]">
        <aside className="grid gap-2 xs:grid-cols-2 sm:grid-cols-1" aria-label="History summary">
          <Panel title="Electricity Cost">
            <Metric label="This Month" value={`₱ ${summary.electricityCost[0].toFixed(2)}`} />
            <Metric
              label="Last Month"
              tone="warning"
              value={`₱ ${summary.electricityCost[1].toFixed(2)}`}
            />
          </Panel>
          <Panel title="Energy Cost">
            {["Yesterday", "This Month", "Last Month"].map((label, index) => (
              <Metric
                key={label}
                label={label}
                tone={(["success", "warning", "destructive"] as const)[index]}
                value={cost(summary.energyCost[index + 1])}
              />
            ))}
          </Panel>
          <Panel title="Energy Consumption">
            {["Yesterday", "This Month", "Last Month"].map((label, index) => (
              <Metric
                key={label}
                label={label}
                tone={(["success", "warning", "destructive"] as const)[index]}
                value={`${summary.consumption[index + 1].toFixed(4)} kW`}
              />
            ))}
          </Panel>
          <Panel title="Total Consumed">
            <Metric label="Cost" value={cost(summary.totalConsumed[0])} />
            <Metric
              label="Energy"
              tone="warning"
              value={`${summary.totalConsumed[1].toFixed(4)} kW`}
            />
          </Panel>
        </aside>
        <Panel id="table" className="min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full tabular-nums">
              <caption className="sr-only">Energy consumption history</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Energy</th>
                  <th scope="col">Cost</th>
                </tr>
              </thead>
              <tbody>
                {historyPage(rows, page).map(([date, energy, amount]) => (
                  <tr key={date} className="hover:bg-secondary hover:text-card-foreground">
                    <td>{new Date(date).toDateString().slice(4)}</td>
                    <td>{energy.toFixed(4)} kW</td>
                    <td>₱ {amount.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav aria-label="History pages" className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: Math.ceil(rows.length / 20) }, (_, index) => (
              <Button
                key={index}
                size="sm"
                variant={page === index ? "default" : "secondary"}
                aria-current={page === index ? "page" : undefined}
                onClick={() => {
                  if (page === index) return;
                  setPage(index);
                  if (DEBUG_MODE)
                    setSummary((previous) =>
                      accumulateDebugHistory(previous, rows.slice(index * 20, index * 20 + 20)),
                    );
                  window.history.replaceState(null, "", "#table");
                  document.getElementById("table")?.scrollIntoView();
                }}
              >
                {index + 1}
              </Button>
            ))}
          </nav>
        </Panel>
      </div>
    </>
  );
}
