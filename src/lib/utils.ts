import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatNumber(n: unknown): string {
  const num = Number(n);
  if (isNaN(num)) return String(n ?? "");
  if (Math.abs(num) >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(1) + "K";
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toFixed(2);
}
