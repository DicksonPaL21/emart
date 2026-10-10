"use client";
import { useCallback, useState } from "react";
import { vibrate } from "@/lib/device";
export function useNotice() {
  const [message, setMessage] = useState("");
  const fail = useCallback((error: unknown) => {
    setMessage(error instanceof Error ? error.message : "Request failed.");
    vibrate();
  }, []);
  return { message, setMessage, fail };
}
export function Notice({ message, dismiss }: { message: string; dismiss: () => void }) {
  return (
    <div
      className={
        message
          ? "my-3 flex items-start justify-between gap-4 rounded-sm border border-input bg-muted p-3"
          : ""
      }
    >
      <p role="status" className="break-words">
        {message}
      </p>
      {message && (
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 px-2 underline"
          aria-label="Dismiss notification"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
export function filterAlphaNumeric(
  event: React.KeyboardEvent<HTMLInputElement>,
  notify: (message: string) => void,
) {
  if (
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    event.key.length === 1 &&
    !/^[a-zA-Z0-9 _.]$/.test(event.key)
  ) {
    event.preventDefault();
    notify("Error: This input should not accept any symbols. Letters and Numbers only.");
  }
}
