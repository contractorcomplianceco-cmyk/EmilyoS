import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle, ShieldAlert, Clock, CheckCircle } from "lucide-react";
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
import { RiskBadge, DeficiencyStatusBadge } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { deficiencyFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { agencyName, matterTitle, agencyOptions, matterOptions } from "@/lib/lookups";
import { fmtDate, daysUntil, isOverdue, isDueToday } from "@/lib/format";
import { DEFICIENCY_STATUSES, RISK_LEVELS, OPEN_DEFICIENCY_STATUSES } from "@/lib/types";
import type { Deficiency } from "@/lib/types";

const emptyDeficiency: Partial<Deficiency> = {
  matterId: "",
  agencyId: "",
  requestOrDeficiencyType: "",
  status: "New",
  riskLevel: "Medium",
};

function dueCell(value?: string | null) {
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

export default function Deficiencies() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [riskFilter, setRiskFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Deficiency>>(emptyDeficiency);
  const [detail, setDetail] = useState<Deficiency | null>(null);
  const [toDelete, setToDelete] = useState<Deficiency | null>(null);

  const agOpts = useMemo(() => agencyOptions(db), [db]);
  const mtOpts = useMemo(() => matterOptions(db), [db]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.deficiencies
      .filter((d) =>
        statusFilter === "__all__"
          ? true
          : statusFilter === "__open__"
            ? OPEN_DEFICIENCY_STATUSES.includes(d.status)
            : d.status === statusFilter,
      )
      .filter((d) => (riskFilter === "__all__" ? true : d.riskLevel === riskFilter))
      .filter((d) =>
        q === ""
          ? true
          : [d.requestOrDeficiencyType, d.description, d.assignedInternalOwner, d.requiredResponse]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  }, [db.deficiencies, search, statusFilter, riskFilter]);

  const stats = useMemo(() => {
    const total = db.deficiencies.length;
    const open = db.deficiencies.filter(d => OPEN_DEFICIENCY_STATUSES.includes(d.status)).length;
    const overdue = db.deficiencies.filter(d => isOverdue(d.dueDate) && OPEN_DEFICIENCY_STATUSES.includes(d.status)).length;
    const highRisk = db.deficiencies.filter(d => d.riskLevel === "High" || d.riskLevel === "Critical").length;
    return { total, open, overdue, highRisk };
  }, [db.deficiencies]);

  const riskDistribution = useMemo(() => {
    const counts = db.deficiencies.filter(d => OPEN_DEFICIENCY_STATUSES.includes(d.status)).reduce((acc, d) => {
      acc[d.riskLevel] = (acc[d.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return RISK_LEVELS.map(level => ({ level, count: counts[level] || 0 }));
  }, [db.deficiencies]);

  const openAdd = () => {
    setEditing(emptyDeficiency);
    setFormOpen(true);
  };
  const openEdit = (d: Deficiency) => {
    setEditing(d);
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
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Deficiency & Agency Request Queue</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Track agency deficiencies and information requests through to resolution.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-white text-indigo-900 shadow-lg hover:bg-white/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Request
          </Button>
        </div>
      </div>

      {/* KPI stat strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Requests",
            value: stats.total,
            icon: ShieldAlert,
            gradient: "from-indigo-600 to-violet-600",
            shadow: "hover:shadow-indigo-500/30",
          },
          {
            label: "Open Requests",
            value: stats.open,
            icon: CheckCircle,
            gradient: "from-sky-500 to-blue-600",
            shadow: "hover:shadow-blue-500/30",
          },
          {
            label: "Overdue",
            value: stats.overdue,
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
            shadow: "hover:shadow-amber-500/30",
          },
          {
            label: "High Risk",
            value: stats.highRisk,
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <Toolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search requests, descriptions, owners..."
            filters={[
              {
                key: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "__open__", label: "Open only" },
                  ...DEFICIENCY_STATUSES.map((s) => ({ value: s, label: s })),
                ],
              },
              {
                key: "risk",
                label: "Risk",
                value: riskFilter,
                onChange: setRiskFilter,
                options: RISK_LEVELS.map((r) => ({ value: r, label: r })),
              },
            ]}
          />

          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
                Deficiencies & Requests
              </h3>
              <span className="text-sm text-muted-foreground">
                {filtered.length} found
              </span>
            </div>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={AlertTriangle}
                    title="No deficiencies or requests"
                    description="Log an agency deficiency or information request to track it here."
                    action={
                      <Button variant="outline" onClick={openAdd}>
                        <Plus className="mr-1.5 h-4 w-4" /> Add Request
                      </Button>
                    }
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type / Description</TableHead>
                      <TableHead>Matter</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((d) => (
                      <TableRow
                        key={d.id}
                        className="cursor-pointer"
                        onClick={() => setDetail(d)}
                      >
                        <TableCell className="max-w-xs">
                          <div className="font-medium text-slate-800">{d.requestOrDeficiencyType}</div>
                          <div className="line-clamp-1 text-xs text-muted-foreground">
                            {d.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {matterTitle(db, d.matterId)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {d.assignedInternalOwner || "—"}
                        </TableCell>
                        <TableCell>
                          <DeficiencyStatusBadge value={d.status} />
                        </TableCell>
                        <TableCell>
                          <RiskBadge value={d.riskLevel} />
                        </TableCell>
                        <TableCell>{dueCell(d.dueDate)}</TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setToDelete(d)}
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
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-red-500 to-rose-600" />
                Open Risk Distribution
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {riskDistribution.map(({level, count}) => (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{level}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${level === 'Critical' || level === 'High' ? 'from-red-500 to-rose-500' : level === 'Medium' ? 'from-amber-500 to-orange-500' : 'from-slate-400 to-slate-500'}`} 
                      style={{ width: `${Math.max(5, (count / (stats.open || 1)) * 100)}%` }}
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
        title={editing.id ? "Edit Request" : "Add Deficiency / Request"}
        description="Capture what the agency needs, who owns it, and when it's due."
        fields={deficiencyFields(agOpts, mtOpts)}
        initial={editing}
        onSubmit={(values) =>
          saveRecord("deficiencies", { ...editing, ...values } as Deficiency)
        }
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.requestOrDeficiencyType}
        onConfirm={() => {
          if (toDelete) deleteRecord("deficiencies", toDelete.id);
          setToDelete(null);
        }}
      />

      <DetailSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.requestOrDeficiencyType ?? ""}
        subtitle={
          detail ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <DeficiencyStatusBadge value={detail.status} />
              <RiskBadge value={detail.riskLevel} />
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Related Matter", value: matterTitle(db, detail.matterId) },
                { label: "Agency", value: agencyName(db, detail.agencyId) },
                { label: "Assigned Owner", value: detail.assignedInternalOwner },
                { label: "Date Received", value: fmtDate(detail.dateReceived) },
                { label: "Due Date", value: fmtDate(detail.dueDate) },
                { label: "Description", value: detail.description, full: true },
                { label: "Required Response", value: detail.requiredResponse, full: true },
                { label: "Documents Needed", value: detail.documentsNeeded, full: true },
                { label: "Resolution Notes", value: detail.resolutionNotes, full: true },
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
