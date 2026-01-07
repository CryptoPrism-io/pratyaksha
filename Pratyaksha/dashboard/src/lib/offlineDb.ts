/**
 * Offline Database using IndexedDB
 * Stores journal entries locally when offline and syncs when back online
 */

const DB_NAME = "pratyaksha-offline"
const DB_VERSION = 1
const STORE_NAME = "pending-entries"

export interface PendingEntry {
  id: string
  text: string
  createdAt: string
  status: "pending" | "syncing" | "failed"
  retryCount: number
  lastError?: string
}

let dbInstance: IDBDatabase | null = null

/**
 * Initialize IndexedDB
 */
export function initOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error("[OfflineDB] Failed to open database:", request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      console.log("[OfflineDB] Database opened successfully")
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create pending entries store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("status", "status", { unique: false })
        store.createIndex("createdAt", "createdAt", { unique: false })
        console.log("[OfflineDB] Created pending-entries store")
      }
    }
  })
}

/**
 * Add a pending entry to the offline queue
 */
export async function addPendingEntry(text: string): Promise<PendingEntry> {
  const db = await initOfflineDb()
  const entry: PendingEntry = {
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    createdAt: new Date().toISOString(),
    status: "pending",
    retryCount: 0,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(entry)

    request.onsuccess = () => {
      console.log("[OfflineDB] Entry added:", entry.id)
      resolve(entry)
    }

    request.onerror = () => {
      console.error("[OfflineDB] Failed to add entry:", request.error)
      reject(request.error)
    }
  })
}

/**
 * Get all pending entries
 */
export async function getPendingEntries(): Promise<PendingEntry[]> {
  const db = await initOfflineDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result || [])
    }

    request.onerror = () => {
      console.error("[OfflineDB] Failed to get entries:", request.error)
      reject(request.error)
    }
  })
}

/**
 * Update a pending entry's status
 */
export async function updatePendingEntry(
  id: string,
  updates: Partial<PendingEntry>
): Promise<void> {
  const db = await initOfflineDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const entry = getRequest.result
      if (!entry) {
        reject(new Error(`Entry not found: ${id}`))
        return
      }

      const updated = { ...entry, ...updates }
      const putRequest = store.put(updated)

      putRequest.onsuccess = () => {
        console.log("[OfflineDB] Entry updated:", id)
        resolve()
      }

      putRequest.onerror = () => {
        reject(putRequest.error)
      }
    }

    getRequest.onerror = () => {
      reject(getRequest.error)
    }
  })
}

/**
 * Remove a pending entry (after successful sync)
 */
export async function removePendingEntry(id: string): Promise<void> {
  const db = await initOfflineDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => {
      console.log("[OfflineDB] Entry removed:", id)
      resolve()
    }

    request.onerror = () => {
      console.error("[OfflineDB] Failed to remove entry:", request.error)
      reject(request.error)
    }
  })
}

/**
 * Get count of pending entries
 */
export async function getPendingCount(): Promise<number> {
  const db = await initOfflineDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.count()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Clear all pending entries
 */
export async function clearPendingEntries(): Promise<void> {
  const db = await initOfflineDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onsuccess = () => {
      console.log("[OfflineDB] All pending entries cleared")
      resolve()
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}
