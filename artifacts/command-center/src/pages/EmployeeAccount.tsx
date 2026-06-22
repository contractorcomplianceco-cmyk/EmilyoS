import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TonePill } from "@/components/shared/Badges";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { useToast } from "@/hooks/use-toast";
import { useDatabase, saveRecord, deleteRecord, StorageError } from "@/lib/store";
import {
  compensationFields,
  reviewTargetFields,
  employeeProfileFields,
  documentFields,
} from "@/lib/fields";
import { fmtDate, daysUntil, isOverdue, isDueToday } from "@/lib/format";
import type { BadgeTone } from "@/lib/format";
import type {
  Compensation,
  ReviewTarget,
  EmployeeProfile,
  EmployeeDocument,
} from "@/lib/types";
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
  Coins,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const GATED = [
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

const emptyReviewTarget: Partial<ReviewTarget> = {
  label: "",
  value: "",
  detail: "",
};

const emptyDocument: Partial<EmployeeDocument> = {
  name: "",
  type: "",
  date: "",
};

export default function EmployeeAccount() {
  const { toast } = useToast();
  const db = useDatabase();

  const compensation = db.compensation[0];
  const profile = db.employeeProfile[0];

  const [compOpen, setCompOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Partial<ReviewTarget>>(emptyReviewTarget);
  const [targetToDelete, setTargetToDelete] = useState<ReviewTarget | null>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Partial<EmployeeDocument>>(emptyDocument);
  const [docToDelete, setDocToDelete] = useState<EmployeeDocument | null>(null);

  const openAddTarget = () => {
    setEditingTarget(emptyReviewTarget);
    setTargetOpen(true);
  };
  const openEditTarget = (t: ReviewTarget) => {
    setEditingTarget(t);
    setTargetOpen(true);
  };

  const sortedTargets = [...db.reviewTargets].sort((a, b) => {
    if (!a.targetDate && !b.targetDate) return 0;
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return a.targetDate < b.targetDate ? -1 : a.targetDate > b.targetDate ? 1 : 0;
  });

  const targetCountdown = (
    date?: string,
  ): { tone: BadgeTone; label: string } | null => {
    if (!date) return null;
    if (isDueToday(date)) return { tone: "amber", label: "Due today" };
    if (isOverdue(date)) {
      const n = daysUntil(date);
      const over = n === null ? 0 : Math.abs(n);
      return { tone: "red", label: `Overdue by ${over} day${over === 1 ? "" : "s"}` };
    }
    const n = daysUntil(date);
    if (n === null) return null;
    return {
      tone: n <= 14 ? "amber" : "green",
      label: `${n} day${n === 1 ? "" : "s"} until review`,
    };
  };

  const openAddDoc = () => {
    setEditingDoc(emptyDocument);
    setDocOpen(true);
  };
  const openEditDoc = (doc: EmployeeDocument) => {
    setEditingDoc(doc);
    setDocOpen(true);
  };

  const downloadDoc = (doc: EmployeeDocument) => {
    if (!doc.fileData) {
      toast({
        title: "No file attached",
        description: `Add a file to “${doc.name}” to download it. Use Edit to attach one.`,
      });
      return;
    }
    const link = document.createElement("a");
    link.href = doc.fileData;
    link.download = doc.fileName || doc.name || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download started", description: `${doc.fileName || doc.name} is downloading.` });
  };

  const details = [
    { label: "Full Name", value: profile?.name, icon: UserCircle },
    { label: "Employee ID", value: profile?.employeeId, icon: IdCard },
    { label: "Title", value: profile?.title, icon: Briefcase },
    { label: "Department", value: profile?.department, icon: Building2 },
    { label: "Work Email", value: profile?.email, icon: Mail },
    { label: "Work Phone", value: profile?.phone, icon: Phone },
    { label: "Location", value: profile?.location, icon: MapPin },
    { label: "Reports To", value: profile?.manager, icon: UserCircle },
    { label: "Start Date", value: fmtDate(profile?.startDate), icon: CalendarDays },
    { label: "Employment Type", value: profile?.employmentType, icon: Briefcase },
    { label: "Emergency Contact", value: profile?.emergencyContact, icon: PhoneCall },
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
            <p className="mt-1 text-sm text-white/80">{profile?.title}</p>
            <p className="mt-0.5 text-xs text-white/55">
              {profile?.employeeId} · {profile?.department}
            </p>
          </div>
        </div>
      </div>

      {/* Informational banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          This is your working copy of your employment record. Edits you make here are saved to your
          profile and shared with HR for their records — payroll and tax records remain managed by
          Payroll.
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
            <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
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

      {/* Compensation summary */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            Compensation Summary
          </h3>
          <div className="flex items-center gap-2">
            <TonePill label="Hourly · Non-Exempt" tone="blue" />
            <Button variant="outline" size="sm" onClick={() => setCompOpen(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-5 text-white shadow-lg">
              <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="relative mb-3 flex items-start justify-between">
                <div className="text-3xl font-extrabold leading-none tracking-tight">
                  {compensation?.baseRate ?? "—"}
                </div>
                <div className="rounded-xl bg-white/20 p-2.5 ring-1 ring-white/30 backdrop-blur-sm">
                  <Coins className="h-5 w-5" />
                </div>
              </div>
              <span className="relative block text-xs font-semibold uppercase tracking-wider text-white/85">
                Base Hourly Rate
              </span>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white shadow-lg">
              <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="relative mb-3 flex items-start justify-between">
                <div className="text-3xl font-extrabold leading-none tracking-tight">
                  {compensation?.schedule ?? "—"}
                </div>
                <div className="rounded-xl bg-white/20 p-2.5 ring-1 ring-white/30 backdrop-blur-sm">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>
              <span className="relative block text-xs font-semibold uppercase tracking-wider text-white/85">
                Weekly Schedule
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">Review Targets</h4>
            <Button variant="outline" size="sm" onClick={openAddTarget}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Target
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sortedTargets.map((r) => {
              const countdown = targetCountdown(r.targetDate);
              return (
              <div
                key={r.id}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{r.label}</p>
                    <span className="text-sm font-bold text-indigo-600">{r.value}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {r.targetDate ? fmtDate(r.targetDate) : "No date set"}
                    </span>
                    {countdown && <TonePill label={countdown.label} tone={countdown.tone} />}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">{r.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditTarget(r)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTargetToDelete(r)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Review targets are performance-based and subject to a separate written agreement.
            Payroll, withholdings, and tax records remain managed by Payroll.
          </p>
        </div>
      </Card>

      {/* Documents */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
            My Documents
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">
              {db.documents.length} {db.documents.length === 1 ? "file" : "files"}
            </span>
            <Button variant="outline" size="sm" onClick={openAddDoc}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Document
            </Button>
          </div>
        </div>
        {db.documents.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">
            No documents yet. Use “Add Document” to track an employment document.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {db.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-400">
                      {doc.type} · Updated {fmtDate(doc.date)}
                      {doc.fileData ? ` · ${doc.fileName || "File attached"}` : " · No file attached"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDoc(doc)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDoc(doc)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDocToDelete(doc)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <RecordFormDialog
        open={compOpen}
        onOpenChange={setCompOpen}
        title="Edit Compensation"
        description="Keep your base rate and schedule current as proposal terms change."
        fields={compensationFields}
        initial={compensation ?? {}}
        onSubmit={(values) =>
          saveRecord("compensation", {
            ...compensation,
            ...values,
            id: compensation?.id ?? "comp_main",
          } as Compensation)
        }
      />

      <RecordFormDialog
        open={targetOpen}
        onOpenChange={setTargetOpen}
        title={editingTarget.id ? "Edit Review Target" : "Add Review Target"}
        description="Performance-based milestones tracked toward your next rate review."
        fields={reviewTargetFields}
        initial={editingTarget}
        onSubmit={(values) =>
          saveRecord("reviewTargets", { ...editingTarget, ...values } as ReviewTarget)
        }
      />

      <ConfirmDelete
        open={!!targetToDelete}
        onOpenChange={(o) => !o && setTargetToDelete(null)}
        itemLabel={targetToDelete?.label}
        onConfirm={() => {
          if (targetToDelete) deleteRecord("reviewTargets", targetToDelete.id);
          setTargetToDelete(null);
        }}
      />

      <RecordFormDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title="Edit Personal & Employment Details"
        description="Keep your profile current. Changes are saved here and shared with HR for their records."
        fields={employeeProfileFields}
        initial={profile ?? {}}
        onSubmit={(values) =>
          saveRecord("employeeProfile", {
            ...profile,
            ...values,
            id: profile?.id ?? "emp_main",
          } as EmployeeProfile)
        }
      />

      <RecordFormDialog
        open={docOpen}
        onOpenChange={setDocOpen}
        title={editingDoc.id ? "Edit Document" : "Add Document"}
        description="Track an employment document with its label and last-updated date."
        fields={documentFields}
        initial={editingDoc}
        onSubmit={(values) => {
          try {
            saveRecord("documents", { ...editingDoc, ...values } as EmployeeDocument);
            return true;
          } catch (err) {
            toast({
              title: "Couldn't save document",
              description:
                err instanceof StorageError
                  ? err.message
                  : "Something went wrong saving this document. Please try again.",
              variant: "destructive",
            });
            return false;
          }
        }}
      />

      <ConfirmDelete
        open={!!docToDelete}
        onOpenChange={(o) => !o && setDocToDelete(null)}
        itemLabel={docToDelete?.name}
        onConfirm={() => {
          if (docToDelete) deleteRecord("documents", docToDelete.id);
          setDocToDelete(null);
        }}
      />
    </div>
  );
}
