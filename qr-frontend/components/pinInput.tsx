"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const BRAND = "#b6202b";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  length?: number; // default 4
  disabled?: boolean;
  autoFocus?: boolean;
  value?: string; // controlled optional
  onChange?: (pin: string) => void;
  onComplete?: (pin: string) => void;
  error?: string | null;
  hint?: string;
};

export default function PinInput({
  length = 4,
  disabled,
  autoFocus = true,
  value,
  onChange,
  onComplete,
  error,
  hint,
}: Props) {
  const isControlled = typeof value === "string";
  const [inner, setInner] = useState<string>("");

  const pin = isControlled ? (value as string) : inner;

  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = useMemo(() => {
    const arr = Array.from({ length }, (_, i) => pin[i] ?? "");
    return arr;
  }, [pin, length]);

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => refs.current[0]?.focus(), 50);
    return () => clearTimeout(t);
  }, [autoFocus]);

  function setPin(next: string) {
    const cleaned = next.replace(/\D/g, "").slice(0, length);
    if (!isControlled) setInner(cleaned);
    onChange?.(cleaned);
    if (cleaned.length === length) onComplete?.(cleaned);
  }

  function focusIndex(i: number) {
    refs.current[i]?.focus();
    refs.current[i]?.select();
  }

  function handleChange(i: number, v: string) {
    if (disabled) return;
    const d = v.replace(/\D/g, "");
    if (!d) {
      // user cleared
      const next = pin.slice(0, i) + "" + pin.slice(i + 1);
      setPin(next);
      return;
    }
    // if user typed multiple digits quickly, treat as paste-like
    if (d.length > 1) {
      const merged = (pin.slice(0, i) + d + pin.slice(i + d.length)).slice(
        0,
        length,
      );
      setPin(merged);
      const nextIndex = Math.min(length - 1, i + d.length);
      focusIndex(nextIndex);
      return;
    }

    const next = (pin.slice(0, i) + d + pin.slice(i + 1)).slice(0, length);
    setPin(next);

    if (i < length - 1) focusIndex(i + 1);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (pin[i]) {
        const next = pin.slice(0, i) + "" + pin.slice(i + 1);
        setPin(next);
        return;
      }
      if (i > 0) focusIndex(i - 1);
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (i > 0) focusIndex(i - 1);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (i < length - 1) focusIndex(i + 1);
      return;
    }

    // allow digits only
    if (e.key.length === 1 && /\D/.test(e.key)) {
      e.preventDefault();
      return;
    }
  }

  function handlePaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    if (disabled) return;
    e.preventDefault();
    const text = e.clipboardData.getData("text") || "";
    const d = text.replace(/\D/g, "");
    if (!d) return;

    const merged = (pin.slice(0, i) + d + pin.slice(i + d.length)).slice(
      0,
      length,
    );
    setPin(merged);

    const nextIndex = Math.min(length - 1, i + d.length);
    focusIndex(nextIndex);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2">
        {digits.map((ch, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={ch}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            aria-label={`digit-${i + 1}`}
            className={cx(
              "h-12 w-12 rounded-2xl border bg-white text-center text-lg font-semibold text-neutral-900",
              "outline-none transition",
              "ring-1 ring-black/5",
              error ? "border-red-300" : "border-neutral-200",
              "focus:border-neutral-300",
            )}
            style={{
              boxShadow: "none",
            }}
            onFocus={(e) => {
              // ring brand nhẹ, không đổi text
              e.currentTarget.style.boxShadow = `0 0 0 4px rgba(182, 32, 43, 0.12)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
          />
        ))}
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-center text-sm text-neutral-500">{hint}</p>
      ) : (
        <p className="text-center text-sm text-neutral-500">
          Nhập {length} số để tiếp tục.
        </p>
      )}
    </div>
  );
}
