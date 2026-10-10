"use client";
import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { deviceJson, deviceSave, type DashboardData } from "@/lib/device";
import { filterAlphaNumeric, Notice, useNotice } from "@/components/shared/notice";

export function DeviceEditor({
  kind,
  refresh,
  notify,
}: {
  kind: "electricityCost" | "estimatedCost" | "switches";
  refresh: () => void;
  notify: (error: unknown) => void;
}) {
  const [values, setValues] = useState<string[] | null>(null);
  const [pending, setPending] = useState(false);
  const { message, setMessage } = useNotice();
  const trigger = useRef<HTMLButtonElement>(null);
  const title =
    kind === "electricityCost"
      ? "Electricity Cost"
      : kind === "estimatedCost"
        ? "Estimate Cost"
        : "Switch Name";
  async function open() {
    setPending(true);
    try {
      const data = await deviceJson<DashboardData>(`${kind}.json`);
      setValues(
        kind === "switches"
          ? data.switches.name
          : [String(data[kind][kind === "estimatedCost" ? 1 : 0])],
      );
      setMessage("");
    } catch (error) {
      notify(error);
    } finally {
      setPending(false);
    }
  }
  return (
    <Dialog
      open={values !== null}
      onOpenChange={(open) => {
        if (!open) setValues(null);
      }}
    >
      <Button
        ref={trigger}
        variant="ghost"
        size="icon-sm"
        className="text-warning"
        type="button"
        aria-label={`Edit ${title}`}
        disabled={pending}
        onClick={open}
      >
        <Pencil aria-hidden="true" />
      </Button>
      <DialogContent
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus();
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const query =
              kind === "switches"
                ? [1, 2, 3, 4]
                    .map((index) => `switchName${index}=${data.get(`value${index - 1}`)}`)
                    .join("&")
                : `${kind}=${data.get("value0")}`;
            setPending(true);
            try {
              await deviceSave(`${kind === "switches" ? "switchesName" : kind}Save.json?${query}`);
              setValues(null);
              refresh();
            } catch (error) {
              notify(error);
              setValues(null);
            } finally {
              setPending(false);
            }
          }}
        >
          {values?.map((value, index) => (
            <div key={index}>
              <label htmlFor={`${kind}-${index}`}>
                {kind === "switches" ? `Switch ${index + 1}` : "Cost"}
              </label>
              <Input
                id={`${kind}-${index}`}
                name={`value${index}`}
                defaultValue={value}
                maxLength={kind === "switches" ? 9 : undefined}
                required
                onKeyDown={(event) => filterAlphaNumeric(event, setMessage)}
              />
            </div>
          ))}
          {kind === "switches" && (
            <label className="flex items-center justify-between gap-2">
              Enable Cut-Off Load
              <input type="checkbox" className="size-5" />
            </label>
          )}
          <Notice message={message} dismiss={() => setMessage("")} />
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
