import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TonePill } from "@/components/shared/Badges";
import { useToast } from "@/hooks/use-toast";
import {
  HeartHandshake,
  CalendarDays,
  Stethoscope,
  Eye,
  Smile,
  Shield,
  PiggyBank,
  GraduationCap,
  Dumbbell,
  Lock,
  Info,
} from "lucide-react";

const TIME_OFF = [
  { label: "Vacation (PTO)", used: 9, total: 25, gradient: "from-indigo-500 to-violet-600" },
  { label: "Sick Leave", used: 3, total: 10, gradient: "from-sky-500 to-blue-600" },
  { label: "Personal Days", used: 1, total: 5, gradient: "from-amber-500 to-orange-600" },
];

const PLANS = [
  {
    name: "Medical",
    plan: "PPO Premium — Family",
    detail: "$0 in-network preventive care",
    status: "Enrolled",
    tone: "green" as const,
    icon: Stethoscope,
  },
  {
    name: "Dental",
    plan: "Delta Dental PPO",
    detail: "2 cleanings/year covered",
    status: "Enrolled",
    tone: "green" as const,
    icon: Smile,
  },
  {
    name: "Vision",
    plan: "VSP Choice",
    detail: "Annual exam + frames allowance",
    status: "Enrolled",
    tone: "green" as const,
    icon: Eye,
  },
  {
    name: "Life Insurance",
    plan: "Basic Term — 2x Salary",
    detail: "Employer-paid coverage",
    status: "Action Needed",
    tone: "amber" as const,
    icon: Shield,
  },
];

const PERKS = [
  {
    title: "401(k) Match",
    value: "6% employer match",
    detail: "Fully vested after two years of service.",
    icon: PiggyBank,
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    title: "Learning Stipend",
    value: "$3,000 / year",
    detail: "Certifications, conferences, and courses.",
    icon: GraduationCap,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    title: "Wellness Credit",
    value: "$75 / month",
    detail: "Gym, fitness apps, and wellbeing programs.",
    icon: Dumbbell,
    gradient: "from-emerald-500 to-teal-600",
  },
];

export default function Benefits() {
  const { toast } = useToast();

  const enrollmentNote = () =>
    toast({
      title: "Managed by HR",
      description: "Plan changes are submitted to HR during open enrollment.",
    });

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
              View your time off, insurance plans, and perks. Plan changes are managed by HR and Payroll.
            </p>
          </div>
        </div>
      </div>

      {/* Time off balances */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            Time-Off Balances
          </h3>
          <CalendarDays className="h-4 w-4 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-100">
          {TIME_OFF.map((t) => {
            const remaining = t.total - t.used;
            const pct = Math.round((t.used / t.total) * 100);
            return (
              <div key={t.label} className="bg-white p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{t.label}</span>
                  <span className="text-sm font-bold text-slate-800">{remaining} left</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${t.gradient}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  {t.used} used of {t.total} days
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Insurance plans */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-blue-600" />
            Health &amp; Insurance Plans
          </h3>
          <span className="text-sm font-medium text-slate-500">{PLANS.length} plans</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100">
          {PLANS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.name} className="bg-white p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{p.name}</p>
                      <p className="text-sm text-slate-600">{p.plan}</p>
                    </div>
                  </div>
                  <TonePill label={p.status} tone={p.tone} />
                </div>
                <p className="text-xs text-slate-400">{p.detail}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" />
            Premiums and deductions are managed by Payroll.
          </span>
          <Button variant="outline" size="sm" onClick={enrollmentNote}>
            Request Plan Change
          </Button>
        </div>
      </Card>

      {/* Retirement & perks */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
            Retirement &amp; Perks
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div
                  className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${perk.gradient} p-2.5 text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-slate-800">{perk.title}</p>
                <p className="mt-0.5 text-sm font-semibold text-indigo-600">{perk.value}</p>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{perk.detail}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-start gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm text-slate-500">
            Your 401(k) account balance, contributions, and deductions are managed by Payroll. Plan
            elections can be changed during open enrollment by submitting a request to HR.
          </p>
        </div>
      </Card>
    </div>
  );
}
