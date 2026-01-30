// Pattern Warning Storage - Persist warning state to localStorage
// Tracks dismissed warnings and prevents re-warning on same patterns

import type { PatternWarning } from "./patternWarnings";

// ==================== CONSTANTS ====================

export const WARNING_STORAGE_KEY = "pratyaksha-pattern-warnings";
export const DISMISSED_WARNINGS_KEY = "pratyaksha-dismissed-warnings";

// How long a warning stays dismissed (7 days)
export const DISMISSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// ==================== TYPES ====================

export interface StoredWarnings {
  warnings: PatternWarning[];
  lastCheckedAt: string;
}

export interface DismissedWarning {
  warningId: string;
  dismissedAt: string;
  expiresAt: string;
}

// ==================== STORAGE FUNCTIONS ====================

/**
 * Load stored warnings from localStorage
 */
export function loadStoredWarnings(): StoredWarnings | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(WARNING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[PatternWarningStorage] Failed to load warnings:", error);
  }

  return null;
}

/**
 * Save warnings to localStorage
 */
export function saveStoredWarnings(warnings: PatternWarning[]): void {
  if (typeof window === "undefined") return;

  try {
    const data: StoredWarnings = {
      warnings,
      lastCheckedAt: new Date().toISOString()
    };
    localStorage.setItem(WARNING_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[PatternWarningStorage] Failed to save warnings:", error);
  }
}

/**
 * Load dismissed warnings from localStorage
 */
export function loadDismissedWarnings(): Map<string, DismissedWarning> {
  if (typeof window === "undefined") return new Map();

  try {
    const stored = localStorage.getItem(DISMISSED_WARNINGS_KEY);
    if (stored) {
      const data: DismissedWarning[] = JSON.parse(stored);
      const now = new Date().toISOString();

      // Filter out expired dismissals and convert to map
      const validDismissals = data.filter(d => d.expiresAt > now);

      // Re-save if any expired
      if (validDismissals.length !== data.length) {
        saveDismissedWarnings(validDismissals);
      }

      return new Map(validDismissals.map(d => [d.warningId, d]));
    }
  } catch (error) {
    console.error("[PatternWarningStorage] Failed to load dismissed warnings:", error);
  }

  return new Map();
}

/**
 * Save dismissed warnings to localStorage
 */
function saveDismissedWarnings(dismissals: DismissedWarning[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(DISMISSED_WARNINGS_KEY, JSON.stringify(dismissals));
  } catch (error) {
    console.error("[PatternWarningStorage] Failed to save dismissed warnings:", error);
  }
}

/**
 * Dismiss a warning (with cooldown period)
 */
export function dismissWarning(warningId: string): void {
  if (typeof window === "undefined") return;

  try {
    const dismissed = loadDismissedWarnings();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + DISMISSAL_DURATION_MS);

    dismissed.set(warningId, {
      warningId,
      dismissedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    saveDismissedWarnings(Array.from(dismissed.values()));

    // Also update the warning in stored warnings
    const stored = loadStoredWarnings();
    if (stored) {
      const updatedWarnings = stored.warnings.map(w =>
        w.id === warningId ? { ...w, dismissedAt: now.toISOString() } : w
      );
      saveStoredWarnings(updatedWarnings);
    }
  } catch (error) {
    console.error("[PatternWarningStorage] Failed to dismiss warning:", error);
  }
}

/**
 * Check if a warning is currently dismissed
 */
export function isWarningDismissed(warningId: string): boolean {
  const dismissed = loadDismissedWarnings();
  return dismissed.has(warningId);
}

/**
 * Get all active (non-dismissed) warnings
 */
export function getActiveWarnings(): PatternWarning[] {
  const stored = loadStoredWarnings();
  if (!stored) return [];

  const dismissed = loadDismissedWarnings();

  return stored.warnings.filter(w =>
    !w.dismissedAt && !dismissed.has(w.id)
  );
}

/**
 * Clear all warning data (full reset)
 */
export function clearWarningData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WARNING_STORAGE_KEY);
  localStorage.removeItem(DISMISSED_WARNINGS_KEY);
}

/**
 * Get time remaining on dismissal for a warning
 */
export function getDismissalTimeRemaining(warningId: string): number | null {
  const dismissed = loadDismissedWarnings();
  const dismissal = dismissed.get(warningId);

  if (!dismissal) return null;

  const expiresAt = new Date(dismissal.expiresAt).getTime();
  const now = Date.now();
  const remaining = expiresAt - now;

  return remaining > 0 ? remaining : null;
}

/**
 * Format remaining dismissal time for display
 */
export function formatDismissalRemaining(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h`;
}
