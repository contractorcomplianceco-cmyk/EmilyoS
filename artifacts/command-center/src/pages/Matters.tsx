import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FolderKanban, ExternalLink, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toolbar } from "@/components/shared/Toolbar";
import { RiskBadge, MatterStatusBadge } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { matterFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { agencyName, agencyOptions } from "@/lib/lookups";
import { fmtDate, daysUntil, isOverdue, isDueToday } from "@/lib/format";
import { MATTER_STATUSES, RISK_LEVELS, OPEN_MATTER_STATUSES } from "@/lib/types";
import type { Matter } from "@/lib/types";

const emptyMatter: Partial<Matter> = {
  title: "",
  clientOrCompanyName: "",
  agencyId: "",
  matterType: "License Application",
  currentStatus: "Not Started",
  priorityRiskLevel: "Medium",
};

function deadlineCell(value?: string | null) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const n = daysUntil(value);
  const over = isOverdue(value);
  const today = isDueToday(value);
  return (
    <div>
      <div className="text-sm">{fmtDate(value)}</div>
      <div
        className={
          over
            ? "text-xs font-medium text-red-600"
            : today
              ? "text-xs font-medium text-amber-600"
              : "text-xs text-muted-foreground"
        }
      >
        {over ? `${Math.abs(n ?? 0)}d overdue` : today ? "Due today" : `in ${n}d`}
      </div>
    </div>
  );
}

