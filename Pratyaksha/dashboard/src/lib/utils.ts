import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function sentimentToScore(sentiment: string): number {
  const lower = sentiment.toLowerCase()
  if (lower.includes("positive")) return 1
  if (lower.includes("negative")) return -1
  return 0
}

export function sentimentToColor(sentiment: string): string {
  const lower = sentiment.toLowerCase()
  if (lower.includes("positive")) return "hsl(var(--positive))"
  if (lower.includes("negative")) return "hsl(var(--negative))"
  return "hsl(var(--neutral))"
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    result[groupKey] = (result[groupKey] || 0) + 1
    return result
  }, {} as Record<string, number>)
}
