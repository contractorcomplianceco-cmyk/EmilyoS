import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TonePill } from "@/components/shared/Badges";
import { useToast } from "@/hooks/use-toast";
import {
  IdCard,
  Mail,
  Phone,
  MapPin,
  Building2,
  UserCircle,
  CalendarDays,
  Briefcase,
  PhoneCall,
  FileText,
  Download,
  Lock,
  ShieldAlert,
} from "lucide-react";

const RECORD = {
  name: "Emily Jones",
  title: "Director of Compliance & Regulatory Communications",
  department: "Compliance & Regulatory Affairs",
  employeeId: "CCA-0001",
  email: "emily.jones@cca.com",
  phone: "(555) 010-1001",
  location: "Chicago, IL — HQ",
  manager: "Rose Carter — VP of Operations",
  startDate: "Mar 3, 2021",
  employmentType: "Full-time · Salaried (Exempt)",
  emergencyContact: "Michael Jones — Spouse · (555) 010-2002",
};

const DOCUMENTS = [
  { name: "Employment Agreement", type: "PDF · Signed", date: "Mar 3, 2021" },
  { name: "Role & Responsibilities", type: "PDF", date: "Jan 12, 2024" },
  { name: "Org Chart — Compliance", type: "PDF", date: "Apr 2, 2026" },
  { name: "Code of Conduct Acknowledgement", type: "PDF · Signed", date: "Jan 8, 2026" },
];

const GATED = [
  {
    label: "Compensation & Salary",
    detail: "Base pay, merit history, and pay grade",
    managedBy: "Managed by HR",
    icon: Lock,
  },
  {
    label: "Payroll & Direct Deposit",
    detail: "Bank details, withholdings, and pay stubs",
    managedBy: "Managed by Payroll",
    icon: Lock,
  },
  {
    label: "Tax Records",
    detail: "W-2, W-4, and year-end tax documents",
    managedBy: "Managed by Payroll",
    icon: Lock,
  },
];

export default function EmployeeAccount() {
  const { toast } = useToast();

  const details = [
    { label: "Full Name", value: RECORD.name, icon: UserCircle },
    { label: "Employee ID", value: RECORD.employeeId, icon: IdCard },
    { label: "Title", value: RECORD.title, icon: Briefcase },
    { label: "Department", value: RECORD.department, icon: Building2 },
    { label: "Work Email", value: RECORD.email, icon: Mail },
    { label: "Work Phone", value: RECORD.phone, icon: Phone },
    { label: "Location", value: RECORD.location, icon: MapPin },
    { label: "Reports To", value: RECORD.manager, icon: UserCircle },
    { label: "Start Date", value: RECORD.startDate, icon: CalendarDays },
    { label: "Employment Type", value: RECORD.employmentType, icon: Briefcase },
    { label: "Emergency Contact", value: RECORD.emergencyContact, icon: PhoneCall },
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Employee Profile</h2>
            <p className="mt-1 text-sm text-white/80">{RECORD.title}</p>
            <p className="mt-0.5 text-xs text-white/55">
              {RECORD.employeeId} · {RECORD.department}
            </p>
          </div>
        </div>
      </div>

      {/* Informational banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          This is your official employment record. It is informational only — any change requests are
          submitted to HR for review. You cannot self-edit your employment record.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employment details */}
        <Card className="lg:col-span-2 overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              Personal &amp; Employment Details
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast({
                  title: "Request submitted to HR",
                  description: "Your update request is informational only and pending HR review.",
                })
              }
            >
              Request Change
            </Button>
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

        {/* Gated records */}
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md self-start">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
              Restricted Records
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {GATED.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.label}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 rounded-lg bg-slate-200 p-1.5 text-slate-500">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{g.label}</p>
                        <p className="text-xs text-slate-400">{g.detail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <TonePill label={g.managedBy} tone="slate" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "Access request sent",
                          description: `${g.label} is ${g.managedBy.toLowerCase()}. Your request was routed for review.`,
                        })
                      }
                    >
                      Request Access
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Documents */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
            My Documents
          </h3>
          <span className="text-sm font-medium text-slate-500">{DOCUMENTS.length} files</span>
        </div>
        <div className="divide-y divide-slate-100">
          {DOCUMENTS.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                  <p className="text-xs text-slate-400">
                    {doc.type} · Updated {doc.date}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({ title: "Download started", description: `${doc.name} is downloading.` })
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
