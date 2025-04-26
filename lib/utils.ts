import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
  }).format(new Date(date))
}


export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function truncate(str: string, length: number): string {
  if (!str || str.length <= length) return str
  return `${str.slice(0, length)}...`
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}

export function capitalize(str: string): string {
  if (!str || typeof str !== "string") return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}