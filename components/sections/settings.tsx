"use client";
import { useEffect, useState } from "react";
import {
  DEBUG_MODE,
  configSaveUrl,
  deviceJson,
  deviceSave,
  emptyConfig,
  type DeviceConfig,
} from "@/lib/device";
import { Panel } from "@/components/shared/panel";
import { filterAlphaNumeric, Notice, useNotice } from "@/components/shared/notice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Settings() {
  const [config, setConfig] = useState(emptyConfig);
  const [pending, setPending] = useState(false);
  const [indicator, setIndicator] = useState("");
  const { message, setMessage, fail } = useNotice();
  useEffect(() => {
    if (!DEBUG_MODE && !document.cookie) return;
    let disposed = false;
    deviceJson<DeviceConfig>("config.json")
      .then((data) => {
        if (!disposed) setConfig(data);
      })
      .catch((error) => {
        if (!disposed) fail(error);
      });
    return () => {
      disposed = true;
    };
  }, [fail]);
  async function restart() {
    await deviceSave("restartEMART.json");
    setMessage("getting configuration.");
    setConfig(await deviceJson<DeviceConfig>("config.json"));
  }
  async function action(kind: "save" | "reset" | "restart") {
    setPending(true);
    try {
      if (kind !== "restart") {
        setIndicator("saving...");
        await deviceSave(kind === "save" ? configSaveUrl(config) : "configReset.json");
        setIndicator("saved");
      }
      await restart();
    } catch (error) {
      setIndicator("");
      fail(error);
    } finally {
      setPending(false);
    }
  }
  function field(
    name: keyof DeviceConfig,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) {
    return (
      <div className="grid items-center gap-2 xs:grid-cols-2">
        <label htmlFor={name}>{label}</label>
        <Input
          {...props}
          id={name}
          name={name}
          value={String(config[name])}
          required
          spellCheck={false}
          onChange={(event) =>
            setConfig((previous) => ({ ...previous, [name]: event.target.value }))
          }
          onKeyDown={
            props.type === "number" ? undefined : (event) => filterAlphaNumeric(event, setMessage)
          }
        />
      </div>
    );
  }
  function checkbox(name: "ssidHidden" | "randMacAp" | "wifiStatus", label: React.ReactNode) {
    return (
      <label className="flex min-h-9 items-center justify-between gap-3">
        <span>{label}</span>
        <input
          id={name}
          name={name}
          type="checkbox"
          className="size-5 shrink-0 accent-primary"
          checked={config[name]}
          onChange={(event) =>
            setConfig((previous) => ({ ...previous, [name]: event.target.checked }))
          }
        />
      </label>
    );
  }
  return (
    <>
      <Notice message={message} dismiss={() => setMessage("")} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void action("save");
        }}
      >
        <div className="grid items-start gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3">WiFi Server</h2>
            <Panel className="space-y-4">
              {field("ssidName", "SSID", { minLength: 5, maxLength: 32, autoFocus: true })}
              {field("ssidPassword", "Password (min.8 chars)", { minLength: 8, maxLength: 32 })}
              {checkbox(
                "ssidHidden",
                <>
                  Hide SSID{" "}
                  <span className="text-destructive">(be careful with this setting!)</span>
                </>,
              )}
              {field("channel", "Channel", { type: "number", min: 1, max: 14 })}
              {field("macAp", "MAC", {
                minLength: 17,
                maxLength: 17,
                disabled: config.randMacAp,
                className: "uppercase",
              })}
              {checkbox("randMacAp", "Random MAC")}
              {field("macInterval", "MAC Change Interval (min)", {
                type: "number",
                min: 30,
                max: 86400,
                disabled: !config.randMacAp,
              })}
            </Panel>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="mb-3">WiFi Client</h2>
              <Panel className="space-y-4">
                {checkbox("wifiStatus", "Enable WiFi Client")}
                {field("wifiName", "SSID", {
                  minLength: 5,
                  maxLength: 32,
                  disabled: !config.wifiStatus,
                })}
                {field("wifiPassword", "Password", {
                  minLength: 8,
                  maxLength: 32,
                  disabled: !config.wifiStatus,
                })}
              </Panel>
            </div>
            <div>
              <h2 className="mb-3">Web Server</h2>
              <Panel className="space-y-4">
                {field("serverUsername", "Username", {
                  minLength: 5,
                  maxLength: 16,
                  autoComplete: "username",
                })}
                {field("serverPassword", "Password (min.5 chars)", {
                  minLength: 5,
                  maxLength: 32,
                  autoComplete: "off",
                })}
              </Panel>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="text-destructive"
            disabled={pending}
            onClick={() => void action("reset")}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="text-destructive"
            disabled={pending}
            onClick={() => void action("restart")}
          >
            Restart
          </Button>
          <p role="status" className="ml-auto">
            {indicator}
          </p>
          <Button type="submit" disabled={pending}>
            Save
          </Button>
        </div>
      </form>
    </>
  );
}
