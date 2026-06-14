import React from "react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  Circle,
  Compass,
  GraduationCap,
  Users,
  Milestone,
} from "lucide-react";

const COMPETENCIES = [
  { name: "Strategic Communication", progress: 90, gradient: "from-indigo-500 to-violet-600" },
  { name: "Team Leadership & Mentoring", progress: 72, gradient: "from-sky-500 to-blue-600" },
  { name: "Cross-Functional Influence", progress: 65, gradient: "from-amber-500 to-orange-600" },
  { name: "Regulatory Strategy", progress: 84, gradient: "from-emerald-500 to-teal-600" },
  { name: "Executive Presence", progress: 58, gradient: "from-rose-500 to-red-600" },
];

const MILESTONES = [
  { name: "Completed Director Onboarding", done: true, when: "2021" },
  { name: "Led Department Process Overhaul", done: true, when: "2023" },
  { name: "Mentored 3 Junior Specialists", done: true, when: "2024" },
  { name: "Cross-Department Leadership Program", done: false, when: "In progress" },
  { name: "Senior Director Readiness Review", done: false, when: "Target Q4 2026" },
];

const DEVELOPMENT = [
  {
    title: "Executive Leadership Program",
    detail: "Quarterly cohort focused on strategic decision-making and organizational influence.",
    icon: GraduationCap,
  },
  {
    title: "Mentorship Circle",
    detail: "Pairing with VP of Operations for monthly leadership coaching sessions.",
    icon: Users,
  },
  {
    title: "Stretch Assignment",
    detail: "Owning the cross-agency escalation framework rollout for the next two quarters.",
    icon: Compass,
  },
];

export default function LeadershipTrack() {
  const overall = Math.round(
    COMPETENCIES.reduce((sum, c) => sum + c.progress, 0) / COMPETENCIES.length,
  );
  const milestonesDone = MILESTONES.filter((m) => m.done).length;

  const kpis = [
    {
      label: "Track Progress",
      value: `${overall}%`,
      icon: TrendingUp,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Competencies",
      value: COMPETENCIES.length,
      icon: Target,
      gradient: "from-sky-500 to-blue-600",
      shadow: "hover:shadow-blue-500/30",
    },
    {
      label: "Milestones Reached",
      value: `${milestonesDone}/${MILESTONES.length}`,
      icon: Milestone,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Target Role",
      value: "Sr. Director",
      icon: Compass,
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
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Leadership Track</h2>
            <p className="mt-1.5 max-w-xl text-sm text-white/70">
              Your career development path, competency growth, and milestones toward the next leadership role.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency growth */}
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              Competency Growth
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {COMPETENCIES.map((c) => (
              <div key={c.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  <span className="text-sm font-bold text-slate-800">{c.progress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${c.gradient}`}
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Milestones */}
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
              Career Milestones
            </h3>
          </div>
          <div className="p-5 space-y-2.5">
            {MILESTONES.map((m) => (
              <div
                key={m.name}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  m.done
                    ? "border-emerald-100 bg-emerald-50/40"
                    : "border-slate-200 bg-slate-50/60"
                }`}
              >
                {m.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    m.done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {m.when}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Development plan */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
            Active Development Plan
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEVELOPMENT.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 hover:border-indigo-200 transition-colors"
              >
                <div className="mb-3 inline-flex rounded-lg bg-indigo-100 p-2 text-indigo-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-slate-800">{d.title}</p>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{d.detail}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
