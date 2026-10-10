"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { calculateEnergy } from "@/lib/energy";
import { filterAlphaNumeric, Notice, useNotice } from "@/components/shared/notice";

export function Calculator({ rate }: { rate: number }) {
  const [mode, setMode] = useState("Amps");
  const [results, setResults] = useState(() => calculateEnergy(0, 0, 1, 0, "Amps"));
  const { message, setMessage } = useNotice();
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setResults(calculateEnergy(0, 0, 1, 0, mode));
          setMessage("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full uppercase tracking-widest">
          Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px]" aria-describedby={undefined}>
        <DialogTitle>Energy Consumption Calculator</DialogTitle>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setResults(
              calculateEnergy(
                Number(data.get("voltage")),
                Number(data.get("amount")),
                Number(data.get("hours")),
                Number(data.get("cost")),
                mode,
              ),
            );
          }}
        >
          <div className="grid gap-4 xs:grid-cols-2">
            <div>
              <label htmlFor="voltage">Voltage</label>
              <Input
                id="voltage"
                name="voltage"
                defaultValue="0"
                placeholder="V"
                disabled={mode === "Watts"}
                required
                onKeyDown={(event) => filterAlphaNumeric(event, setMessage)}
              />
            </div>
            <div>
              <label htmlFor="hours">Hours / Day</label>
              <Input id="hours" name="hours" type="number" min="1" defaultValue="1" required />
            </div>
            <div>
              <label htmlFor="mode" className="sr-only">
                Measurement unit
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className="mb-1 rounded-sm bg-card p-1"
              >
                <option>Amps</option>
                <option>Watts</option>
              </select>
              <label htmlFor="amount" className="sr-only">
                {mode}
              </label>
              <Input
                id="amount"
                name="amount"
                defaultValue="0"
                required
                onKeyDown={(event) => filterAlphaNumeric(event, setMessage)}
              />
            </div>
            <div>
              <label htmlFor="cost">Energy Cost</label>
              <Input
                id="cost"
                name="cost"
                defaultValue={rate.toFixed(2)}
                required
                onKeyDown={(event) => filterAlphaNumeric(event, setMessage)}
              />
            </div>
          </div>
          <Notice message={message} dismiss={() => setMessage("")} />
          <div className="my-5 overflow-x-auto">
            <table className="w-full tabular-nums">
              <caption className="sr-only">Estimated energy and cost</caption>
              <thead>
                <tr>
                  <th scope="col">Duration</th>
                  <th scope="col">Energy</th>
                  <th scope="col">Cost</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <th scope="row">{["Hour", "Day", "Week", "Month", "Year"][index]}</th>
                    <td>{result.energy} kWh</td>
                    <td>₱ {result.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="submit">Calculate</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
