import { useMemo, useState } from "react";
import { CheckSquare, Plus, Pencil, Clock, AlertCircle, ListTodo, Activity, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toolbar } from "@/components/shared/Toolbar";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { taskFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { fmtDate, isOverdue } from "@/lib/format";
import type { Task } from "@/lib/types";

const emptyTask: Partial<Task> = {
  title: "",
  priority: "Medium",
  status: "Open",
  assignedTo: "Emily Jones",
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
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress":
      return "bg-accent/10 text-pink-600 border-accent/20";
    case "Blocked":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function Tasks() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [priorityFilter, setPriorityFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Task>>(emptyTask);
  const [detail, setDetail] = useState<Task | null>(null);
  const [toDelete, setToDelete] = useState<Task | null>(null);

  const agencyOptions = useMemo(
    () => db.agencies.map((a) => ({ label: a.name, value: a.id })),
    [db.agencies],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.tasks
      .filter((t) => (statusFilter === "__all__" ? true : t.status === statusFilter))
      .filter((t) =>
        priorityFilter === "__all__" ? true : t.priority === priorityFilter,
      )
      .filter((t) =>
        q === ""
          ? true
          : [t.title, t.assignedTo, t.status].join(" ").toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [db.tasks, search, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = db.tasks.length;
    const active = db.tasks.filter(t => t.status === "Open" || t.status === "In Progress").length;
    const high = db.tasks.filter(t => t.priority === "High" && t.status !== "Completed").length;
    const overdue = db.tasks.filter(t => isOverdue(t.dueDate) && t.status !== "Completed").length;
    return { total, active, high, overdue };
  }, [db.tasks]);

  const openAdd = () => {
    setEditing(emptyTask);
    setFormOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setFormOpen(true);
    setDetail(null);
  };

  const agencyName = (id: string) =>
    db.agencies.find((a) => a.id === id)?.name ?? "";

  const kpis = [
    { label: "Total Tasks", value: stats.total, icon: ListTodo, gradient: "from-primary to-sky-400", shadow: "hover:shadow-primary/20" },
    { label: "Active", value: stats.active, icon: Activity, gradient: "from-accent to-pink-300", shadow: "hover:shadow-accent/20" },
    { label: "High Priority", value: stats.high, icon: AlertCircle, gradient: "from-primary to-accent", shadow: "hover:shadow-primary/20" },
    { label: "Overdue", value: stats.overdue, icon: Clock, gradient: "from-red-500 to-rose-600", shadow: "hover:shadow-red-500/30" },
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
              <CheckSquare className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Tasks & Approvals</h2>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Internal priorities, workflows, and required approvals.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-primary text-white shadow-sm hover:bg-primary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Task
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
              className={`relative overflow-hidden rounded-2xl border border-slate-100 p-5 text-slate-700 shadow-sm bg-white transition-all hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-primary/5 blur-2xl" />
              <div className="relative mb-3 flex items-start justify-between">
                <div className="text-4xl font-extrabold leading-none tracking-tight text-slate-800">
                  {kpi.value}
                </div>
                <div className="rounded-xl bg-white/20 p-2.5 ring-1 ring-slate-100 backdrop-blur-sm">
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
            searchPlaceholder="Search tasks..."
            filters={[
              {
                key: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: ["Open", "In Progress", "Completed", "Blocked"].map((s) => ({
                  value: s,
                  label: s,
                })),
              },
              {
                key: "priority",
                label: "Priority",
                value: priorityFilter,
                onChange: setPriorityFilter,
                options: ["Low", "Medium", "High"].map((s) => ({ value: s, label: s })),
              },
            ]}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks found"
              description={
                search || statusFilter !== "__all__" || priorityFilter !== "__all__"
                  ? "Try adjusting your search or filters."
                  : "Add a task to start tracking priorities and approvals."
              }
              action={
                <Button variant="outline" onClick={openAdd}>
                  <Plus className="mr-1.5 h-4 w-4" /> New Task
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((task) => {
                const agency = agencyName(task.relatedAgencyId);
                const overdue = isOverdue(task.dueDate) && task.status !== "Completed";
                return (
                  <Card
                    key={task.id}
                    className="group cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 bg-white/90 backdrop-blur-sm"
                    onClick={() => setDetail(task)}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <Badge variant="outline" className={priorityClass(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={statusClass(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    <h3 className="mb-1 line-clamp-2 font-semibold leading-tight text-slate-800 group-hover:text-primary">
                      {task.title}
                    </h3>
                    {agency ? (
                      <p className="mb-4 line-clamp-1 text-sm text-slate-600">
                        {agency}
                      </p>
                    ) : (
                      <div className="mb-4" />
                    )}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span className={overdue ? "text-destructive font-bold" : ""}>
                          {overdue ? "Overdue: " : "Due "}{fmtDate(task.dueDate)}
                        </span>
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        {task.assignedTo}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-accent to-pink-300" />
                Task Progress
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="space-y-4">
                {["Completed", "In Progress", "Open", "Blocked"].map((status) => {
                  const count = db.tasks.filter(t => t.status === status).length;
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
                            status === "Completed" ? "bg-emerald-500" :
                            status === "Blocked" ? "bg-red-500" :
                            status === "In Progress" ? "bg-pink-400" : "bg-slate-300"
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
        </div>
      </div>

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing.id ? "Edit Task" : "New Task"}
        description="Track an internal priority or required approval."
        fields={taskFields(agencyOptions)}
        initial={editing}
        onSubmit={(values) => saveRecord("tasks", { ...editing, ...values } as Task)}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.title}
        onConfirm={() => {
          if (toDelete) deleteRecord("tasks", toDelete.id);
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
                { label: "Assigned To", value: detail.assignedTo },
                { label: "Due Date", value: fmtDate(detail.dueDate) },
                { label: "Related Agency", value: agencyName(detail.relatedAgencyId) },
                { label: "Added", value: fmtDate(detail.createdAt) },
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
                Delete
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
