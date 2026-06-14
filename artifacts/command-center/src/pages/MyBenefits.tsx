import React from "react";
import { Card } from "@/components/ui/card";
import {
  HeartHandshake,
  CalendarDays,
  PiggyBank,
  Stethoscope,
  GraduationCap,
  Dumbbell,
  Plane,
  ShieldCheck,
  Smile,
} from "lucide-react";

const PTO = { used: 9, total: 25 };

const BENEFITS = [
  {
    title: "Medical, Dental & Vision",
    plan: "PPO Premium — Family Coverage",
    detail: "Comprehensive health coverage with $0 in-network preventive care and low deductibles.",
    icon: Stethoscope,
    gradient: "from-indigo-500 to-violet-600",
    tag: "Active",
  },
  {
    title: "401(k) Retirement",
    plan: "6% Employer Match",
    detail: "Company matches 100% of the first 6% you contribute, fully vested after two years.",
    icon: PiggyBank,
    gradient: "from-sky-500 to-blue-600",
    tag: "Enrolled",
  },
  {
    title: "Professional Development",
    plan: "$3,000 Annual Stipend",
    detail: "Certifications, conferences, and courses to support your leadership growth.",
    icon: GraduationCap,
    gradient: "from-amber-500 to-orange-600",
    tag: "$1,200 used",
  },
  {
    title: "Wellness & Fitness",
    plan: "$75 / month",
    detail: "Reimbursement for gym memberships, fitness apps, and wellness programs.",
    icon: Dumbbell,
    gradient: "from-emerald-500 to-teal-600",
    tag: "Active",
  },
  {
    title: "Life & Disability Insurance",
    plan: "2x Salary Coverage",
    detail: "Employer-paid life insurance plus short- and long-term disability protection.",
    icon: ShieldCheck,
    gradient: "from-rose-500 to-red-600",
    tag: "Active",
  },
  {
    title: "Employee Assistance Program",
    plan: "24/7 Confidential Support",
    detail: "Free counseling, legal, and financial guidance for you and your household.",
    icon: Smile,
    gradient: "from-fuchsia-500 to-purple-600",
    tag: "Available",
  },
];

export default function MyBenefits() {
  const ptoRemaining = PTO.total - PTO.used;
  const ptoPct = Math.round((PTO.used / PTO.total) * 100);

  const kpis = [
    {
      label: "PTO Days Remaining",
      value: ptoRemaining,
      icon: CalendarDays,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "401(k) Match",
      value: "6%",
      icon: PiggyBank,
      gradient: "from-sky-500 to-blue-600",
      shadow: "hover:shadow-blue-500/30",
    },
    {
      label: "Dev Stipend",
      value: "$3,000",
      icon: GraduationCap,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Active Benefits",
      value: BENEFITS.length,
      icon: HeartHandshake,
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
            <HeartHandshake className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Benefits</h2>
            <p className="mt-1.5 max-w-xl text-sm text-white/70">
              Your complete benefits package — health, retirement, time off, and wellbeing perks.
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

      {/* PTO balance */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            Paid Time Off Balance
          </h3>
          <span className="text-sm font-semibold text-slate-500">
            {PTO.used} used · {ptoRemaining} remaining
          </span>
        </div>
        <div className="p-5">
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
              style={{ width: `${ptoPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Plane className="h-4 w-4 text-indigo-500" />
            You have used {ptoPct}% of your {PTO.total}-day annual allowance.
          </div>
        </div>
      </Card>

      {/* Benefit cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <Card
              key={b.title}
              className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${b.gradient}`} />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`inline-flex rounded-xl bg-gradient-to-br ${b.gradient} p-2.5 text-white shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {b.tag}
                  </span>
                </div>
                <p className="text-base font-bold text-slate-800">{b.title}</p>
                <p className="mt-0.5 text-sm font-semibold text-indigo-600">{b.plan}</p>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{b.detail}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
