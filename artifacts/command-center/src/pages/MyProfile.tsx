import React from "react";
import { Card } from "@/components/ui/card";
import { useDatabase } from "@/lib/store";
import { OPEN_MATTER_STATUSES } from "@/lib/types";
import {
  UserCircle,
  FolderKanban,
  MessageSquare,
  Award,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react";

const PROFILE = {
  name: "Emily Jones",
  title: "Director of Compliance & Regulatory Communications",
  department: "Compliance & Regulatory Affairs",
  employeeId: "CCA-0001",
  manager: "Rose Carter — VP of Operations",
  office: "Chicago, IL",
  email: "emily.jones@cca.com",
  phone: "(555) 010-1001",
  startDate: "Mar 3, 2021",
  performanceRating: "Exceeds Expectations",
};

const SKILLS = [
  "Regulatory Communication",
  "Agency Relationship Management",
  "Deficiency Resolution",
  "Process Documentation",
  "Escalation Routing",
  "Compliance Tracking",
];

const CERTIFICATIONS = [
  { name: "Certified Compliance & Ethics Professional (CCEP)", issued: "2022" },
  { name: "Regulatory Affairs Certification (RAC)", issued: "2023" },
  { name: "Project Management Professional (PMP)", issued: "2020" },
];

export default function MyProfile() {
  const db = useDatabase();

  const mattersOwned = db.matters.filter((m) => m.internalOwner === PROFILE.name);
  const activeOwned = mattersOwned.filter((m) =>
    OPEN_MATTER_STATUSES.includes(m.currentStatus),
  ).length;
  const commsLogged = db.communications.filter((c) => c.loggedBy === PROFILE.name).length;
  const tenureYears = Math.max(
    1,
    new Date().getFullYear() - new Date(PROFILE.startDate).getFullYear(),
  );

  const kpis = [
    {
      label: "Years of Tenure",
      value: tenureYears,
      icon: CalendarDays,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Active Matters Owned",
      value: activeOwned,
      icon: FolderKanban,
      gradient: "from-sky-500 to-blue-600",
      shadow: "hover:shadow-blue-500/30",
    },
    {
      label: "Communications Logged",
      value: commsLogged,
      icon: MessageSquare,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Certifications",
      value: CERTIFICATIONS.length,
      icon: Award,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "hover:shadow-emerald-500/30",
    },
  ];

  const details = [
    { label: "Employee ID", value: PROFILE.employeeId, icon: ShieldCheck },
    { label: "Department", value: PROFILE.department, icon: Building2 },
    { label: "Reports To", value: PROFILE.manager, icon: UserCircle },
    { label: "Office", value: PROFILE.office, icon: MapPin },
    { label: "Email", value: PROFILE.email, icon: Mail },
    { label: "Phone", value: PROFILE.phone, icon: Phone },
    { label: "Start Date", value: PROFILE.startDate, icon: CalendarDays },
    { label: "Performance Rating", value: PROFILE.performanceRating, icon: Star },
  ];

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold ring-2 ring-white/30 shadow-lg">
            EJ
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{PROFILE.name}</h2>
            <p className="mt-1 text-sm text-white/80">{PROFILE.title}</p>
            <p className="mt-0.5 text-xs text-white/55">
              {PROFILE.department} · {PROFILE.office}
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
        {/* Employment details */}
        <Card className="lg:col-span-2 overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              Employment Details
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100">
            {details.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.label} className="bg-white p-4 flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {d.label}
                    </p>
                    <p className="text-sm font-medium text-slate-800 break-words">{d.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Skills & certifications */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-blue-600" />
                Core Skills
              </h3>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-100"
                >
                  {s}
                </span>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
                Certifications
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {CERTIFICATIONS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3"
                >
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{c.name}</p>
                    <p className="text-xs text-slate-500">Issued {c.issued}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
