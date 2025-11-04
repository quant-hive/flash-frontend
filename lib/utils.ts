import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse } from "date-fns";

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

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return format(date, "dd-MM-yyyy");
  } catch {
    return dateString;
  }
};

export const formatDateForSave = (dateString: string): string => {
  if (!dateString) return "";
  try {
    // Parse dd-MM-yyyy format and convert to yyyy-MM-dd
    const date = parse(dateString, "dd-MM-yyyy", new Date());
    return format(date, "yyyy-MM-dd");
  } catch {
    return dateString;
  }
};

export const parseDateInput = (value: string): string => {
  if (!value) return "";
  // Remove any non-digit characters except hyphens
  const cleaned = value.replace(/[^\d-]/g, "");
  // Ensure dd-MM-yyyy format
  const parts = cleaned.split("-");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day.length <= 2 && month.length <= 2 && year.length <= 4) {
      return cleaned;
    }
  }
  return cleaned;
};
