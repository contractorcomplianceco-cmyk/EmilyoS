import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Siren, AlertTriangle, ShieldAlert, Clock, Scale } from "lucide-react";
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
import { EscalationStatusBadge, TonePill } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { escalationFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { matterTitle, matterOptions } from "@/lib/lookups";
import { fmtDate, daysUntil, isOverdue, isDueToday } from "@/lib/format";
import { ESCALATION_STATUSES, OPEN_ESCALATION_STATUSES } from "@/lib/types";
import type { Escalation } from "@/lib/types";

const emptyEscalation: Partial<Escalation> = {
  matterId: "",
  reasonForEscalation: "Leadership decision needed",
  status: "Open",
};

export default function Escalations() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Escalation>>(emptyEscalation);
  const [detail, setDetail] = useState<Escalation | null>(null);
  const [toDelete, setToDelete] = useState<Escalation | null>(null);

  const mtOpts = useMemo(() => matterOptions(db), [db]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.escalations
      .filter((e) =>
        statusFilter === "__all__"
          ? true
          : statusFilter === "__open__"
            ? OPEN_ESCALATION_STATUSES.includes(e.status)
            : e.status === statusFilter,
      )
      .filter((e) =>
        q === ""
          ? true
          : [e.reasonForEscalation, e.summary, e.assignedReviewer, e.recommendedNextStep]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  }, [db.escalations, search, statusFilter]);

  const stats = useMemo(() => {
    const total = db.escalations.length;
    const open = db.escalations.filter(e => OPEN_ESCALATION_STATUSES.includes(e.status)).length;
    const awaitingDecision = db.escalations.filter(e => e.status === "Awaiting Decision").length;
    const overdue = db.escalations.filter(e => OPEN_ESCALATION_STATUSES.includes(e.status) && isOverdue(e.dueDate)).length;
    return { total, open, awaitingDecision, overdue };
  }, [db.escalations]);

  const reasonsData = useMemo(() => {
    const counts: Record<string, number> = {};
    db.escalations.filter(e => OPEN_ESCALATION_STATUSES.includes(e.status)).forEach(e => {
      counts[e.reasonForEscalation] = (counts[e.reasonForEscalation] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [db.escalations]);

  const openAdd = () => {
    setEditing(emptyEscalation);
    setFormOpen(true);
  };
  const openEdit = (e: Escalation) => {
    setEditing(e);
    setFormOpen(true);
    setDetail(null);
  };

  const kpis = [
    { label: "Total Escalations", value: stats.total, icon: Scale, gradient: "from-indigo-600 to-violet-600", shadow: "hover:shadow-indigo-500/30" },
    { label: "Active & Open", value: stats.open, icon: Siren, gradient: "from-amber-500 to-orange-600", shadow: "hover:shadow-amber-500/30" },
    { label: "Awaiting Decision", value: stats.awaitingDecision, icon: ShieldAlert, gradient: "from-violet-500 to-purple-600", shadow: "hover:shadow-purple-500/30" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, gradient: "from-red-500 to-rose-600", shadow: "hover:shadow-red-500/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Siren className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Escalation Queue</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Matters routed for legal, compliance, tax, or leadership review. Routing only — decisions stay with the right authority.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-white text-indigo-900 shadow-lg hover:bg-white/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Escalation
          </Button>
        </div>
      </div>

      {/* KPIs */}
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
            searchPlaceholder="Search escalations..."
            filters={[
              {
                key: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "__open__", label: "Open only" },
                  ...ESCALATION_STATUSES.map((s) => ({ value: s, label: s })),
                ],
              },
            ]}
          />

          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-red-500 to-rose-600" />
                Escalation Register
              </h3>
              <span className="text-sm text-muted-foreground">
                {filtered.length} matching
              </span>
            </div>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Siren}
                    title="No escalations"
                    description="Route a matter for review when it needs legal, tax, compliance, or leadership input."
                    action={
                      <Button variant="outline" onClick={openAdd}>
                        <Plus className="mr-1.5 h-4 w-4" /> Add Escalation
                      </Button>
                    }
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reason & Summary</TableHead>
                      <TableHead>Matter</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => {
                      const n = daysUntil(e.dueDate);
                      const over = isOverdue(e.dueDate) && OPEN_ESCALATION_STATUSES.includes(e.status);
                      const today = isDueToday(e.dueDate) && OPEN_ESCALATION_STATUSES.includes(e.status);
                      return (
                        <TableRow
                          key={e.id}
                          className="cursor-pointer hover:bg-slate-50/50"
                          onClick={() => setDetail(e)}
                        >
                          <TableCell className="max-w-xs">
                            <div className="font-medium text-slate-800">{e.reasonForEscalation}</div>
                            <div className="line-clamp-1 text-xs text-muted-foreground mt-0.5">
                              {e.summary}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {matterTitle(db, e.matterId)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {e.assignedReviewer || "Unassigned"}
                          </TableCell>
                          <TableCell>
                            <EscalationStatusBadge value={e.status} />
                          </TableCell>
                          <TableCell>
                            {e.dueDate ? (
                              <div>
                                <div className="text-sm text-slate-700">{fmtDate(e.dueDate)}</div>
                                <div
                                  className={
                                    over
                                      ? "text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5"
                                      : today
                                        ? "text-xs font-medium text-amber-600 flex items-center gap-1 mt-0.5"
                                        : "text-xs text-muted-foreground mt-0.5"
                                  }
                                >
                                  {over || today ? <Clock className="h-3 w-3" /> : null}
                                  {over
                                    ? `${Math.abs(n ?? 0)}d overdue`
                                    : today
                                      ? "Due today"
                                      : `in ${n}d`}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setToDelete(e)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
                Open Escalations by Reason
              </h3>
            </div>
            <CardContent className="p-5">
              {reasonsData.length > 0 ? (
                <div className="space-y-4">
                  {reasonsData.map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{reason}</span>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">No open escalations.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing.id ? "Edit Escalation" : "Add Escalation"}
        description="Route this matter to the right reviewer with a clear recommended next step."
        fields={escalationFields(mtOpts)}
        initial={editing}
        onSubmit={(values) =>
          saveRecord("escalations", { ...editing, ...values } as Escalation)
        }
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.reasonForEscalation}
        onConfirm={() => {
          if (toDelete) deleteRecord("escalations", toDelete.id);
          setToDelete(null);
        }}
      />

      <DetailSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.reasonForEscalation ?? ""}
        subtitle={
          detail ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <EscalationStatusBadge value={detail.status} />
              <TonePill label={matterTitle(db, detail.matterId)} tone="slate" />
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Related Matter", value: matterTitle(db, detail.matterId) },
                { label: "Assigned Reviewer", value: detail.assignedReviewer },
                { label: "Date Escalated", value: fmtDate(detail.dateEscalated) },
                { label: "Due Date", value: fmtDate(detail.dueDate) },
                { label: "Summary", value: detail.summary, full: true },
                { label: "Recommended Next Step", value: detail.recommendedNextStep, full: true },
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
