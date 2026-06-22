import { useMemo, useState } from "react";
import {
  Inbox,
  Plus,
  Pencil,
  Clock,
  CheckCircle2,
  Hourglass,
  Send,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toolbar } from "@/components/shared/Toolbar";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { requestFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { REQUEST_STATUSES } from "@/lib/types";
import type { RequestItem } from "@/lib/types";

const emptyRequest: Partial<RequestItem> = {
  title: "",
  requestType: "Time Off / PTO",
  status: "Draft",
  priority: "Medium",
  approver: "",
};

function priorityClass(priority: string) {
  switch (priority) {
    case "High":
      return "bg-red-50 text-red-700 border-red-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function statusClass(status: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Denied":
      return "bg-red-50 text-red-700 border-red-200";
    case "In Review":
      return "bg-accent/10 text-pink-600 border-accent/20";
    case "Submitted":
      return "bg-primary/10 text-primary border-primary/20";
    case "Cancelled":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function MyRequests() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [typeFilter, setTypeFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<RequestItem>>(emptyRequest);
  const [detail, setDetail] = useState<RequestItem | null>(null);
  const [toDelete, setToDelete] = useState<RequestItem | null>(null);

  const typeOptions = useMemo(
    () => Array.from(new Set(db.requests.map((r) => r.requestType))),
    [db.requests],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.requests
      .filter((r) => (statusFilter === "__all__" ? true : r.status === statusFilter))
      .filter((r) => (typeFilter === "__all__" ? true : r.requestType === typeFilter))
      .filter((r) =>
        q === ""
          ? true
          : [r.title, r.requestType, r.status, r.approver, r.details]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [db.requests, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = db.requests.length;
    const pending = db.requests.filter((r) =>
      ["Submitted", "In Review"].includes(r.status),
    ).length;
    const approved = db.requests.filter((r) => r.status === "Approved").length;
    const drafts = db.requests.filter((r) => r.status === "Draft").length;
    return { total, pending, approved, drafts };
  }, [db.requests]);

  const openAdd = () => {
    setEditing(emptyRequest);
    setFormOpen(true);
  };
  const openEdit = (r: RequestItem) => {
    setEditing(r);
    setFormOpen(true);
    setDetail(null);
  };

  const kpis = [
    { label: "All Requests", value: stats.total, icon: Inbox, gradient: "from-primary to-sky-400" },
    { label: "Pending", value: stats.pending, icon: Hourglass, gradient: "from-accent to-pink-300" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600" },
    { label: "Drafts", value: stats.drafts, icon: Pencil, gradient: "from-primary to-accent" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-primary/5 to-accent/5 p-6 sm:p-8 border border-white shadow-sm text-slate-700">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm text-primary">
              <Inbox className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">My Requests</h2>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Submit and track personal requests — time off, expenses, equipment, training, and more. Routed to HR, your manager, or IT for approval.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-primary text-white shadow-sm hover:bg-primary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Request
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
              className="relative overflow-hidden rounded-2xl border border-slate-100 p-5 text-slate-700 shadow-sm bg-white transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-primary/5 blur-2xl" />
              <div className="relative mb-3 flex items-start justify-between">
                <div className="text-4xl font-extrabold leading-none tracking-tight text-slate-800">
                  {kpi.value}
                </div>
                <div className={`rounded-xl bg-gradient-to-br ${kpi.gradient} p-2.5 text-white shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <span className="relative block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {kpi.label}
              </span>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Toolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search requests..."
            filters={[
              {
                key: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: REQUEST_STATUSES.map((s) => ({ value: s, label: s })),
              },
              {
                key: "type",
                label: "Type",
                value: typeFilter,
                onChange: setTypeFilter,
                options: typeOptions.map((t) => ({ value: t, label: t })),
              },
            ]}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No requests found"
              description={
                search || statusFilter !== "__all__" || typeFilter !== "__all__"
                  ? "Try adjusting your search or filters."
                  : "Submit a request to get started — time off, expenses, equipment, and more."
              }
              action={
                <Button variant="outline" onClick={openAdd}>
                  <Plus className="mr-1.5 h-4 w-4" /> New Request
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((req) => (
                <Card
                  key={req.id}
                  className="group cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 bg-white/90 backdrop-blur-sm"
                  onClick={() => setDetail(req)}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <Badge variant="outline" className={priorityClass(req.priority)}>
                      {req.priority}
                    </Badge>
                    <Badge variant="outline" className={statusClass(req.status)}>
                      {req.status}
                    </Badge>
                  </div>
                  <h3 className="mb-1 line-clamp-2 font-semibold leading-tight text-slate-800 group-hover:text-primary">
                    {req.title}
                  </h3>
                  <p className="mb-4 line-clamp-1 text-sm text-slate-600">{req.requestType}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {req.dateNeeded ? `Needed ${fmtDate(req.dateNeeded)}` : "No date set"}
                    </span>
                    {req.approver ? (
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        {req.approver}
                      </span>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-accent to-pink-300" />
                Request Status
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="space-y-4">
                {REQUEST_STATUSES.map((status) => {
                  const count = db.requests.filter((r) => r.status === status).length;
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{status}</span>
                        <span className="text-sm font-bold text-slate-900">{count}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status === "Approved"
                              ? "bg-emerald-500"
                              : status === "Denied"
                                ? "bg-red-500"
                                : status === "In Review"
                                  ? "bg-pink-400"
                                  : status === "Submitted"
                                    ? "bg-primary"
                                    : "bg-slate-300"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-accent/20 bg-accent/5 shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <Send className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
              <p className="text-sm text-slate-600">
                Requests are routed to the listed approver. Set the status to{" "}
                <span className="font-semibold text-slate-800">Submitted</span> when you are ready
                to send it along.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing.id ? "Edit Request" : "New Request"}
        description="Submit a personal request and track its approval."
        fields={requestFields}
        initial={editing}
        onSubmit={(values) =>
          saveRecord("requests", { ...editing, ...values } as RequestItem)
        }
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.title}
        onConfirm={() => {
          if (toDelete) deleteRecord("requests", toDelete.id);
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
              <Badge variant="outline" className={priorityClass(detail.priority)}>
                {detail.priority}
              </Badge>
              <Badge variant="outline" className={statusClass(detail.status)}>
                {detail.status}
              </Badge>
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Type", value: detail.requestType },
                { label: "Approver / Routed To", value: detail.approver },
                { label: "Date Needed", value: detail.dateNeeded ? fmtDate(detail.dateNeeded) : "" },
                { label: "Submitted", value: detail.submittedDate ? fmtDate(detail.submittedDate) : "" },
                { label: "Details", value: detail.details },
                { label: "Created", value: fmtDate(detail.createdAt) },
              ]
            : []
        }
        footer={
          detail ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setToDelete(detail);
                  setDetail(null);
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
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
