import { useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, AlertCircle, Clock, CheckCircle2, Calendar as CalendarIcon, Target, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Toolbar } from "@/components/shared/Toolbar";
import {
  MatterStatusBadge,
  DeficiencyStatusBadge,
  EscalationStatusBadge,
  TonePill,
} from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDatabase } from "@/lib/store";
import { agencyName, matterTitle } from "@/lib/lookups";
import { fmtDate, daysUntil, isOverdue, isDueToday } from "@/lib/format";
import {
  OPEN_MATTER_STATUSES,
  OPEN_DEFICIENCY_STATUSES,
  OPEN_ESCALATION_STATUSES,
} from "@/lib/types";

type Source = "Matter" | "Deficiency" | "Escalation" | "Communication";

interface FollowUpItem {
  id: string;
  date: string;
  source: Source;
  title: string;
  context: string;
  badge: React.ReactNode;
  href: string;
}

function bucketOf(date: string): "overdue" | "today" | "week" | "later" {
  if (isOverdue(date)) return "overdue";
  if (isDueToday(date)) return "today";
  const n = daysUntil(date) ?? 999;
  return n <= 7 ? "week" : "later";
}

function sourceColor(source: Source): string {
  switch (source) {
    case "Matter": return "from-purple-500 to-indigo-600";
    case "Deficiency": return "from-amber-500 to-orange-600";
    case "Escalation": return "from-red-500 to-rose-600";
    case "Communication": return "from-emerald-500 to-teal-600";
  }
}

