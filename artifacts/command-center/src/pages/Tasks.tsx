import { useMemo, useState } from "react";
import { CheckSquare, Plus, Pencil, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
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
      return "bg-blue-50 text-blue-700 border-blue-200";
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
      );
  }, [db.tasks, search, statusFilter, priorityFilter]);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Approvals"
        description="Internal priorities, workflows, and required approvals."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> New Task
          </Button>
        }
      />

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((task) => {
            const agency = agencyName(task.relatedAgencyId);
            const overdue = isOverdue(task.dueDate) && task.status !== "Completed";
            return (
              <Card
                key={task.id}
                className="group cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
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
                <h3 className="mb-1 line-clamp-2 font-semibold leading-tight text-foreground group-hover:text-primary">
                  {task.title}
                </h3>
                {agency ? (
                  <p className="mb-4 line-clamp-1 text-sm text-muted-foreground">
                    {agency}
                  </p>
                ) : (
                  <div className="mb-4" />
                )}
                <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span className={overdue ? "text-destructive" : ""}>
                      Due {fmtDate(task.dueDate)}
                    </span>
                  </span>
                  <span className="rounded bg-muted px-2 py-1 font-medium">
                    {task.assignedTo}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
