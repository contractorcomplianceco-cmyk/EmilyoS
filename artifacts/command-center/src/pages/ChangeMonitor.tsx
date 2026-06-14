import { useMemo, useState } from "react";
import {
  Activity,
  Plus,
  Pencil,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Info,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toolbar } from "@/components/shared/Toolbar";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { alertFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { fmtDate, isOverdue } from "@/lib/format";
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

  const stats = useMemo(() => {
    return {
      total: db.alerts.length,
      critical: db.alerts.filter((a) => a.severity === "Critical").length,
      warning: db.alerts.filter((a) => a.severity === "Warning").length,
      overdue: db.alerts.filter((a) => a.type === "Overdue" || isOverdue(a.date)).length,
    };
  }, [db.alerts]);

  const severityBreakdown = useMemo(() => {
    const info = db.alerts.filter((a) => a.severity === "Info").length;
    const warn = db.alerts.filter((a) => a.severity === "Warning").length;
    const crit = db.alerts.filter((a) => a.severity === "Critical").length;
    const total = db.alerts.length || 1;
    return { info, warn, crit, total };
  }, [db.alerts]);

  const kpis = [
    {
      label: "Total Alerts",
      value: stats.total,
      icon: Activity,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Critical",
      value: stats.critical,
      icon: ShieldAlert,
      gradient: "from-red-500 to-rose-600",
      shadow: "hover:shadow-red-500/30",
    },
    {
      label: "Warnings",
      value: stats.warning,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Overdue Items",
      value: stats.overdue,
      icon: Clock,
      gradient: "from-sky-500 to-blue-600",
      shadow: "hover:shadow-blue-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Activity className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Change Monitor</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Feed of regulatory updates, new requirements, and upcoming deadlines.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-white text-indigo-900 shadow-lg hover:bg-white/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Alert
          </Button>
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

      {/* Severity Breakdown Bar */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            Alert Severity Breakdown
          </h3>
        </div>
        <CardContent className="p-5 sm:p-6">
          <div className="h-4 w-full flex rounded-full overflow-hidden mb-4">
            <div style={{ width: `${(severityBreakdown.crit / severityBreakdown.total) * 100}%` }} className="bg-red-500" />
            <div style={{ width: `${(severityBreakdown.warn / severityBreakdown.total) * 100}%` }} className="bg-amber-500" />
            <div style={{ width: `${(severityBreakdown.info / severityBreakdown.total) * 100}%` }} className="bg-blue-500" />
          </div>
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Critical ({severityBreakdown.crit})</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /> Warning ({severityBreakdown.warn})</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Info ({severityBreakdown.info})</div>
          </div>
        </CardContent>
      </Card>

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

      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-blue-600" />
            Alert Feed
          </h3>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {db.alerts.length}
          </span>
        </div>
        <div className="p-0 sm:p-2 bg-slate-50/30">
          {filtered.length === 0 ? (
            <div className="p-6">
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
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 p-2">
              {filtered.map((alert) => (
                <div
                  key={alert.id}
                  className="group flex cursor-pointer flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:p-5"
                  onClick={() => setDetail(alert)}
                >
                  <div className="flex items-start gap-4 sm:items-center">
                    <div className="shrink-0 rounded-xl bg-slate-50 p-2.5 transition-colors group-hover:bg-primary/5">
                      {severityIcon(alert.severity)}
                    </div>
                    <div>
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={typeClass(alert.type)}>
                          {alert.type}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <CalendarDays className="h-3 w-3" />
                          {fmtDate(alert.date)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {alert.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-slate-600 leading-relaxed">
                        {alert.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

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
              <span className="text-sm font-medium text-slate-600">{detail.severity}</span>
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
