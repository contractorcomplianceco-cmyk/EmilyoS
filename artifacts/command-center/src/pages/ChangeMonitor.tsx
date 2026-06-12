import { useMemo, useState } from "react";
import {
  Activity,
  Plus,
  Pencil,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Toolbar } from "@/components/shared/Toolbar";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { alertFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import type { Alert } from "@/lib/types";

const emptyAlert: Partial<Alert> = {
  title: "",
  type: "Update",
  severity: "Info",
  detail: "",
};

function typeClass(type: string) {
  switch (type) {
    case "New":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "Update":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Overdue":
      return "bg-red-50 text-red-700 border-red-200";
    case "Deadline":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function severityIcon(severity: string) {
  switch (severity) {
    case "Critical":
      return <ShieldAlert className="h-5 w-5 text-destructive" />;
    case "Warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
}

export default function ChangeMonitor() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Alert>>(emptyAlert);
  const [detail, setDetail] = useState<Alert | null>(null);
  const [toDelete, setToDelete] = useState<Alert | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.alerts
      .filter((a) => (typeFilter === "__all__" ? true : a.type === typeFilter))
      .filter((a) =>
        q === ""
          ? true
          : [a.title, a.detail, a.type].join(" ").toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [db.alerts, search, typeFilter]);

  const openAdd = () => {
    setEditing(emptyAlert);
    setFormOpen(true);
  };
  const openEdit = (a: Alert) => {
    setEditing(a);
    setFormOpen(true);
    setDetail(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Monitor"
        description="Feed of regulatory updates, new requirements, and upcoming deadlines."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> New Alert
          </Button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search alerts & updates..."
        filters={[
          {
            key: "type",
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: ["New", "Update", "Overdue", "Deadline"].map((s) => ({
              value: s,
              label: s,
            })),
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No alerts found"
          description={
            search || typeFilter !== "__all__"
              ? "Try adjusting your search or filters."
              : "Add an alert to track regulatory changes and deadlines."
          }
          action={
            <Button variant="outline" onClick={openAdd}>
              <Plus className="mr-1.5 h-4 w-4" /> New Alert
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((alert) => (
            <Card
              key={alert.id}
              className="group flex cursor-pointer flex-col justify-between gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 sm:flex-row sm:items-center sm:p-5"
              onClick={() => setDetail(alert)}
            >
              <div className="flex items-start gap-4 sm:items-center">
                <div className="shrink-0 rounded-xl bg-muted p-2.5 transition-colors group-hover:bg-primary/5">
                  {severityIcon(alert.severity)}
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={typeClass(alert.type)}>
                      {alert.type}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {fmtDate(alert.date)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary">
                    {alert.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-muted-foreground">
                    {alert.detail}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing.id ? "Edit Alert" : "New Alert"}
        description="Log a regulatory change, update, or upcoming deadline."
        fields={alertFields}
        initial={editing}
        onSubmit={(values) => saveRecord("alerts", { ...editing, ...values } as Alert)}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.title}
        onConfirm={() => {
          if (toDelete) deleteRecord("alerts", toDelete.id);
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
              <Badge variant="outline" className={typeClass(detail.type)}>
                {detail.type}
              </Badge>
              <span className="text-sm text-muted-foreground">{detail.severity}</span>
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Type", value: detail.type },
                { label: "Severity", value: detail.severity },
                { label: "Date", value: fmtDate(detail.date) },
                { label: "Details", value: detail.detail, full: true },
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
