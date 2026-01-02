import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
  return array.reduce((acc, item) => {
    const value = String(item[key] ?? "Unknown")
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const value = String(item[key] ?? "Unknown")
    if (!acc[value]) acc[value] = []
    acc[value].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export function sentimentToScore(sentiment: string | null | undefined): number {
  const sentimentMap: Record<string, number> = {
    "Very Positive": 5,
    "Positive": 4,
    "Neutral": 3,
    "Negative": 2,
    "Very Negative": 1,
  }
  return sentimentMap[sentiment ?? "Neutral"] ?? 3
}
