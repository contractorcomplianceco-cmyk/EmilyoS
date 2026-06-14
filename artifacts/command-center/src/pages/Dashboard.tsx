import React from "react";
import { useDatabase } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { 
  Building2, 
  FolderKanban, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { Link } from "wouter";
import { fmtDate, isOverdue, fmtDateTime, daysUntil } from "@/lib/format";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function parseDateParts(value?: string | null): { month: string; day: string } {
  if (!value) return { month: "—", day: "—" };
  const [, mo, dy] = value.slice(0, 10).split("-");
  const idx = Number(mo) - 1;
  return { month: MONTHS[idx] ?? "—", day: dy ?? "—" };
}

export default function Dashboard() {
  const db = useDatabase();

  // Metrics
  const activeAgencies = db.agencies.filter(a => a.activeStatus === "Active").length;
  const activeMatters = db.matters.filter(m => !["Closed", "Approved / Completed"].includes(m.currentStatus)).length;
  const openDeficiencies = db.deficiencies.filter(d => !["Resolved", "Submitted to Agency"].includes(d.status)).length;
  const upcomingTasks = db.tasks.filter(t => t.status !== "Completed" && !isOverdue(t.dueDate)).length;

  // Chart Data
  const mattersByStatus = db.matters.reduce((acc, m) => {
    let cat = "In Progress";
    if (m.currentStatus === "Approved / Completed") cat = "Compliant";
    else if (["Deficiency Received", "Escalated"].includes(m.currentStatus)) cat = "At Risk";
    else if (m.currentStatus === "Not Started") cat = "Pending";
    
    // Check overdue separately if needed, for simplicity let's stick to status
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: "Compliant", value: mattersByStatus["Compliant"] || 0, color: "hsl(147, 68%, 50%)" }, // Success Green
    { name: "In Progress", value: mattersByStatus["In Progress"] || 0, color: "hsl(282, 78%, 66%)" }, // Magenta Purple
    { name: "At Risk", value: mattersByStatus["At Risk"] || 0, color: "hsl(39, 100%, 56%)" }, // Warning Orange
    { name: "Pending", value: mattersByStatus["Pending"] || 0, color: "hsl(232, 36%, 40%)" }, // Muted
  ].filter(d => d.value > 0);

  const totalChartItems = chartData.reduce((sum, d) => sum + d.value, 0);

  // Recent tables
  const agencyOverview = db.agencies.slice(0, 5).map(agency => {
    const latestMatter = db.matters.filter(m => m.agencyId === agency.id).sort((a, b) => new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime())[0];
    return {
      id: agency.id,
      name: agency.name,
      type: agency.agencyType,
      status: latestMatter ? "Active" : "Monitoring",
      lastContact: latestMatter?.lastContactDate || "N/A",
      nextAction: latestMatter?.nextAction || "None"
    };
  });

  const recentComms = [...db.communications]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  const priorityTasks = [...db.tasks]
    .filter(t => t.status !== "Completed")
    .sort((a, b) => {
      const p = { High: 0, Medium: 1, Low: 2 };
      return p[a.priority as keyof typeof p] - p[b.priority as keyof typeof p];
    })
    .slice(0, 4);

  const activeAlerts = [...db.alerts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Derived risk signals (kept in sync with live CRUD data)
  const overdueTasks = db.tasks.filter(
    (t) => t.status !== "Completed" && isOverdue(t.dueDate),
  ).length;
  const overdueDeficiencies = db.deficiencies.filter(
    (d) => !["Resolved", "Submitted to Agency"].includes(d.status) && isOverdue(d.dueDate),
  ).length;
  const totalOverdue = overdueTasks + overdueDeficiencies;

  const riskAlerts = [...db.alerts]
    .filter((a) => a.severity === "Critical" || a.severity === "Warning")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const upcomingCalendar = db.matters
    .filter((m) => m.deadlineRenewalDate && (daysUntil(m.deadlineRenewalDate) ?? -1) >= 0)
    .sort(
      (a, b) =>
        new Date(a.deadlineRenewalDate).getTime() - new Date(b.deadlineRenewalDate).getTime(),
    )
    .slice(0, 3)
    .map((m) => ({
      id: m.id,
      date: m.deadlineRenewalDate,
      title: m.title,
      sub: db.agencies.find((a) => a.id === m.agencyId)?.name || m.clientOrCompanyName || "",
    }));

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Main Content Area */}
      <div className="min-w-0 flex-1 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Active Agencies",
              value: activeAgencies,
              icon: Building2,
              gradient: "from-indigo-600 to-violet-600",
              shadow: "hover:shadow-indigo-500/30",
            },
            {
              label: "Active Projects",
              value: activeMatters,
              icon: FolderKanban,
              gradient: "from-violet-500 to-purple-600",
              shadow: "hover:shadow-purple-500/30",
            },
            {
              label: "Compliance Items",
              value: openDeficiencies,
              icon: AlertTriangle,
              gradient: "from-amber-500 to-orange-600",
              shadow: "hover:shadow-amber-500/30",
            },
            {
              label: "Upcoming Deadlines",
              value: upcomingTasks,
              icon: Clock,
              gradient: "from-emerald-500 to-teal-600",
              shadow: "hover:shadow-emerald-500/30",
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={kpi.label}
                className={`relative overflow-hidden p-5 border-0 rounded-2xl text-white shadow-lg bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} hover:shadow-2xl transition-all hover:-translate-y-1`}
              >
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="relative flex items-start justify-between mb-3">
                  <div className="text-4xl font-extrabold tracking-tight leading-none">{kpi.value}</div>
                  <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl ring-1 ring-white/30">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <span className="relative block text-xs font-semibold text-white/85 uppercase tracking-wider">
                  {kpi.label}
                </span>
              </Card>
            );
          })}
        </div>

        {/* Center Section 1: Agency Engagement */}
        <Card className="bg-white/80 backdrop-blur-md shadow-sm border-white/20 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              Agency Engagement Overview
            </h3>
            <Link href="/agencies" className="text-sm text-primary font-medium hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Agency Name</th>
                  <th className="px-5 py-3">Engagement Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last Contact</th>
                  <th className="px-5 py-3">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agencyOverview.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-5 py-3 font-medium text-slate-800">{row.name}</td>
                    <td className="px-5 py-3 text-slate-600">{row.type}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className={row.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{fmtDate(row.lastContact)}</td>
                    <td className="px-5 py-3 text-slate-600 truncate max-w-[200px]">{row.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Center Section 2: Split Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ring Chart */}
          <Card className="bg-white/80 backdrop-blur-md shadow-sm border-white/20 p-5 flex flex-col">
            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
              Compliance Status
            </h3>
            <div className="relative flex-1 min-h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-slate-800">{totalChartItems}</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Items</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </Card>

          {/* Change Monitor List */}
          <Card className="bg-white/80 backdrop-blur-md shadow-sm border-white/20 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2.5">
                <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
                Regulatory Change Monitor
              </h3>
              <Link href="/change-monitor" className="text-sm text-primary font-medium hover:underline flex items-center">
                All Updates <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="flex-1 p-5 space-y-4">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
                  <div className={`p-2 rounded-md shrink-0 mt-0.5 ${alert.type === 'New' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">{alert.title}</h4>
                      <Badge variant="outline" className={alert.type === 'New' ? "bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-1.5" : "bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5"}>
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{alert.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Section: Recent Comms */}
        <Card className="bg-white/80 backdrop-blur-md shadow-sm border-white/20 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
              Recent Communications Log
            </h3>
            <Link href="/communications" className="text-sm text-primary font-medium hover:underline flex items-center">
              View Log <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">From</th>
                  <th className="px-5 py-3">Agency</th>
                  <th className="px-5 py-3">Subject / Summary</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentComms.map((comm) => {
                  const agency = db.agencies.find(a => a.id === comm.agencyId);
                  return (
                    <tr key={comm.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-5 py-3 font-medium text-slate-800">{comm.loggedBy}</td>
                      <td className="px-5 py-3 text-slate-600">{agency?.name || "Unknown"}</td>
                      <td className="px-5 py-3 text-slate-600 truncate max-w-[300px]">{comm.summary}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{fmtDateTime(comm.dateTime)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Right Rail */}
      <div className="w-full xl:w-[320px] 2xl:w-[380px] shrink-0 space-y-6">
        
        {/* Priorities */}
        <Card className="bg-white/80 backdrop-blur-md shadow-sm border-white/20">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">My Priorities</h3>
            <Link href="/tasks" className="text-primary hover:bg-primary/10 p-1 rounded transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-2">
            {priorityTasks.length > 0 ? priorityTasks.map(task => (
              <div key={task.id} className="p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-primary">{task.title}</h4>
                  <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 ${
                    task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center text-[11px] text-slate-500 mt-2">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className={isOverdue(task.dueDate) ? "text-destructive font-medium" : ""}>
                    {fmtDate(task.dueDate)}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-sm text-slate-500">No priorities right now.</div>
            )}
          </div>
        </Card>

        {/* Upcoming Calendar Mini */}
        <Card className="bg-white/80 backdrop-blur-md shadow-sm border-white/20">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Upcoming Calendar</h3>
            <Link href="/calendar" className="text-primary hover:bg-primary/10 p-1 rounded transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {upcomingCalendar.length > 0 ? (
              upcomingCalendar.map((item, i) => {
                const { month, day } = parseDateParts(item.date);
                return (
                  <div key={item.id} className="flex gap-4">
                    <div
                      className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border shrink-0 ${
                        i === 0
                          ? "bg-primary/5 border-primary/10 text-primary"
                          : "bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase">{month}</span>
                      <span className="text-lg font-bold leading-none">{day}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {item.title}
                      </h4>
                      {item.sub ? (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.sub}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No upcoming deadlines.
              </p>
            )}
          </div>
        </Card>

        {/* Alerts & Risk Panel */}
        <Card className="bg-white/80 backdrop-blur-md shadow-sm border-white/20 border-t-4 border-t-amber-500">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alerts & Risk Panel
            </h3>
          </div>
          <div className="p-2 space-y-1">
            {totalOverdue > 0 && (
              <div className="p-3 bg-red-50/50 rounded-md border border-red-100">
                <h4 className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Overdue Items
                </h4>
                <p className="text-xs text-red-700/80 leading-relaxed">
                  {overdueTasks} {overdueTasks === 1 ? "task" : "tasks"} and {overdueDeficiencies}{" "}
                  {overdueDeficiencies === 1 ? "compliance deficiency" : "compliance deficiencies"}{" "}
                  require immediate attention.
                </p>
              </div>
            )}
            {riskAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 hover:bg-slate-50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-100"
              >
                <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      alert.severity === "Critical" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  ></span>{" "}
                  {alert.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{alert.detail}</p>
              </div>
            ))}
            {totalOverdue === 0 && riskAlerts.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                No active risks or overdue items.
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}