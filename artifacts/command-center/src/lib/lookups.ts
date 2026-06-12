import type { Database } from "./types";
import type { Option } from "@/components/shared/RecordFormDialog";

export function agencyOptions(db: Database): Option[] {
  return db.agencies
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((a) => ({ value: a.id, label: a.name }));
}

export function matterOptions(db: Database): Option[] {
  return db.matters
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((m) => ({
      value: m.id,
      label: `${m.title} — ${m.clientOrCompanyName}`,
    }));
}

export function agencyName(db: Database, id: string): string {
  return db.agencies.find((a) => a.id === id)?.name ?? "—";
}

export function matterTitle(db: Database, id: string): string {
  const m = db.matters.find((x) => x.id === id);
  return m ? m.title : "—";
}

export function matterLabel(db: Database, id: string): string {
  const m = db.matters.find((x) => x.id === id);
  return m ? `${m.title} — ${m.clientOrCompanyName}` : "—";
}
