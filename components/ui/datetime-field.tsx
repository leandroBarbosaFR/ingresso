"use client";

import * as React from "react";
import { Calendar } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<"input">, "type">;

/**
 * Styled wrapper around `<input type="datetime-local">`. The native browser
 * picker is preserved (best a11y + mobile UX) and the calendar icon on the
 * right opens it via `showPicker()` where supported.
 */
export const DateTimeField = React.forwardRef<HTMLInputElement, Props>(
  function DateTimeField({ className, onClick, ...props }, ref) {
    const localRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLInputElement);

    function openPicker() {
      const el = localRef.current;
      if (!el) return;
      // showPicker is widely supported in modern browsers; fall back to focus.
      const maybe = el as HTMLInputElement & { showPicker?: () => void };
      if (typeof maybe.showPicker === "function") {
        try {
          maybe.showPicker();
          return;
        } catch {
          // fall through to focus
        }
      }
      el.focus();
    }

    return (
      <div
        className={cn(
          "group relative flex h-10 w-full items-center rounded-lg border border-input bg-transparent px-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
          className
        )}
        onClick={(e) => {
          // Clicking anywhere in the wrapper (except the native input itself)
          // opens the picker.
          if (e.target === localRef.current) return;
          openPicker();
        }}
      >
        <input
          ref={localRef}
          type="datetime-local"
          {...props}
          onClick={onClick}
          className="flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-muted-foreground [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-datetime-edit]:py-1.5"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Abrir calendário"
          onClick={openPicker}
          className="ml-2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
