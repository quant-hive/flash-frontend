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
