import { useSyncExternalStore } from "react";
import type { Collection, Database } from "./types";
import { buildSeed } from "./seed";
import { uid, nowISO } from "./format";

const LS_KEY = "rccc.data.v1";

function load(): Database {
  if (typeof window === "undefined") return buildSeed();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) {
      const seeded = buildSeed();
      window.localStorage.setItem(LS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<Database>;
    const seed = buildSeed();
    return {
      agencies: parsed.agencies ?? seed.agencies,
      matters: parsed.matters ?? seed.matters,
      communications: parsed.communications ?? seed.communications,
      deficiencies: parsed.deficiencies ?? seed.deficiencies,
      escalations: parsed.escalations ?? seed.escalations,
      knowledge: parsed.knowledge ?? seed.knowledge,
      sops: parsed.sops ?? seed.sops,
    };
  } catch {
    return buildSeed();
  }
}

let db: Database = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(db));
  } catch {
    /* ignore quota errors in prototype */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return db;
}

export function useDatabase(): Database {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

type WithId = { id: string; createdAt?: string };

export function saveRecord<C extends Collection>(
  collection: C,
  record: Database[C][number],
): Database[C][number] {
  const rec = record as WithId;
  const list = db[collection] as WithId[];
  const exists = rec.id && list.some((r) => r.id === rec.id);
  let saved: WithId;
  if (exists) {
    saved = { ...rec };
    db = {
      ...db,
      [collection]: list.map((r) => (r.id === rec.id ? saved : r)),
    };
  } else {
    saved = {
      ...rec,
      id: rec.id || uid(collection.slice(0, 2)),
      createdAt: rec.createdAt || nowISO(),
    };
    db = { ...db, [collection]: [saved, ...list] };
  }
  persist();
  emit();
  return saved as Database[C][number];
}

export function deleteRecord<C extends Collection>(collection: C, id: string) {
  const list = db[collection] as WithId[];
  db = { ...db, [collection]: list.filter((r) => r.id !== id) };
  persist();
  emit();
}

export function resetData() {
  db = buildSeed();
  persist();
  emit();
}
