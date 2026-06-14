import React from "react";
import { Card } from "@/components/ui/card";
import { useDatabase } from "@/lib/store";
import { agencyName } from "@/lib/lookups";
import { fmtDate } from "@/lib/format";
import {
  Trophy,
  FolderKanban,
  ClipboardCheck,
  CheckSquare,
  ArrowUpCircle,
  Award,
} from "lucide-react";

type Win = {
  id: string;
  title: string;
  category: string;
  date: string;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
};

const OWNER = "Emily Jones";

export default function MyWins() {
  const db = useDatabase();

  const myMatterIds = new Set(
    db.matters.filter((m) => m.internalOwner === OWNER).map((m) => m.id),
  );

  const mattersClosed = db.matters.filter(
    (m) =>
      m.internalOwner === OWNER && ["Approved / Completed", "Closed"].includes(m.currentStatus),
  );
  const deficienciesResolved = db.deficiencies.filter(
    (d) => d.assignedInternalOwner === OWNER && d.status === "Resolved",
  );
  const tasksCompleted = db.tasks.filter(
    (t) => t.assignedTo === OWNER && t.status === "Completed",
  );
  const escalationsResolved = db.escalations.filter(
    (e) => myMatterIds.has(e.matterId) && ["Resolved", "Closed"].includes(e.status),
  );

  const wins: Win[] = [
    ...mattersClosed.map((m) => ({
      id: m.id,
      title: m.title,
      category: "Matter Completed",
      date: m.lastContactDate || m.submissionDate || m.dateOpened || m.createdAt,
      tone: "indigo",
      icon: FolderKanban,
    })),
    ...deficienciesResolved.map((d) => ({
      id: d.id,
      title: `${d.requestOrDeficiencyType} — ${agencyName(db, d.agencyId)}`,
      category: "Deficiency Resolved",
      date: d.dueDate || d.dateReceived || d.createdAt,
      tone: "sky",
      icon: ClipboardCheck,
    })),
    ...tasksCompleted.map((t) => ({
      id: t.id,
      title: t.title,
      category: "Task Completed",
      date: t.dueDate || t.createdAt,
      tone: "amber",
      icon: CheckSquare,
    })),
    ...escalationsResolved.map((e) => ({
      id: e.id,
      title: e.summary || e.reasonForEscalation,
      category: "Escalation Resolved",
      date: e.dueDate || e.dateEscalated || e.createdAt,
      tone: "emerald",
      icon: ArrowUpCircle,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const toneMap: Record<string, { chip: string; iconBg: string }> = {
    indigo: { chip: "bg-indigo-50 text-indigo-700 border-indigo-100", iconBg: "bg-indigo-100 text-indigo-600" },
    sky: { chip: "bg-sky-50 text-sky-700 border-sky-100", iconBg: "bg-sky-100 text-sky-600" },
    amber: { chip: "bg-amber-50 text-amber-700 border-amber-100", iconBg: "bg-amber-100 text-amber-600" },
    emerald: { chip: "bg-emerald-50 text-emerald-700 border-emerald-100", iconBg: "bg-emerald-100 text-emerald-600" },
  };

  const kpis = [
    {
      label: "Total Wins",
      value: wins.length,
      icon: Trophy,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Matters Completed",
      value: mattersClosed.length,
      icon: FolderKanban,
      gradient: "from-sky-500 to-blue-600",
      shadow: "hover:shadow-blue-500/30",
    },
    {
      label: "Deficiencies Resolved",
      value: deficienciesResolved.length,
      icon: ClipboardCheck,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Tasks Completed",
      value: tasksCompleted.length,
      icon: CheckSquare,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "hover:shadow-emerald-500/30",
    },
  ];

  const byCategory = [
    { name: "Matters Completed", count: mattersClosed.length, gradient: "from-indigo-500 to-violet-600" },
    { name: "Deficiencies Resolved", count: deficienciesResolved.length, gradient: "from-sky-500 to-blue-600" },
    { name: "Tasks Completed", count: tasksCompleted.length, gradient: "from-amber-500 to-orange-600" },
    { name: "Escalations Resolved", count: escalationsResolved.length, gradient: "from-emerald-500 to-teal-600" },
  ];
  const maxCat = Math.max(...byCategory.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Wins</h2>
            <p className="mt-1.5 max-w-xl text-sm text-white/70">
              A live record of everything you have driven to completion — matters, deficiencies, tasks, and escalations.
            </p>
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
                <div className="text-4xl font-extrabold leading-none tracking-tight">{kpi.value}</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wins feed */}
        <Card className="lg:col-span-2 overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              Achievements Feed
            </h3>
            <span className="text-sm font-medium text-slate-500">{wins.length} wins</span>
          </div>
          <div className="p-4 space-y-2.5 max-h-[560px] overflow-y-auto">
            {wins.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No completed items yet. Wins will appear here as you close work.
              </div>
            ) : (
              wins.map((w) => {
                const Icon = w.icon;
                const tone = toneMap[w.tone];
                return (
                  <div
                    key={`${w.category}-${w.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 hover:border-slate-200 transition-colors"
                  >
                    <div className={`rounded-lg p-2 ${tone.iconBg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{w.title}</p>
                      <p className="text-xs text-slate-400">{fmtDate(w.date)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${tone.chip}`}
                    >
                      {w.category}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* By category */}
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md self-start">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
              Wins by Category
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {byCategory.map((c) => (
              <div key={c.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  <span className="text-sm font-bold text-slate-800">{c.count}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${c.gradient}`}
                    style={{ width: `${(c.count / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
              <Award className="h-6 w-6 shrink-0 text-violet-600" />
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">{wins.length} total wins</span> logged
                across all of your tracked work.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
