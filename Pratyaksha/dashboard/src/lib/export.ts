import type { Entry } from "./airtable"

// Convert entries to CSV format
export function entriesToCSV(entries: Entry[]): string {
  const headers = [
    "Date",
    "Name",
    "Type",
    "Mode",
    "Energy",
    "Energy Shape",
    "Sentiment",
    "Contradiction",
    "Text",
    "Snapshot",
    "Next Action",
    "Theme Tags",
    "Word Count",
  ]

  const rows = entries.map((entry) => [
    entry.date,
    escapeCSV(entry.name),
    escapeCSV(entry.type),
    escapeCSV(entry.inferredMode),
    escapeCSV(entry.inferredEnergy),
    escapeCSV(entry.energyShape),
    escapeCSV(entry.sentimentAI),
    escapeCSV(entry.contradiction),
    escapeCSV(entry.text),
    escapeCSV(entry.snapshot),
    escapeCSV(entry.nextAction),
    escapeCSV(entry.themeTagsAI.join(", ")),
    entry.entryLengthWords.toString(),
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

// Escape special characters for CSV
function escapeCSV(value: string | null | undefined): string {
  if (!value) return ""
  const escaped = value.replace(/"/g, '""')
  // Wrap in quotes if contains comma, newline, or quotes
  if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
    return `"${escaped}"`
  }
  return escaped
}

// Convert entries to JSON format (pretty printed)
export function entriesToJSON(entries: Entry[]): string {
  const exportData = entries.map((entry) => ({
    date: entry.date,
    name: entry.name,
    type: entry.type,
    mode: entry.inferredMode,
    energy: entry.inferredEnergy,
    energyShape: entry.energyShape,
    sentiment: entry.sentimentAI,
    contradiction: entry.contradiction,
    text: entry.text,
    snapshot: entry.snapshot,
    nextAction: entry.nextAction,
    themeTags: entry.themeTagsAI,
    wordCount: entry.entryLengthWords,
    summary: entry.summaryAI,
    insights: entry.actionableInsightsAI,
  }))

  return JSON.stringify(exportData, null, 2)
}

// Download a file
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export entries as CSV
export function exportAsCSV(entries: Entry[], filename = "pratyaksha-entries") {
  const csv = entriesToCSV(entries)
  const date = new Date().toISOString().split("T")[0]
  downloadFile(csv, `${filename}-${date}.csv`, "text/csv;charset=utf-8")
}

// Export entries as JSON
export function exportAsJSON(entries: Entry[], filename = "pratyaksha-entries") {
  const json = entriesToJSON(entries)
  const date = new Date().toISOString().split("T")[0]
  downloadFile(json, `${filename}-${date}.json`, "application/json")
}

// Generate summary statistics for export
export function generateExportSummary(entries: Entry[]) {
  const totalEntries = entries.length
  const dateRange = entries.length > 0
    ? {
        from: entries.reduce((min, e) => e.date < min ? e.date : min, entries[0].date),
        to: entries.reduce((max, e) => e.date > max ? e.date : max, entries[0].date),
      }
    : null

  const sentimentCounts = entries.reduce((acc, entry) => {
    const sentiment = entry.sentimentAI?.toLowerCase() || "unknown"
    if (sentiment.includes("positive")) acc.positive++
    else if (sentiment.includes("negative")) acc.negative++
    else acc.neutral++
    return acc
  }, { positive: 0, negative: 0, neutral: 0 })

  const typeCounts = entries.reduce((acc, entry) => {
    const type = entry.type || "Unknown"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalEntries,
    dateRange,
    sentimentCounts,
    typeCounts,
    exportedAt: new Date().toISOString(),
  }
}
