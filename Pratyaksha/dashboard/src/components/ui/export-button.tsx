import { useState } from "react"
import { Download, FileSpreadsheet, FileJson, Loader2 } from "lucide-react"
import { Button } from "./button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { exportAsCSV, exportAsJSON, generateExportSummary } from "../../lib/export"
import type { Entry } from "../../lib/airtable"
import { toast } from "sonner"
import { ERROR_MESSAGES } from "../../lib/errorMessages"

interface ExportButtonProps {
  entries: Entry[]
  filteredCount?: number
  className?: string
}

export function ExportButton({ entries, filteredCount, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = async (format: "csv" | "json") => {
    if (!entries.length) {
      toast.error("Nothing to Export", {
        description: ERROR_MESSAGES.EXPORT_NO_DATA,
      })
      return
    }

    setIsExporting(true)

    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (format === "csv") {
        exportAsCSV(entries)
        toast.success(`Exported ${entries.length} entries as CSV`)
      } else {
        exportAsJSON(entries)
        toast.success(`Exported ${entries.length} entries as JSON`)
      }

      setIsOpen(false)
    } catch (error) {
      toast.error("Export Failed", {
        description: ERROR_MESSAGES.EXPORT_FAILED,
      })
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const summary = generateExportSummary(entries)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
          disabled={!entries.length}
          aria-label="Export entries"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Export Entries</h4>
            <p className="text-sm text-muted-foreground">
              {filteredCount !== undefined && filteredCount !== entries.length
                ? `${filteredCount} of ${entries.length} entries (filtered)`
                : `${entries.length} entries`}
            </p>
          </div>

          {/* Summary stats */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-medium text-positive">{summary.sentimentCounts.positive}</div>
                <div className="text-xs text-muted-foreground">Positive</div>
              </div>
              <div>
                <div className="font-medium text-neutral">{summary.sentimentCounts.neutral}</div>
                <div className="text-xs text-muted-foreground">Neutral</div>
              </div>
              <div>
                <div className="font-medium text-negative">{summary.sentimentCounts.negative}</div>
                <div className="text-xs text-muted-foreground">Negative</div>
              </div>
            </div>
          </div>

          {/* Export options */}
          <div className="space-y-2">
            <button
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
              )}
              <div className="flex-1">
                <div className="font-medium">Export as CSV</div>
                <div className="text-xs text-muted-foreground">
                  Open in Excel, Google Sheets
                </div>
              </div>
            </button>

            <button
              onClick={() => handleExport("json")}
              disabled={isExporting}
              className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <FileJson className="h-5 w-5 text-yellow-500" />
              )}
              <div className="flex-1">
                <div className="font-medium">Export as JSON</div>
                <div className="text-xs text-muted-foreground">
                  For developers, data analysis
                </div>
              </div>
            </button>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-center text-xs text-muted-foreground">
            Press <kbd className="rounded border bg-muted px-1">Ctrl</kbd>+
            <kbd className="rounded border bg-muted px-1">E</kbd> to quick export
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
