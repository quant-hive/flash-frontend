import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object to a locale string.
 * Returns 'N/A' if input is falsy or invalid.
 */
export function formatDate(dateInput?: string | Date): string {
  if (!dateInput) return "N/A";
  try {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  } catch {
    return "N/A";
  }
}

// Format number in Indian numbering system with conditional decimals
// - If integer: 1 decimal place (e.g., 1,23,456.0)
// - If has decimals: exactly 2 decimal places (e.g., 1,23,456.78)
export function formatIndianNumber(value: number) {
  const hasDecimals = Math.abs(value % 1) > 1e-9;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 1,
    maximumFractionDigits: hasDecimals ? 2 : 1,
  }).format(value);
}
