import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDatabase } from "@/lib/store";
import { isOverdue } from "@/lib/format";
import {
  OPEN_MATTER_STATUSES,
  OPEN_DEFICIENCY_STATUSES,
  OPEN_ESCALATION_STATUSES,
  RISK_LEVELS,
} from "@/lib/types";
import { BarChart3, FolderKanban, AlertTriangle, ShieldAlert, Clock, MessageSquare, FileWarning } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  Low: "#94a3b8",
  Medium: "#3b82f6",
  High: "#f59e0b",
  Critical: "#ef4444",
};

export default function Reports() {
  const db = useDatabase();

  const openMatters = db.matters.filter((m) =>
    OPEN_MATTER_STATUSES.includes(m.currentStatus),
  );
  const openDeficiencies = db.deficiencies.filter((d) =>
    OPEN_DEFICIENCY_STATUSES.includes(d.status),
  );
  const openEscalations = db.escalations.filter((e) =>
    OPEN_ESCALATION_STATUSES.includes(e.status),
  );
  const overdueFollowUps = db.matters.filter(
    (m) =>
      OPEN_MATTER_STATUSES.includes(m.currentStatus) && isOverdue(m.nextFollowUpDate),
  );

  const stats = {
    matters: openMatters.length,
    deficiencies: openDeficiencies.length,
    escalations: openEscalations.length,
    overdue: overdueFollowUps.length,
  };

  const kpis = [
    {
      label: "Open Matters",
      value: stats.matters,
      icon: FolderKanban,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Open Deficiencies",
      value: stats.deficiencies,
      icon: FileWarning,
      gradient: "from-violet-500 to-purple-600",
      shadow: "hover:shadow-purple-500/30",
    },
    {
      label: "Active Escalations",
      value: stats.escalations,
      icon: ShieldAlert,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Overdue Follow-Ups",
      value: stats.overdue,
      icon: Clock,
      gradient: "from-red-500 to-rose-600",
      shadow: "hover:shadow-red-500/30",
    },
  ];

  const byStatus = useMemo(() => {
    const counts = new Map<string, number>();
    db.matters.forEach((m) =>
      counts.set(m.currentStatus, (counts.get(m.currentStatus) ?? 0) + 1),
    );
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [db.matters]);

  const byRisk = useMemo(() => {
    return RISK_LEVELS.map((r) => ({
      name: r,
      value: db.matters.filter((m) => m.priorityRiskLevel === r).length,
    })).filter((d) => d.value > 0);
  }, [db.matters]);

  const byAgency = useMemo(() => {
    return db.agencies
      .map((a) => ({
        name: a.name.replace(/^(California|Texas|Florida|Delaware|US |City of )/, "").slice(0, 18),
        Open: db.matters.filter(
          (m) => m.agencyId === a.id && OPEN_MATTER_STATUSES.includes(m.currentStatus),
        ).length,
        Total: db.matters.filter((m) => m.agencyId === a.id).length,
      }))
      .filter((d) => d.Total > 0)
      .sort((a, b) => b.Total - a.Total)
      .slice(0, 10); // Top 10
  }, [db.agencies, db.matters]);

  const workload = useMemo(() => {
    const counts = new Map<string, { open: number; total: number }>();
    db.matters.forEach((m) => {
      const owner = m.internalOwner || "Unassigned";
      const cur = counts.get(owner) ?? { open: 0, total: 0 };
      cur.total += 1;
      if (OPEN_MATTER_STATUSES.includes(m.currentStatus)) cur.open += 1;
      counts.set(owner, cur);
    });
    return Array.from(counts.entries())
      .map(([owner, v]) => ({ owner, ...v }))
      .sort((a, b) => b.open - a.open);
  }, [db.matters]);

  const commsByMethod = useMemo(() => {
    const counts = new Map<string, number>();
    db.communications.forEach(c => {
      counts.set(c.contactMethod, (counts.get(c.contactMethod) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [db.communications]);

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports & Analytics</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Operational metrics across matters, risk, agencies, and team workload.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              Matters by Status
            </h3>
          </div>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byStatus} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  stroke="#64748b"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" name="Matters" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
              Matters by Risk
            </h3>
          </div>
          <CardContent className="p-5">
            {byRisk.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byRisk}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={60}
                    paddingAngle={2}
                    label={(e) => `${e.name}: ${e.value}`}
                    labelLine={false}
                    fontSize={11}
                    isAnimationActive={false}
                    stroke="none"
                  >
                    {byRisk.map((d) => (
                      <Cell key={d.name} fill={RISK_COLORS[d.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
              Top Agencies by Workload
            </h3>
          </div>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byAgency} margin={{ left: -10, right: 8, top: 8 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} stroke="#64748b" />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Open" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="Total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
                Communications by Method
              </h3>
            </div>
            <CardContent className="p-5 flex justify-center items-center h-[180px]">
              {commsByMethod.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No data</p>
              ) : (
                <div className="w-full">
                   {commsByMethod.slice(0, 5).map(m => (
                     <div key={m.name} className="flex items-center gap-3 mb-3 last:mb-0">
                       <span className="text-sm font-medium w-32 truncate">{m.name}</span>
                       <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                         <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(m.value / Math.max(...commsByMethod.map(x => x.value))) * 100}%` }}></div>
                       </div>
                       <span className="text-sm font-bold w-8 text-right">{m.value}</span>
                     </div>
                   ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-slate-500 to-slate-700" />
                Team Workload
              </h3>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead>Internal Owner</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workload.slice(0, 4).map((w) => (
                    <TableRow key={w.owner}>
                      <TableCell className="font-medium text-slate-800">{w.owner}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{w.open}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{w.total}</TableCell>
                    </TableRow>
                  ))}
                  {workload.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">No data</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
