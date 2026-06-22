import { StorageError } from "./store";

const DB_NAME = "rccc.attachments";
const STORE = "files";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(STORE)) {
        idb.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () =>
      reject(req.error ?? new Error("Could not open the attachment store."));
  });
  return dbPromise;
}

/**
 * Persist an attachment (stored as a data URL) in IndexedDB under `id`.
 * Throws `StorageError` if the write fails (e.g. browser storage quota).
 */
export async function putAttachment(id: string, dataUrl: string): Promise<void> {
  try {
    const idb = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(dataUrl, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    throw new StorageError(
      "There isn't enough space to store this attachment. Remove a file you no longer need or choose a smaller one.",
    );
  }
}

/** Read an attachment's data URL back from IndexedDB, or `undefined` if missing. */
export async function getAttachment(id: string): Promise<string | undefined> {
  const idb = await openDb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as string | undefined);
    req.onerror = () => reject(req.error);
  });
}

/** Remove an attachment from IndexedDB. Best-effort; never throws. */
export async function deleteAttachment(id: string): Promise<void> {
  try {
    const idb = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    /* best-effort cleanup */
  }
}

export interface StorageEstimate {
  usage: number;
  quota: number;
}

/**
 * Origin storage usage/quota across IndexedDB + localStorage, via the
 * Storage API. Returns `null` when the browser can't report an estimate.
 */
export async function estimateStorage(): Promise<StorageEstimate | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return null;
  }
  try {
    const { usage, quota } = await navigator.storage.estimate();
    if (typeof usage !== "number" || typeof quota !== "number" || quota <= 0) {
      return null;
    }
    return { usage, quota };
  } catch {
    return null;
  }
}
