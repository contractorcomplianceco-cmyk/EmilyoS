import {
  format,
  parseISO,
  isValid,
  differenceInCalendarDays,
  isToday,
  isPast,
} from "date-fns";

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function nowISO(): string {
  return new Date().toISOString();
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = value.length <= 10 ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
}

export function fmtDate(value?: string | null): string {
  const d = toDate(value);
  return d ? format(d, "MMM d, yyyy") : "—";
}

export function fmtDateTime(value?: string | null): string {
  const d = toDate(value);
  return d ? format(d, "MMM d, yyyy · h:mm a") : "—";
}

export function daysUntil(value?: string | null): number | null {
  const d = toDate(value);
  return d ? differenceInCalendarDays(d, new Date()) : null;
}

export function daysSince(value?: string | null): number | null {
  const d = toDate(value);
  return d ? differenceInCalendarDays(new Date(), d) : null;
}

export function isOverdue(value?: string | null): boolean {
  const d = toDate(value);
  return d ? isPast(d) && !isToday(d) : false;
}

export function isDueToday(value?: string | null): boolean {
  const d = toDate(value);
  return d ? isToday(d) : false;
}

export function isUpcoming(value?: string | null, withinDays = 7): boolean {
  const n = daysUntil(value);
  return n !== null && n >= 0 && n <= withinDays;
}

export type BadgeTone =
  | "neutral"
  | "blue"
  | "amber"
  | "green"
  | "red"
  | "purple"
  | "slate"
  | "pink";

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-slate-50 text-slate-500 border border-slate-200",
  slate: "bg-slate-100 text-slate-600 border border-slate-200",
  blue: "bg-blue-50 text-blue-600 border border-blue-200",
  amber: "bg-amber-50 text-amber-600 border border-amber-200",
  green: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  red: "bg-rose-50 text-rose-600 border border-rose-200",
  purple: "bg-sky-50 text-sky-600 border border-sky-200",
  pink: "bg-pink-50 text-pink-600 border border-pink-200",
};

export function toneClass(tone: BadgeTone): string {
  return TONE_CLASS[tone];
}

export function riskTone(risk: string): BadgeTone {
  switch (risk) {
    case "Low":
      return "slate";
    case "Medium":
      return "blue";
    case "High":
      return "amber";
    case "Critical":
      return "pink";
    default:
      return "neutral";
  }
}

export function matterStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Approved / Completed":
      return "green";
    case "Closed":
      return "slate";
    case "Escalated":
      return "pink";
    case "Deficiency Received":
      return "amber";
    case "On Hold":
      return "neutral";
    case "Waiting on Agency":
    case "Waiting on Client":
    case "Waiting on Internal Team":
      return "amber";
    case "Submitted":
    case "In Review":
      return "blue";
    case "Preparing":
      return "purple";
    default:
      return "neutral";
  }
}

export function deficiencyStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Resolved":
      return "green";
    case "Escalated":
      return "pink";
    case "New":
      return "amber";
    case "Submitted to Agency":
    case "Ready to Respond":
      return "blue";
    case "Assigned":
      return "purple";
    default:
      return "neutral";
  }
}

export function escalationStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Resolved":
    case "Closed":
      return "green";
    case "Open":
      return "pink";
    case "Awaiting Decision":
      return "amber";
    case "In Review":
      return "blue";
    default:
      return "neutral";
  }
}

export function activeStatusTone(status: string): BadgeTone {
  return status === "Active" ? "green" : "slate";
}

export function sopStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Active":
      return "green";
    case "Draft":
      return "amber";
    case "Under Review":
      return "blue";
    case "Archived":
      return "slate";
    default:
      return "neutral";
  }
}