export default function Matters() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [riskFilter, setRiskFilter] = useState("__all__");
  const [agencyFilter, setAgencyFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Matter>>(emptyMatter);
  const [detail, setDetail] = useState<Matter | null>(null);
  const [toDelete, setToDelete] = useState<Matter | null>(null);

  const agOpts = useMemo(() => agencyOptions(db), [db]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.matters
      .filter((m) =>
        statusFilter === "__all__"
          ? true
          : statusFilter === "__open__"
            ? OPEN_MATTER_STATUSES.includes(m.currentStatus)
            : m.currentStatus === statusFilter,
      )
      .filter((m) => (riskFilter === "__all__" ? true : m.priorityRiskLevel === riskFilter))
      .filter((m) => (agencyFilter === "__all__" ? true : m.agencyId === agencyFilter))
      .filter((m) =>
        q === ""
          ? true
          : [m.title, m.clientOrCompanyName, m.internalOwner, m.matterType]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => {
        const ad = a.nextFollowUpDate || "9999";
        const bd = b.nextFollowUpDate || "9999";
        return ad.localeCompare(bd);
      });
  }, [db.matters, search, statusFilter, riskFilter, agencyFilter]);

  const stats = useMemo(() => {
    const total = db.matters.length;
    const open = db.matters.filter(m => OPEN_MATTER_STATUSES.includes(m.currentStatus)).length;
    const overdue = db.matters.filter(m => isOverdue(m.deadlineRenewalDate) && OPEN_MATTER_STATUSES.includes(m.currentStatus)).length;
    const atRisk = db.matters.filter(m => m.priorityRiskLevel === "High" || m.priorityRiskLevel === "Critical").length;
    return { total, open, overdue, atRisk };
  }, [db.matters]);

  const statusDistribution = useMemo(() => {
    const counts = db.matters.reduce((acc, m) => {
      acc[m.currentStatus] = (acc[m.currentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [db.matters]);

  const openAdd = () => {
    setEditing(emptyMatter);
    setFormOpen(true);
  };
  const openEdit = (m: Matter) => {
    setEditing(m);
    setFormOpen(true);
    setDetail(null);
  };

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <FolderKanban className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Regulatory Matters Tracker</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Every active and historical regulatory matter, with status, ownership, and deadlines.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-white text-indigo-900 shadow-lg hover:bg-white/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Matter
          </Button>
        </div>
      </div>

      {/* KPI stat strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Matters",
            value: stats.total,
            icon: FolderKanban,
            gradient: "from-indigo-600 to-violet-600",
            shadow: "hover:shadow-indigo-500/30",
          },
          {
            label: "Open & Active",
            value: stats.open,
            icon: CheckCircle,
            gradient: "from-emerald-500 to-teal-600",
            shadow: "hover:shadow-emerald-500/30",
          },
          {
            label: "Overdue Deadlines",
            value: stats.overdue,
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
            shadow: "hover:shadow-amber-500/30",
          },
          {
            label: "High/Critical Risk",
            value: stats.atRisk,
            icon: AlertTriangle,
            gradient: "from-red-500 to-rose-600",
            shadow: "hover:shadow-red-500/30",
          },
        ].map((kpi) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Toolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search matters, clients, owners..."
            filters={[
              {
                key: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "__open__", label: "Open only" },
                  ...MATTER_STATUSES.map((s) => ({ value: s, label: s })),
                ],
              },
              {
                key: "risk",
                label: "Risk",
                value: riskFilter,
                onChange: setRiskFilter,
                options: RISK_LEVELS.map((r) => ({ value: r, label: r })),
              },
              {
                key: "agency",
                label: "Agency",
                value: agencyFilter,
                onChange: setAgencyFilter,
                options: agOpts,
              },
            ]}
          />

          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
                All Matters
              </h3>
              <span className="text-sm text-muted-foreground">
                {filtered.length} of {db.matters.length}
              </span>
            </div>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={FolderKanban}
                    title="No matters found"
                    description="Adjust filters or add a new regulatory matter."
                    action={
                      <Button variant="outline" onClick={openAdd}>
                        <Plus className="mr-1.5 h-4 w-4" /> Add Matter
                      </Button>
                    }
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matter</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Follow-Up</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((m) => (
                      <TableRow
                        key={m.id}
                        className="cursor-pointer"
                        onClick={() => setDetail(m)}
                      >
                        <TableCell>
                          <div className="font-medium text-slate-800">{m.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.clientOrCompanyName} · {m.matterType}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {agencyName(db, m.agencyId)}
                        </TableCell>
                        <TableCell>
                          <MatterStatusBadge value={m.currentStatus} />
                        </TableCell>
                        <TableCell>
                          <RiskBadge value={m.priorityRiskLevel} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.internalOwner || "—"}
                        </TableCell>
                        <TableCell>{deadlineCell(m.nextFollowUpDate)}</TableCell>
                        <TableCell>{deadlineCell(m.deadlineRenewalDate)}</TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setToDelete(m)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-blue-600" />
                Status Distribution
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {statusDistribution.map(([status, count]) => (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{status}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-500 to-blue-500" 
                      style={{ width: `${Math.max(5, (count / stats.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing.id ? "Edit Matter" : "Add Matter"}
        description="Track this regulatory matter from intake through completion."
        fields={matterFields(agOpts)}
        initial={editing}
        onSubmit={(values) => saveRecord("matters", { ...editing, ...values } as Matter)}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.title}
        onConfirm={() => {
          if (toDelete) deleteRecord("matters", toDelete.id);
          setToDelete(null);
        }}
      />

      <DetailSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.title ?? ""}
        subtitle={
          detail ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <MatterStatusBadge value={detail.currentStatus} />
              <RiskBadge value={detail.priorityRiskLevel} />
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Client / Company", value: detail.clientOrCompanyName },
                { label: "Agency", value: agencyName(db, detail.agencyId) },
                { label: "Matter Type", value: detail.matterType },
                { label: "State / Jurisdiction", value: detail.stateJurisdiction },
                { label: "Internal Owner", value: detail.internalOwner },
                { label: "Emily Owner Status", value: detail.emilyOwnerStatus },
                { label: "Waiting On", value: detail.waitingOn },
                { label: "Date Opened", value: fmtDate(detail.dateOpened) },
                { label: "Last Contact", value: fmtDate(detail.lastContactDate) },
                { label: "Next Follow-Up", value: fmtDate(detail.nextFollowUpDate) },
                { label: "Deadline / Renewal", value: fmtDate(detail.deadlineRenewalDate) },
                { label: "Submission Date", value: fmtDate(detail.submissionDate) },
                { label: "Next Action", value: detail.nextAction, full: true },
                { label: "Notes", value: detail.notes, full: true },
                {
                  label: "Documents / Reference Links",
                  full: true,
                  value: detail.referenceLinks ? (
                    /^https?:\/\//.test(detail.referenceLinks.trim()) ? (
                      <a
                        href={detail.referenceLinks.trim()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Open link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      detail.referenceLinks
                    )
                  ) : null,
                },
              ]
            : []
        }
        footer={
          detail ? (
            <>
              <Button variant="outline" onClick={() => setDetail(null)}>
                Close
              </Button>
              <Button onClick={() => openEdit(detail)}>
                <Pencil className="mr-1.5 h-4 w-4" /> Edit
              </Button>
            </>
          ) : null
        }
      />
    </div>
  );
}