export default function Calendar() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("__all__");

  const items = useMemo<FollowUpItem[]>(() => {
    const out: FollowUpItem[] = [];

    db.matters
      .filter((m) => m.nextFollowUpDate && OPEN_MATTER_STATUSES.includes(m.currentStatus))
      .forEach((m) =>
        out.push({
          id: `m_${m.id}`,
          date: m.nextFollowUpDate,
          source: "Matter",
          title: m.title,
          context: `${m.clientOrCompanyName} · ${agencyName(db, m.agencyId)}`,
          badge: <MatterStatusBadge value={m.currentStatus} />,
          href: "/matters",
        }),
      );

    db.deficiencies
      .filter((d) => d.dueDate && OPEN_DEFICIENCY_STATUSES.includes(d.status))
      .forEach((d) =>
        out.push({
          id: `d_${d.id}`,
          date: d.dueDate,
          source: "Deficiency",
          title: d.requestOrDeficiencyType,
          context: matterTitle(db, d.matterId),
          badge: <DeficiencyStatusBadge value={d.status} />,
          href: "/deficiencies",
        }),
      );

    db.escalations
      .filter((e) => e.dueDate && OPEN_ESCALATION_STATUSES.includes(e.status))
      .forEach((e) =>
        out.push({
          id: `e_${e.id}`,
          date: e.dueDate,
          source: "Escalation",
          title: e.reasonForEscalation,
          context: matterTitle(db, e.matterId),
          badge: <EscalationStatusBadge value={e.status} />,
          href: "/escalations",
        }),
      );

    db.communications
      .filter((c) => c.followUpNeeded && c.followUpDate)
      .forEach((c) =>
        out.push({
          id: `c_${c.id}`,
          date: c.followUpDate,
          source: "Communication",
          title: `Follow up: ${c.contactMethod}`,
          context: `${agencyName(db, c.agencyId)} · ${c.summary.slice(0, 50)}`,
          badge: <TonePill label={c.contactMethod} tone="slate" />,
          href: "/communications",
        }),
      );

    return out.sort((a, b) => a.date.localeCompare(b.date));
  }, [db]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => (sourceFilter === "__all__" ? true : i.source === sourceFilter))
      .filter((i) =>
        q === "" ? true : `${i.title} ${i.context}`.toLowerCase().includes(q),
      );
  }, [items, search, sourceFilter]);

  const groups = useMemo(() => {
    return {
      overdue: filtered.filter((i) => bucketOf(i.date) === "overdue"),
      today: filtered.filter((i) => bucketOf(i.date) === "today"),
      week: filtered.filter((i) => bucketOf(i.date) === "week"),
      later: filtered.filter((i) => bucketOf(i.date) === "later"),
    };
  }, [filtered]);

  const kpis = [
    {
      label: "Overdue Items",
      value: groups.overdue.length,
      icon: ShieldAlert,
      gradient: "from-red-600 to-rose-600",
      shadow: "hover:shadow-red-500/30",
    },
    {
      label: "Due Today",
      value: groups.today.length,
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Next 7 Days",
      value: groups.week.length,
      icon: Target,
      gradient: "from-violet-500 to-purple-600",
      shadow: "hover:shadow-purple-500/30",
    },
    {
      label: "Total Scheduled",
      value: items.length,
      icon: CalendarIcon,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
  ];

  const sections: {
    key: keyof typeof groups;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
  }[] = [
    { key: "overdue", label: "Overdue", icon: AlertCircle, accentClass: "from-red-500 to-rose-600" },
    { key: "today", label: "Due Today", icon: Clock, accentClass: "from-amber-500 to-orange-600" },
    { key: "week", label: "Next 7 Days", icon: CalendarDays, accentClass: "from-purple-500 to-indigo-600" },
    { key: "later", label: "Later", icon: CheckCircle2, accentClass: "from-slate-400 to-slate-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <CalendarDays className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Follow-Up Calendar</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Consolidated view of every upcoming follow-up across matters, deficiencies, escalations, and communications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI stat strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className={`relative overflow-hidden rounded-2xl border-0 p-5 text-white shadow-lg bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} transition-all hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="relative mb-3 flex items-start justify-between">
                <div className="text-4xl font-extrabold leading-none tracking-tight">
                  {kpi.value}
                </div>
                <div className="rounded-xl bg-white/20 p-2.5 ring-1 ring-white/30 backdrop-blur-sm">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <span className="relative block text-xs font-semibold uppercase tracking-wider text-white/85">
                {kpi.label}
              </span>
            </Card>
          );
        })}
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search follow-ups..."
        filters={[
          {
            key: "source",
            label: "Source",
            value: sourceFilter,
            onChange: setSourceFilter,
            options: [
              { value: "Matter", label: "Matter" },
              { value: "Deficiency", label: "Deficiency" },
              { value: "Escalation", label: "Escalation" },
              { value: "Communication", label: "Communication" },
            ],
          },
        ]}
      />

      {filtered.length === 0 ? (
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <CardContent className="p-6">
            <EmptyState
              icon={CalendarDays}
              title="No follow-ups scheduled"
              description="Set follow-up dates on matters, deficiencies, escalations, or communications to populate this calendar."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map(({ key, label, accentClass }) => {
            const list = groups[key];
            if (list.length === 0) return null;
            return (
              <Card key={key} className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                  <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                    <span className={`h-5 w-1.5 rounded-full bg-gradient-to-b ${accentClass}`} />
                    {label}
                  </h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-200/50 px-2.5 py-0.5 rounded-full">
                    {list.length}
                  </span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {list.map((i) => {
                    const n = daysUntil(i.date);
                    const over = isOverdue(i.date);
                    const today = isDueToday(i.date);
                    return (
                      <Link key={i.id} href={i.href}>
                        <div className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md hover:ring-1 hover:ring-primary/10">
                          <div className="flex flex-1 items-start gap-4 min-w-0">
                             <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${sourceColor(i.source)} text-white shadow-sm`}>
                               <span className="text-xs font-bold">{i.source.slice(0, 2).toUpperCase()}</span>
                             </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                                  {i.title}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                                  {i.source}
                                </span>
                              </div>
                              <p className="truncate text-sm text-slate-500">
                                {i.context}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2 md:flex-row md:items-center md:gap-6">
                            <div className="hidden md:block">{i.badge}</div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-slate-700">
                                {fmtDate(i.date)}
                              </div>
                              <div
                                className={`text-xs font-bold tracking-wide uppercase mt-0.5 ${
                                  over
                                    ? "text-red-600"
                                    : today
                                      ? "text-amber-600"
                                      : "text-purple-600"
                                }`}
                              >
                                {over
                                  ? `${Math.abs(n ?? 0)}d overdue`
                                  : today
                                    ? "Due today"
                                    : `in ${n}d`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
