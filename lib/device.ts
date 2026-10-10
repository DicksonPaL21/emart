export const DEBUG_MODE = process.env.NEXT_PUBLIC_EMART_DEBUG !== "false";
export type Switches = { name: string[]; state: (number | boolean)[] };
export type DashboardData = {
  capacity: number[];
  chart: number[];
  consumption: number[];
  electricityCost: number[];
  estimatedCost: number[];
  switches: Switches;
};
export const initialDashboard: DashboardData = {
  capacity: [260, 100, 26000, 99999],
  chart: [0, 0, 0, 0],
  consumption: [0, 0],
  electricityCost: [0],
  estimatedCost: [0, 0],
  switches: { name: ["Switch 1", "Switch 2", "Switch 3", "Switch 4"], state: [0, 0, 0, 0] },
};
export async function deviceRequest(path: string, timeout = 8000): Promise<string> {
  try {
    const response = await fetch(`/${path}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      signal: AbortSignal.timeout(timeout),
    });
    if (response.status !== 200) throw new Error("Unexpected device status");
    return await response.text();
  } catch {
    throw new Error(`error loading ${path.split("?")[0]}`);
  }
}
export async function deviceJson<T>(path: string, timeout = 8000): Promise<T> {
  const text = await deviceRequest(path, timeout);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Error: getting ${path}.`);
  }
}
export async function deviceSave(path: string): Promise<void> {
  if ((await deviceRequest(path)) !== "true")
    throw new Error(`response error ${path.split("?")[0]}`);
}
export function vibrate() {
  navigator.vibrate?.([40, 60, 70]);
}
export type DeviceConfig = {
  ssidName: string;
  ssidPassword: string;
  ssidHidden: boolean;
  channel: string | number;
  macAp: string;
  randMacAp: boolean;
  macInterval: string | number;
  serverUsername: string;
  serverPassword: string;
  wifiStatus: boolean;
  wifiName: string;
  wifiPassword: string;
};
export const emptyConfig: DeviceConfig = {
  ssidName: "",
  ssidPassword: "",
  ssidHidden: false,
  channel: "",
  macAp: "",
  randMacAp: false,
  macInterval: "",
  serverUsername: "",
  serverPassword: "",
  wifiStatus: false,
  wifiName: "",
  wifiPassword: "",
};
/** Keep GET endpoints, names, ordering and conditional fields of the firmware contract. */
export function configSaveUrl(config: DeviceConfig) {
  let query = `ssidName=${config.ssidName}&ssidPassword=${config.ssidPassword}&ssidHidden=${config.ssidHidden}&channel=${config.channel}`;
  query += config.randMacAp
    ? `&randMacAp=true&macInterval=${config.macInterval}`
    : `&macAp=${config.macAp}&randMacAp=false`;
  query += `&serverUsername=${config.serverUsername}&serverPassword=${config.serverPassword}&wifiStatus=${config.wifiStatus}`;
  if (config.wifiStatus)
    query += `&wifiName=${config.wifiName}&wifiPassword=${config.wifiPassword}`;
  return `configSave.json?${query}`;
}
