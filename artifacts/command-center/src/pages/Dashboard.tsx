import React from "react";
import { useDatabase } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  CalendarCheck,
  Clock,
  Hourglass,
  AlertTriangle,
  Flower2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Cherry,
  Gem,
  MessageSquare,
  CalendarDays,
  Heart,
} from "lucide-react";
import { Link } from "wouter";
import { fmtDate, isOverdue, isDueToday, daysUntil } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

const initials = (name: string) =>
  (name || "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GN";

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-primary to-accent" />
      <Icon className="w-4 h-4 text-accent" />
      <h3 className="font-bold text-slate-800 text-base">{children}</h3>
    </div>
  );
}

export default function Dashboard() {
  const db = useDatabase();

  const openMatters = db.matters.filter(
    (m) => !["Closed", "Approved / Completed"].includes(m.currentStatus)
  ).length;

  const dueTodayMatters = db.matters.filter((m) => isDueToday(m.nextFollowUpDate)).length;
  const dueTodayDeficiencies = db.deficiencies.filter(
    (d) => !["Resolved", "Submitted to Agency"].includes(d.status) && isDueToday(d.dueDate)
  ).length;
  const dueTodayEscalations = db.escalations.filter(
    (e) => !["Resolved", "Closed"].includes(e.status) && isDueToday(e.dueDate)
  ).length;
  const dueToday = dueTodayMatters + dueTodayDeficiencies + dueTodayEscalations;

  const overdueMatters = db.matters.filter(
    (m) =>
      !["Closed", "Approved / Completed"].includes(m.currentStatus) &&
      isOverdue(m.nextFollowUpDate)
  ).length;
  const overdueDeficienciesCount = db.deficiencies.filter(
    (d) => !["Resolved", "Submitted to Agency"].includes(d.status) && isOverdue(d.dueDate)
  ).length;
  const overdueTotal = overdueMatters + overdueDeficienciesCount;

  const waitingOnAgency = db.matters.filter((m) => m.currentStatus === "Waiting on Agency").length;
  const deficienciesCount = db.deficiencies.filter(
    (d) => !["Resolved", "Submitted to Agency"].includes(d.status)
  ).length;

  const roseReviewCount = db.escalations.filter((e) =>
    ["Open", "In Review", "Awaiting Decision"].includes(e.status)
  ).length;

  const completedThisWeek =
    db.matters.filter((m) => m.currentStatus === "Approved / Completed").length +
    db.deficiencies.filter((d) => d.status === "Resolved").length;

  const kpis = [
    { label: "Open Matters", value: openMatters, icon: FolderKanban, tint: "bg-sky-50", color: "text-sky-500", to: "/matters" },
    { label: "Due Today", value: dueToday, icon: CalendarCheck, tint: "bg-sky-50", color: "text-sky-500", to: "/calendar" },
    { label: "Overdue", value: overdueTotal, icon: Clock, tint: "bg-rose-50", color: "text-rose-400", to: "/matters" },
    { label: "Waiting on Agency", value: waitingOnAgency, icon: Hourglass, tint: "bg-sky-50", color: "text-sky-500", to: "/matters" },
    { label: "Deficiencies", value: deficienciesCount, icon: AlertTriangle, tint: "bg-pink-50", color: "text-pink-400", to: "/deficiencies" },
    { label: "Rose Review", value: roseReviewCount, icon: Flower2, tint: "bg-pink-50", color: "text-pink-400", to: "/escalations" },
    { label: "Done This Week", value: completedThisWeek, icon: CheckCircle2, tint: "bg-sky-50", color: "text-sky-500", to: "/my-wins" },
  ];

  const agencyMatters = db.matters
    .filter((m) => !["Closed", "Approved / Completed"].includes(m.currentStatus))
    .sort((a, b) => new Date(a.nextFollowUpDate).getTime() - new Date(b.nextFollowUpDate).getTime())
    .slice(0, 5);

  const priorityTasks = [...db.tasks]
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const needsRoseQueue = [...db.escalations]
    .filter((e) => ["Open", "In Review", "Awaiting Decision"].includes(e.status))
    .slice(0, 5);

  const recentChats = [...db.communications]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 3);

  const upcomingMatters = db.matters
    .filter((m) => m.nextFollowUpDate && (daysUntil(m.nextFollowUpDate) ?? -1) >= 0)
    .map((m) => ({
      id: m.id,
      date: m.nextFollowUpDate,
      title: m.title,
      sub: db.agencies.find((a) => a.id === m.agencyId)?.name || m.clientOrCompanyName || "",
    }));

  const upcomingDeficiencies = db.deficiencies
    .filter(
      (d) =>
        !["Resolved", "Submitted to Agency"].includes(d.status) &&
        d.dueDate &&
        (daysUntil(d.dueDate) ?? -1) >= 0
    )
    .map((d) => ({
      id: d.id,
      date: d.dueDate,
      title: "Deficiency: " + d.requestOrDeficiencyType,
      sub: db.agencies.find((a) => a.id === d.agencyId)?.name || "Agency Follow-Up",
    }));

  const allUpcoming = [...upcomingMatters, ...upcomingDeficiencies].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const calCols = [
    { label: "Today", items: allUpcoming.filter((x) => isDueToday(x.date)) },
    { label: "Tomorrow", items: allUpcoming.filter((x) => daysUntil(x.date) === 1) },
    {
      label: "This Week",
      items: allUpcoming.filter((x) => {
        const d = daysUntil(x.date);
        return d != null && d >= 2 && d <= 7;
      }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.to}>
              <Card className="group h-full cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.tint} transition-transform group-hover:scale-105`}>
                    <Icon className={`h-[18px] w-[18px] ${kpi.color}`} />
                  </div>
                  <span className="max-w-[80px] text-right text-[11px] font-semibold leading-tight text-slate-500">
                    {kpi.label}
                  </span>
                </div>
                <div className="mt-3 text-3xl font-bold leading-none tracking-tight text-slate-800">
                  {kpi.value}
                </div>
                <div className="mt-2 flex items-center gap-0.5 text-[11px] font-semibold text-primary">
                  View all <ChevronRight className="h-3 w-3" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: board + calendar/chats */}
        <div className="space-y-6 xl:col-span-2">
          {/* Agency Matter Board */}
          <Card className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white p-5">
              <SectionTitle icon={Sparkles}>Agency Matter Board</SectionTitle>
              <Link
                href="/matters"
                className="flex items-center text-sm font-medium text-primary hover:underline"
              >
                View all matters <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Matter</th>
                    <th className="px-5 py-3 font-medium">Agency</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Risk</th>
                    <th className="px-5 py-3 font-medium">Next Follow-Up</th>
                    <th className="px-5 py-3 font-medium">Owner</th>
                    <th className="px-5 py-3 font-medium">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white/40">
                  {agencyMatters.map((row) => {
                    const agency = db.agencies.find((a) => a.id === row.agencyId);
                    return (
                      <tr key={row.id} className="group cursor-pointer transition-colors hover:bg-primary/5">
                        <td className="px-5 py-3.5 font-semibold text-slate-700">{row.title}</td>
                        <td className="px-5 py-3.5 text-slate-500">{agency?.name || "—"}</td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant="outline"
                            className={`rounded-full font-medium shadow-none ${
                              row.currentStatus === "Waiting on Agency"
                                ? "border-amber-100 bg-amber-50 text-amber-600"
                                : row.currentStatus === "Escalated" ||
                                  row.currentStatus === "Deficiency Received"
                                ? "border-rose-100 bg-rose-50 text-rose-500"
                                : row.currentStatus === "In Review"
                                ? "border-pink-100 bg-pink-50 text-pink-500"
                                : "border-sky-100 bg-sky-50 text-sky-600"
                            }`}
                          >
                            {row.currentStatus}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                row.priorityRiskLevel === "Critical"
                                  ? "bg-rose-400"
                                  : row.priorityRiskLevel === "High"
                                  ? "bg-pink-400"
                                  : row.priorityRiskLevel === "Medium"
                                  ? "bg-amber-400"
                                  : "bg-sky-400"
                              }`}
                            />
                            {row.priorityRiskLevel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                            {fmtDate(row.nextFollowUpDate)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                              {(row.internalOwner || "EJ").slice(0, 2).toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-600">{row.internalOwner || "Emily Jones"}</span>
                          </span>
                        </td>
                        <td className="max-w-[160px] truncate px-5 py-3.5 text-slate-500">
                          {row.nextAction || "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {agencyMatters.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                        No open matters to display.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Follow-Up Calendar + Chats */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Follow-Up Calendar */}
            <Card className="flex flex-col rounded-2xl border border-white bg-white/90 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <SectionTitle icon={Cherry}>Follow-Up Calendar</SectionTitle>
                <Link href="/calendar" className="text-xs font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid flex-1 grid-cols-3 divide-x divide-slate-100">
                {calCols.map((col) => (
                  <div key={col.label} className="min-w-0 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{col.label}</span>
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-bold text-primary">
                        {col.items.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {col.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-lg bg-slate-50/70 p-2">
                          <p className="truncate text-[11px] font-semibold text-slate-700">{item.title}</p>
                          <p className="mt-0.5 truncate text-[10px] text-slate-400">{item.sub}</p>
                        </div>
                      ))}
                      {col.items.length === 0 && (
                        <p className="py-2 text-[10px] text-slate-300">Nothing scheduled</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Chats + Notes */}
            <Card className="flex flex-col rounded-2xl border border-white bg-white/90 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <SectionTitle icon={MessageSquare}>Chats + Notes</SectionTitle>
                <Link
                  href="/communications"
                  className="flex items-center text-xs font-medium text-primary hover:underline"
                >
                  Go to Chats / Notes <ChevronRight className="ml-0.5 h-3 w-3" />
                </Link>
              </div>
              <div className="flex-1 space-y-3 p-4">
                {recentChats.map((chat) => {
                  const agency = db.agencies.find((a) => a.id === chat.agencyId);
                  const name = agency?.name || "General Note";
                  return (
                    <div key={chat.id} className="flex gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 to-accent/30 text-[11px] font-bold text-primary">
                        {initials(name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="truncate text-sm font-semibold text-slate-700">{name}</h4>
                          <span className="shrink-0 text-[10px] text-slate-400">{fmtDate(chat.dateTime)}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {chat.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {recentChats.length === 0 && (
                  <div className="py-6 text-center text-sm text-slate-400">No recent chats or notes.</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6 xl:col-span-1">
          {/* Today's Pretty Priorities */}
          <Card className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent p-4">
              <SectionTitle icon={Gem}>Today's Pretty Priorities</SectionTitle>
            </div>
            <div className="p-2">
              {priorityTasks.length > 0 ? (
                priorityTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-primary/5"
                  >
                    <Checkbox className="mt-0.5 rounded-full border-slate-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium leading-tight text-slate-700 group-hover:text-primary">
                        {task.title}
                      </h4>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-slate-400">
                      {fmtDate(task.dueDate)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-slate-400">
                  <Heart className="h-6 w-6 text-slate-200" />
                  All caught up for today!
                </div>
              )}
            </div>
          </Card>

          {/* Needs Rose */}
          <Card className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <SectionTitle icon={Flower2}>Needs Rose</SectionTitle>
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-pink-100 px-1.5 text-xs font-bold text-pink-600">
                {needsRoseQueue.length}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {needsRoseQueue.length > 0 ? (
                needsRoseQueue.map((esc) => {
                  const matter = db.matters.find((m) => m.id === esc.matterId);
                  return (
                    <div
                      key={esc.id}
                      className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-pink-50/40"
                    >
                      <h4 className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                        {matter?.title || "Matter Review"}
                      </h4>
                      <Badge className="shrink-0 rounded-full border border-pink-100 bg-pink-50 px-2.5 py-0.5 text-[10px] font-semibold text-pink-500 shadow-none hover:bg-pink-50">
                        Rose Review
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-slate-400">
                  <Sparkles className="h-6 w-6 text-slate-200" />
                  Nothing waiting for Rose.
                </div>
              )}
              <Link
                href="/escalations"
                className="flex items-center gap-1 p-4 text-xs font-semibold text-primary hover:underline"
              >
                Go to Rose Review <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          {/* Decorative charm cluster */}
          <div className="pointer-events-none hidden select-none justify-center pt-1 xl:flex">
            <img
              src={asset("decor/charm-cluster.png")}
              alt=""
              className="w-full max-w-[260px] opacity-95 drop-shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Compliance footer */}
      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-slate-400">
        <Heart className="h-3 w-3 text-pink-300" />
        Tracking and routing only. Final legal, tax, compliance, pricing, refund, and contract decisions require approved review.
      </p>
    </div>
  );
}
