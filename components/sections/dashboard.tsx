"use client";
import { useEffect, useRef, useState } from "react";
import {
  DEBUG_MODE,
  deviceJson,
  deviceSave,
  initialDashboard,
  type DashboardData,
} from "@/lib/device";
import { Panel, Metric } from "@/components/shared/panel";
import { Notice, useNotice } from "@/components/shared/notice";
import { Calculator } from "./calculator";
import { DeviceEditor } from "./device-editor";
import { Gauges, MeterChart } from "./meter-chart";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const [data, setData] = useState(initialDashboard);
  const [series, setSeries] = useState<number[][]>(() =>
    Array.from({ length: 3 }, () => Array(100).fill(0)),
  );
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<number | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const capacity = useRef(initialDashboard.capacity);
  const pausedRef = useRef(false);
  const { message, setMessage, fail } = useNotice();
  useEffect(() => {
    // Do not open a reload-on-error socket while the navigation guard redirects.
    if (!DEBUG_MODE && !document.cookie) return;
    let disposed = false;
    let retry: ReturnType<typeof setTimeout>;
    function update(incoming: Partial<DashboardData>) {
      if (disposed) return;
      if (incoming.capacity) capacity.current = incoming.capacity;
      if (pausedRef.current) {
        // Pausing telemetry must not hide acknowledgements of switch commands.
        if (incoming.switches)
          setData((previous) => ({ ...previous, switches: incoming.switches! }));
        return;
      }
      setData((previous) => ({ ...previous, ...incoming }));
      if (incoming.chart)
        setSeries((previous) =>
          previous.map((values, index) => [
            ...values.slice(1),
            Math.min(incoming.chart![index], capacity.current[index]),
          ]),
        );
    }
    if (DEBUG_MODE) {
      const timer = setInterval(() => {
        const voltage = 220 + Math.random() + Math.random() + Math.random();
        const current = Math.random();
        const power = voltage * current;
        update({ chart: [voltage, current, power, power] });
      }, 1000);
      return () => {
        disposed = true;
        clearInterval(timer);
      };
    }
    async function query() {
      try {
        update(await deviceJson<DashboardData>("dataDashboard.json", 1000));
      } catch (error) {
        if (!disposed) {
          fail(error);
          retry = setTimeout(query, 1000);
        }
      }
    }
    void query();
    const ws = new WebSocket(`ws://${window.location.hostname}:81${window.location.pathname}`);
    socket.current = ws;
    ws.onmessage = (event) => {
      try {
        update(JSON.parse(event.data));
      } catch {
        fail(new Error("error getting data dashboard."));
        update({ chart: [0, 0, 0, 0] });
      }
    };
    ws.onclose = ws.onerror = () => {
      if (!disposed) window.location.reload();
    };
    return () => {
      disposed = true;
      clearTimeout(retry);
      ws.close();
      socket.current = null;
    };
  }, [fail]);
  function refresh() {
    setMessage("Save Successful.");
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send("");
  }
  const progress = data.estimatedCost[1]
    ? Math.min(100, (data.estimatedCost[0] / data.estimatedCost[1]) * 100)
    : 0;
  const editor = (kind: "electricityCost" | "estimatedCost" | "switches") => (
    <DeviceEditor kind={kind} refresh={refresh} notify={fail} />
  );
  return (
    <>
      <Notice message={message} dismiss={() => setMessage("")} />
      <div className="grid items-start gap-6 md:grid-cols-[2fr_1fr] lg:grid-cols-[3fr_1fr]">
        <aside className="space-y-2 md:col-start-2 md:row-start-1" aria-label="Energy controls">
          <Calculator rate={data.electricityCost[0]} />
          <Panel title="Energy Consumption">
            <Metric label="Today" value={`${data.consumption[0].toFixed(4)} kWh`} />
            <Metric
              label="Yesterday"
              tone="warning"
              value={`${data.consumption[1].toFixed(4)} kWh`}
            />
          </Panel>
          <Panel title="Electricity Cost" action={editor("electricityCost")}>
            <Metric label="This Month" value={`₱ ${data.electricityCost[0].toFixed(2)}`} />
          </Panel>
          <Panel title="Estimation" action={editor("estimatedCost")}>
            <Metric label="Estimated" tone="info" value={`₱ ${data.estimatedCost[1].toFixed(2)}`} />
            <div
              className="h-3 overflow-hidden rounded-full bg-accent"
              role="meter"
              aria-label="Estimated bill used"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                style={{ width: `${progress}%` }}
                className={`h-full ${progress > 80 ? "bg-destructive" : progress > 50 ? "bg-warning" : "bg-success"}`}
              />
            </div>
            <p className="mt-1 text-center text-xs tabular-nums">
              {data.estimatedCost[0].toFixed(2)} / {data.estimatedCost[1].toFixed(2)}
            </p>
          </Panel>
          <Panel title="Control Panel" action={editor("switches")}>
            {data.switches.name.map((name, index) => (
              <label key={index} className="my-2 flex min-h-8 items-center justify-between gap-2">
                <span>{name}</span>
                <input
                  className="device-toggle"
                  type="checkbox"
                  checked={Boolean(data.switches.state[index])}
                  disabled={pendingSwitch !== null}
                  onChange={async (event) => {
                    const checked = event.target.checked;
                    setPendingSwitch(index);
                    try {
                      await deviceSave(`switchesToggleSave.json?switch${index + 1}=${checked}`);
                      refresh();
                    } catch (error) {
                      fail(error);
                    } finally {
                      setPendingSwitch(null);
                    }
                  }}
                />
              </label>
            ))}
          </Panel>
        </aside>
        <div className="min-w-0 space-y-2 md:col-start-1 md:row-start-1">
          <Panel>
            <Gauges values={data.chart} capacities={data.capacity} />
          </Panel>
          <Panel>
            <div className="mb-3 flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                motion="static"
                aria-pressed={paused}
                onClick={() => {
                  pausedRef.current = !paused;
                  setPaused(!paused);
                }}
              >
                {paused ? "Resume updates" : "Pause updates"}
              </Button>
              <label htmlFor="chart-metric" className="sr-only">
                Chart measurement
              </label>
              <select
                id="chart-metric"
                className="rounded-sm border border-input bg-card px-3 py-2"
                value={position}
                onChange={(event) => setPosition(Number(event.target.value))}
              >
                <option value={0}>Voltage</option>
                <option value={1}>Current</option>
                <option value={2}>Power</option>
              </select>
            </div>
            <MeterChart series={series} position={position} capacity={data.capacity[position]} />
          </Panel>
        </div>
      </div>
    </>
  );
}
