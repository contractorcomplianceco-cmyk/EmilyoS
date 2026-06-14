import React from "react";
import { Card } from "@/components/ui/card";
import { useDatabase } from "@/lib/store";
import { Coins, Target, TrendingUp, CalendarClock, CheckCircle2 } from "lucide-react";

const OWNER = "Emily Jones";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function BonusTracker() {
  const db = useDatabase();

  const myMatterIds = new Set(
    db.matters.filter((m) => m.internalOwner === OWNER).map((m) => m.id),
  );

  const mattersClosed = db.matters.filter(
    (m) =>
      m.internalOwner === OWNER && ["Approved / Completed", "Closed"].includes(m.currentStatus),
  ).length;
  const deficienciesResolved = db.deficiencies.filter(
    (d) => d.assignedInternalOwner === OWNER && d.status === "Resolved",
  ).length;
  const tasksCompleted = db.tasks.filter(
    (t) => t.assignedTo === OWNER && t.status === "Completed",
  ).length;
  const escalationsResolved = db.escalations.filter(
    (e) => myMatterIds.has(e.matterId) && ["Resolved", "Closed"].includes(e.status),
  ).length;

  const components = [
    {
      name: "Matters Completed",
      actual: mattersClosed,
      target: 6,
      award: 4000,
      gradient: "from-indigo-500 to-violet-600",
    },
    {
      name: "Deficiencies Resolved",
      actual: deficienciesResolved,
      target: 4,
      award: 3000,
      gradient: "from-sky-500 to-blue-600",
    },
    {
      name: "Tasks Completed",
      actual: tasksCompleted,
      target: 8,
      award: 2500,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      name: "Escalations Resolved",
      actual: escalationsResolved,
      target: 3,
      award: 2500,
      gradient: "from-emerald-500 to-teal-600",
    },
  ].map((c) => {
    const ratio = Math.min(1, c.target === 0 ? 0 : c.actual / c.target);
    return { ...c, pct: Math.round(ratio * 100), earned: Math.round(ratio * c.award) };
  });

  const targetBonus = components.reduce((sum, c) => sum + c.award, 0);
  const earnedBonus = components.reduce((sum, c) => sum + c.earned, 0);
  const overallPct = targetBonus === 0 ? 0 : Math.round((earnedBonus / targetBonus) * 100);

  const kpis = [
    {
      label: "Projected Payout",
      value: currency(earnedBonus),
      icon: Coins,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Target Bonus",
      value: currency(targetBonus),
      icon: Target,
      gradient: "from-sky-500 to-blue-600",
      shadow: "hover:shadow-blue-500/30",
    },
    {
      label: "Progress to Target",
      value: `${overallPct}%`,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Next Payout",
      value: "Dec 2026",
      icon: CalendarClock,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "hover:shadow-emerald-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <Coins className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Bonus Tracker</h2>
            <p className="mt-1.5 max-w-xl text-sm text-white/70">
              Your performance bonus, projected live from completed matters, resolved deficiencies, tasks, and escalations.
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
                <div className="text-3xl font-extrabold leading-none tracking-tight">{kpi.value}</div>
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

      {/* Overall progress */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            Overall Bonus Progress
          </h3>
          <span className="text-sm font-semibold text-slate-500">
            {currency(earnedBonus)} of {currency(targetBonus)}
          </span>
        </div>
        <div className="p-5">
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            You are at <span className="font-semibold text-slate-800">{overallPct}%</span> of your
            target annual bonus based on current performance.
          </p>
        </div>
      </Card>

      {/* Component breakdown */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
            Bonus Components
          </h3>
          <span className="text-sm font-medium text-slate-500">{components.length} metrics</span>
        </div>
        <div className="p-5 space-y-5">
          {components.map((c) => (
            <div key={c.name}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {c.pct >= 100 && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                  <span className="text-xs text-slate-400">
                    {c.actual}/{c.target}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {currency(c.earned)}{" "}
                  <span className="text-xs font-normal text-slate-400">/ {currency(c.award)}</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-2.5 rounded-full bg-gradient-to-r ${c.gradient}`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
