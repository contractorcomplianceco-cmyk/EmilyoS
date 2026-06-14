import React from "react";
import { Card } from "@/components/ui/card";
import { useDatabase } from "@/lib/store";
import { Lightbulb, TrendingUp, AlertTriangle, Activity, Brain, Target } from "lucide-react";
import { isOverdue, daysSince } from "@/lib/format";

const OPEN = (s: string) => !["Closed", "Approved / Completed"].includes(s);

export default function Intelligence() {
  const db = useDatabase();

  const activeMatters = db.matters.filter((m) => OPEN(m.currentStatus)).length;
  const overdueDeficiencies = db.deficiencies.filter(
    (d) => !["Resolved", "Submitted to Agency"].includes(d.status) && isOverdue(d.dueDate),
  ).length;
  const highCriticalOpen = db.matters.filter(
    (m) => OPEN(m.currentStatus) && ["High", "Critical"].includes(m.priorityRiskLevel),
  ).length;
  const staleMatters = db.matters.filter((m) => {
    if (!OPEN(m.currentStatus)) return false;
    const ds = daysSince(m.lastContactDate);
    return ds === null || ds > 14;
  }).length;

  const totalAlerts = db.alerts.length;
  const totalSops = db.sops.length;
  const totalComms = db.communications.length;

  const kpis = [
    {
      label: "Active Matters",
      value: activeMatters,
      icon: Brain,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Open High / Critical Risk",
      value: highCriticalOpen,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Stale Follow-Ups (14d+)",
      value: staleMatters,
      icon: Activity,
      gradient: "from-rose-500 to-red-600",
      shadow: "hover:shadow-rose-500/30",
    },
    {
      label: "Tracked Entities",
      value: db.agencies.length + db.matters.length,
      icon: Target,
      gradient: "from-violet-500 to-purple-600",
      shadow: "hover:shadow-purple-500/30",
    },
  ];

  const healthMax = Math.max(db.agencies.length, db.matters.length, totalAlerts, 1);
  const healthPct = (n: number) => `${Math.round((n / healthMax) * 100)}%`;

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Lightbulb className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Intelligence & Insights</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                AI-driven observations, agency processing trends, and risk forecasts based on recent activities.
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              Agency Processing Trends
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
              <p className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Texas Comptroller
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">Processing times for Sales Tax Permit reviews have increased by 15% over the last 30 days. Recommend adding +7 days to internal SLAs.</p>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
              <p className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> California CSLB
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">New applications are showing a high rate of surety bond formatting inquiries. Consider proactive review of all submitted bonds.</p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
              Risk Forecast
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 hover:border-amber-300/80 transition-colors">
              <p className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Upcoming Deadlines Risk
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">There are <span className="font-semibold text-slate-800">{activeMatters} active matters</span>, and <span className="font-semibold text-amber-700">{overdueDeficiencies} overdue deficiencies</span>. Capacity constraint likely next week.</p>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 hover:border-amber-300/80 transition-colors">
              <p className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Communication Gaps
              </p>
              <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">{staleMatters} active matters</span> have not had recorded contact in over 14 days, across <span className="font-semibold text-slate-800">{totalComms} total logs</span>. Recommend automated follow-up scheduling.</p>
            </div>
          </div>
        </Card>
        
        <Card className="md:col-span-2 overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
              Recommended Workflow Improvements
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50/40 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-colors flex items-start gap-4">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0 mt-0.5">
                <Activity className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-slate-700 leading-relaxed">Consider creating a specialized SOP for EPA Title V Air Permit Annual Reports, as they frequently trigger formatting deficiencies. You currently have <span className="font-semibold">{totalSops} SOPs</span>.</p>
              </div>
            </div>
            <div className="p-5 bg-emerald-50/40 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-colors flex items-start gap-4">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0 mt-0.5">
                <Activity className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-slate-700 leading-relaxed">Standardize the "Waiting on Client" follow-up cadence to reduce stall times on client-dependent actions across your active workload.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
              Database Health
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: healthPct(db.agencies.length) }}></div>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">{db.agencies.length} Agencies</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: healthPct(db.matters.length) }}></div>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">{db.matters.length} Matters</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: healthPct(totalAlerts) }}></div>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">{totalAlerts} Alerts</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
