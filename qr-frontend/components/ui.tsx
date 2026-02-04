"use client";

import React from "react";

const BRAND = "#b6202b";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  title,
  right,
  children,
  className = "",
  accent = false,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** accent = thêm đường nhấn màu brand (không đổi màu text) */
  accent?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl border bg-white shadow-sm",
        "border-neutral-200/80",
        "ring-1 ring-black/5",
        className,
      )}
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: BRAND }}
        />
      )}

      {(title || right) && (
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-sm font-semibold tracking-tight text-neutral-900">
                {title}
              </h2>
            )}
          </div>
          {right}
        </div>
      )}

      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "brand" | "green" | "yellow" | "red" | "neutral";
}) {
  // Không dùng brand cho text thường: badge vẫn giữ text neutral-900,
  // màu thể hiện bằng nền/viền.
  const map: Record<string, { bg: string; border: string }> = {
    brand: { bg: "#f8e7e9", border: BRAND },
    green: { bg: "#eaf7ee", border: "#16a34a" },
    yellow: { bg: "#fef3c7", border: "#f59e0b" },
    red: { bg: "#fee2e2", border: "#ef4444" },
    neutral: { bg: "#f5f5f5", border: "#d4d4d4" },
  };

  const t = map[tone];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-neutral-900"
      style={{ backgroundColor: t.bg, borderColor: t.border }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: t.border }}
      />
      {children}
    </span>
  );
}

export function Input({
  label,
  hint,
  error,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-900">{label}</label>
      )}

      <input
        className={cx(
          "w-full rounded-xl border bg-white px-3 py-2 text-sm text-neutral-900",
          "placeholder:text-neutral-400",
          "outline-none transition",
          error ? "border-red-300" : "border-neutral-200",
          "focus:border-neutral-300 focus:ring-4 focus:ring-neutral-100",
          className,
        )}
        style={{
          // Ring brand nhưng không đổi màu text
          boxShadow: "none",
        }}
        {...rest}
        onFocus={(e) => {
          // thêm ring brand nhẹ
          e.currentTarget.style.boxShadow = `0 0 0 4px rgba(182, 32, 43, 0.10)`;
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
          rest.onBlur?.(e);
        }}
      />

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Button({
  variant = "primary",
  loading,
  className = "",
  disabled,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium " +
    "transition active:scale-[0.99] " +
    "focus:outline-none focus:ring-4 focus:ring-offset-0 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  const styles: Record<string, string> = {
    // brand dùng cho nền/viền, text trắng ok
    primary:
      "text-white shadow-sm hover:shadow focus:ring-[rgba(182,32,43,0.18)]",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-200",
    ghost:
      "bg-transparent text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-200",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-[rgba(239,68,68,0.18)]",
  };

  const styleInline =
    variant === "primary"
      ? ({
          backgroundColor: BRAND,
        } as React.CSSProperties)
      : undefined;

  return (
    <button
      className={cx(base, styles[variant], className)}
      style={styleInline}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Đang xử lý..." : children}
    </button>
  );
}
