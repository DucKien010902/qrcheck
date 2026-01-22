"use client";

import React from "react";

export function Card({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h2 className="text-base font-semibold text-neutral-900">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "yellow" | "red" | "neutral";
}) {
  const map: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    neutral: "bg-neutral-100 text-neutral-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[tone]}`}>
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
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-neutral-900">{label}</label>}
      <input
        className={
          "w-full rounded-xl border px-3 py-2 text-sm outline-none transition " +
          "focus:ring-2 focus:ring-neutral-300 " +
          (error ? "border-red-400" : "border-neutral-200") +
          ` ${className}`
        }
        {...rest}
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
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const styles: Record<string, string> = {
    primary: "bg-black text-white hover:bg-neutral-800 focus:ring-neutral-400",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-300",
    ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? "Đang xử lý..." : children}
    </button>
  );
}
