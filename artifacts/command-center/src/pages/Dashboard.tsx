import React from "react";
import { useDatabase } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowUpRight,
  Star,
  CheckCircle2,
  CalendarDays,
  MessageSquare,
  Sparkles,
  Heart,
  Flower2,
  Shell
} from "lucide-react";
import { Link } from "wouter";
import { fmtDate, isOverdue, fmtDateTime, daysUntil, isDueToday } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function parseDateParts(value?: string | null): { month: string; day: string } {
  if (!value) return { month: "—", day: "—" };
  const [, mo, dy] = value.slice(0, 10).split("-");
  const idx = Number(mo) - 1;
  return { month: MONTHS[idx] ?? "—", day: dy ?? "—" };
}

export default function Dashboard() {
  const db = useDatabase();

  // Dashboard Data Mapped to Mockup requirements
  const openMatters = db.matters.filter(m => !["Closed", "Approved / Completed"].includes(m.currentStatus)).length;
  
  // Tasks/Items Due Today
  const dueTodayMatters = db.matters.filter(m => isDueToday(m.nextFollowUpDate)).length;
  const dueTodayDeficiencies = db.deficiencies.filter(d => !["Resolved", "Submitted to Agency"].includes(d.status) && isDueToday(d.dueDate)).length;
  const dueTodayEscalations = db.escalations.filter(e => !["Resolved", "Closed"].includes(e.status) && isDueToday(e.dueDate)).length;
  const dueToday = dueTodayMatters + dueTodayDeficiencies + dueTodayEscalations;

  const overdueMatters = db.matters.filter(m => !["Closed", "Approved / Completed"].includes(m.currentStatus) && isOverdue(m.nextFollowUpDate)).length;
  const overdueDeficienciesCount = db.deficiencies.filter(d => !["Resolved", "Submitted to Agency"].includes(d.status) && isOverdue(d.dueDate)).length;
  const overdueTotal = overdueMatters + overdueDeficienciesCount;

  const waitingOnAgency = db.matters.filter(m => m.currentStatus === "Waiting on Agency").length;
  const deficienciesCount = db.deficiencies.filter(d => !["Resolved", "Submitted to Agency"].includes(d.status)).length;
  
  // Rose Review uses escalations
  const roseReviewCount = db.escalations.filter(e => ["Open", "In Review", "Awaiting Decision"].includes(e.status)).length;

  const completedThisWeek = db.matters.filter(m => m.currentStatus === "Approved / Completed").length + 
                            db.deficiencies.filter(d => d.status === "Resolved").length; // Approximate for demo

  // Agency Matter Board
  const agencyMatters = db.matters
    .filter(m => !["Closed", "Approved / Completed"].includes(m.currentStatus))
    .sort((a, b) => new Date(a.nextFollowUpDate).getTime() - new Date(b.nextFollowUpDate).getTime())
    .slice(0, 5);

  // Today's Pretty Priorities (Tasks)
  const priorityTasks = [...db.tasks]
    .filter(t => t.status !== "Completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Needs Rose (Review Queue)
  const needsRoseQueue = [...db.escalations]
    .filter(e => ["Open", "In Review", "Awaiting Decision"].includes(e.status))
    .slice(0, 3);

  // Chats + Notes (Communications)
  const recentChats = [...db.communications]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 4);

  // Follow-Up Calendar
  const upcomingMatters = db.matters
    .filter((m) => m.nextFollowUpDate && (daysUntil(m.nextFollowUpDate) ?? -1) >= 0)
    .map((m) => ({
      id: m.id,
      date: m.nextFollowUpDate,
      title: m.title,
      sub: db.agencies.find((a) => a.id === m.agencyId)?.name || m.clientOrCompanyName || "",
    }));

  const upcomingDeficiencies = db.deficiencies
    .filter((d) => !["Resolved", "Submitted to Agency"].includes(d.status) && d.dueDate && (daysUntil(d.dueDate) ?? -1) >= 0)
    .map((d) => ({
      id: d.id,
      date: d.dueDate,
      title: "Deficiency: " + d.requestOrDeficiencyType,
      sub: db.agencies.find((a) => a.id === d.agencyId)?.name || "Agency Follow-Up",
    }));

  const upcomingCalendar = [...upcomingMatters, ...upcomingDeficiencies]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);


  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Main Content Area */}
      <div className="min-w-0 flex-1 space-y-6">
        
        {/* Soft KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {[
            { label: "Open Matters", value: openMatters, icon: FolderKanban, bg: "bg-white", text: "text-slate-700" },
            { label: "Due Today", value: dueToday, icon: Clock, bg: "bg-blue-50/80", text: "text-blue-700" },
            { label: "Overdue", value: overdueTotal, icon: AlertTriangle, bg: "bg-rose-50/80", text: "text-rose-700" },
            { label: "Waiting on Agency", value: waitingOnAgency, icon: Building2, bg: "bg-white", text: "text-slate-700" },
            { label: "Deficiencies", value: deficienciesCount, icon: Activity, bg: "bg-amber-50/80", text: "text-amber-700" },
            { label: "Rose Review", value: roseReviewCount, icon: Star, bg: "bg-pink-50/80", text: "text-pink-700" },
            { label: "Done This Week", value: completedThisWeek, icon: CheckCircle2, bg: "bg-emerald-50/80", text: "text-emerald-700" },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={kpi.label + idx}
                className={`relative overflow-hidden p-4 border-slate-100/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group rounded-2xl ${kpi.bg}`}
              >
                <div className="flex flex-col gap-2">
                  <div className={`p-1.5 rounded-xl w-fit ${kpi.bg === 'bg-white' ? 'bg-primary/10 text-primary' : 'bg-white/60'} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${kpi.bg === 'bg-white' ? 'text-primary' : kpi.text}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold tracking-tight leading-none mb-1 ${kpi.bg === 'bg-white' ? 'text-slate-800' : kpi.text}`}>{kpi.value}</div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${kpi.bg === 'bg-white' ? 'text-slate-500' : kpi.text}`}>
                      {kpi.label}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/20 rounded-full blur-xl pointer-events-none" />
              </Card>
            );
          })}
        </div>

        {/* Agency Matter Board */}
        <Card className="bg-white/80 backdrop-blur-xl shadow-sm border-white rounded-2xl overflow-hidden">
          <div className="p-5 flex justify-between items-center bg-white border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Agency Matter Board
            </h3>
            <Link href="/matters" className="text-sm text-primary font-medium hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100/50">
                <tr>
                  <th className="px-5 py-3">Matter</th>
                  <th className="px-5 py-3">Agency</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Next Follow-Up</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white/40">
                {agencyMatters.map((row) => {
                  const agency = db.agencies.find(a => a.id === row.agencyId);
                  return (
                  <tr key={row.id} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{row.title}</td>
                    <td className="px-5 py-3.5 text-slate-500">{agency?.name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={`font-medium shadow-sm ${
                        row.currentStatus === 'Waiting on Agency' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        row.currentStatus === 'Escalated' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        row.currentStatus === 'Deficiency Received' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        row.currentStatus === 'In Review' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                        row.currentStatus === 'Preparing' || row.currentStatus === 'Submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {row.currentStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={`text-[10px] px-1.5 shadow-sm ${
                        row.priorityRiskLevel === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        row.priorityRiskLevel === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        row.priorityRiskLevel === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {row.priorityRiskLevel}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        {fmtDate(row.nextFollowUpDate)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {row.internalOwner.slice(0,2).toUpperCase() || "EJ"}
                        </div>
                        <span className="text-xs">{row.internalOwner || "Emily Jones"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 truncate max-w-[150px]">{row.nextAction || "—"}</td>
                  </tr>
                )})}
                {agencyMatters.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">No open matters to display.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Chats + Notes & Follow-Up Calendar Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chats + Notes */}
          <Card className="bg-white/80 backdrop-blur-xl shadow-sm border-white rounded-2xl flex flex-col">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white rounded-t-2xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Chats + Notes
              </h3>
              <Link href="/communications" className="text-sm text-primary font-medium hover:underline flex items-center">
                All Logs <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-white/40">
              {recentChats.map(chat => {
                const agency = db.agencies.find(a => a.id === chat.agencyId);
                return (
                  <div key={chat.id} className="flex gap-3 p-3 rounded-xl bg-white shadow-sm border border-slate-100 hover:border-primary/20 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-primary/10">
                      <Shell className="w-4 h-4 text-blue-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="text-sm font-semibold text-slate-700 truncate">{agency?.name || "General Note"}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{fmtDate(chat.dateTime)}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{chat.summary}</p>
                      {chat.followUpNeeded && (
                        <div className="mt-2 text-[10px] font-semibold text-accent flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Follow-Up Needed
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {recentChats.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">No recent chats or notes.</div>
              )}
            </div>
          </Card>

          {/* Follow-Up Calendar */}
          <Card className="bg-white/80 backdrop-blur-xl shadow-sm border-white rounded-2xl flex flex-col">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white rounded-t-2xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-accent" />
                Follow-Up Calendar
              </h3>
              <Link href="/calendar" className="text-sm text-primary font-medium hover:underline flex items-center">
                Full Calendar <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="flex-1 p-4 space-y-4 bg-white/40">
              {upcomingCalendar.length > 0 ? (
                upcomingCalendar.map((item, i) => {
                  const { month, day } = parseDateParts(item.date);
                  return (
                    <div key={item.id} className="flex gap-4 items-center p-2 rounded-xl hover:bg-white transition-colors group">
                      <div
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 shadow-sm border ${
                          i === 0
                            ? "bg-accent/10 border-accent/20 text-accent"
                            : "bg-white border-slate-100 text-slate-600"
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase">{month}</span>
                        <span className="text-lg font-extrabold leading-none">{day}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-700 line-clamp-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {item.sub}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">
                  No upcoming deadlines this week.
                </p>
              )}
            </div>
          </Card>

        </div>

      </div>

      {/* Right Rail */}
      <div className="w-full xl:w-[340px] shrink-0 space-y-6">
        
        {/* Today's Pretty Priorities */}
        <Card className="bg-white/80 backdrop-blur-xl shadow-sm border-white rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Flower2 className="w-4 h-4 text-primary" />
              Today's Pretty Priorities
            </h3>
          </div>
          <div className="p-3 bg-white/40">
            {priorityTasks.length > 0 ? priorityTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 hover:bg-white rounded-xl transition-all cursor-pointer group mb-1 last:mb-0">
                <Checkbox className="mt-0.5 rounded-full border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-700 leading-tight group-hover:text-primary transition-colors">{task.title}</h4>
                  <div className="flex items-center text-[11px] text-slate-400 mt-1.5 gap-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtDate(task.dueDate)}</span>
                    <Badge variant="outline" className={`shrink-0 text-[9px] px-1.5 py-0 border-none bg-slate-100 text-slate-500`}>
                      {task.priority} Priority
                    </Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                <Heart className="w-6 h-6 text-slate-200" />
                All caught up for today!
              </div>
            )}
          </div>
        </Card>

        {/* Needs Rose Review Queue */}
        <Card className="bg-white/80 backdrop-blur-xl shadow-sm border-white rounded-2xl overflow-hidden border-t-4 border-t-accent">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-4 h-4 text-accent fill-accent/20" />
              Needs Rose
            </h3>
            <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 border-none shadow-none">{needsRoseQueue.length}</Badge>
          </div>
          <div className="p-3 space-y-2 bg-white/40">
            {needsRoseQueue.length > 0 ? needsRoseQueue.map((esc) => {
              const matter = db.matters.find(m => m.id === esc.matterId);
              return (
              <div
                key={esc.id}
                className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-accent/30 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <Badge className="bg-pink-50 text-pink-700 border border-pink-100 text-[10px] px-1.5 py-0 hover:bg-pink-50 shadow-none">
                    Review
                  </Badge>
                  <span className="text-[10px] text-slate-400">{fmtDate(esc.dueDate)}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1 group-hover:text-accent transition-colors line-clamp-1">
                  {matter?.title || "Matter Review"}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{esc.reasonForEscalation}</p>
              </div>
            )}) : (
              <div className="p-6 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-slate-200" />
                Nothing waiting for Rose.
              </div>
            )}
            
            {needsRoseQueue.length > 0 && (
               <Link href="/escalations">
                <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/5 mt-1 rounded-xl">
                  View Full Queue
                </Button>
               </Link>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}