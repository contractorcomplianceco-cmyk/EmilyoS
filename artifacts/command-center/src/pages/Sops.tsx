import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FileText, ClipboardList, CheckSquare, Clock, AlertTriangle } from "lucide-react";
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
import { SopStatusBadge, TonePill } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { sopFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { SOP_CATEGORIES, SOP_STATUSES } from "@/lib/types";
import type { Sop } from "@/lib/types";

const emptySop: Partial<Sop> = {
  title: "",
  category: "Agency Communication SOP",
  status: "Draft",
};

export default function Sops() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("__all__");
  const [statusFilter, setStatusFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Sop>>(emptySop);
  const [detail, setDetail] = useState<Sop | null>(null);
  const [toDelete, setToDelete] = useState<Sop | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.sops
      .filter((s) => (categoryFilter === "__all__" ? true : s.category === categoryFilter))
      .filter((s) => (statusFilter === "__all__" ? true : s.status === statusFilter))
      .filter((s) =>
        q === ""
          ? true
          : [s.title, s.purpose, s.steps, s.owner, s.notes]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [db.sops, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = db.sops.length;
    const active = db.sops.filter(s => s.status === "Active").length;
    const drafts = db.sops.filter(s => s.status === "Draft").length;
    const needsReview = db.sops.filter(s => s.status === "Under Review").length;
    return { total, active, drafts, needsReview };
  }, [db.sops]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    db.sops.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [db.sops]);

  const openAdd = () => {
    setEditing(emptySop);
    setFormOpen(true);
  };
  const openEdit = (s: Sop) => {
    setEditing(s);
    setFormOpen(true);
    setDetail(null);
  };

  const kpis = [
    { label: "Total SOPs", value: stats.total, icon: ClipboardList, gradient: "from-primary to-sky-400", shadow: "hover:shadow-primary/20" },
    { label: "Active Policies", value: stats.active, icon: CheckSquare, gradient: "from-emerald-500 to-teal-600", shadow: "hover:shadow-emerald-500/30" },
    { label: "Under Review", value: stats.needsReview, icon: AlertTriangle, gradient: "from-primary to-accent", shadow: "hover:shadow-primary/20" },
    { label: "Drafts", value: stats.drafts, icon: Clock, gradient: "from-accent to-pink-300", shadow: "hover:shadow-accent/20" },
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
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">SOP & Training Center</h2>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Standard operating procedures and training references that keep the department consistent.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-primary text-white shadow-sm hover:bg-primary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add SOP
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
            searchPlaceholder="Search SOPs..."
            filters={[
              {
                key: "category",
                label: "Category",
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: SOP_CATEGORIES.map((c) => ({ value: c, label: c })),
              },
              {
                key: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: SOP_STATUSES.map((s) => ({ value: s, label: s })),
              },
            ]}
          />

          <Card className="overflow-hidden border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
                Policy Library
              </h3>
              <span className="text-sm text-muted-foreground">
                {filtered.length} matching
              </span>
            </div>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={FileText}
                    title="No SOPs found"
                    description="Document a procedure so it can be followed consistently."
                    action={
                      <Button variant="outline" onClick={openAdd}>
                        <Plus className="mr-1.5 h-4 w-4" /> Add SOP
                      </Button>
                    }
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title & Purpose</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => (
                      <TableRow
                        key={s.id}
                        className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => setDetail(s)}
                      >
                        <TableCell>
                          <div className="font-semibold text-slate-800">{s.title}</div>
                          <div className="line-clamp-1 text-xs text-muted-foreground mt-0.5 max-w-sm">
                            {s.purpose}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TonePill label={s.category} tone="slate" />
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-600">
                          {s.owner || "—"}
                        </TableCell>
                        <TableCell>
                          <SopStatusBadge value={s.status} />
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {fmtDate(s.lastUpdated)}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setToDelete(s)}
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
          <Card className="overflow-hidden border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-primary to-accent" />
                Policies by Category
              </h3>
            </div>
            <CardContent className="p-5">
              {categoryCounts.length > 0 ? (
                <div className="space-y-4">
                  {categoryCounts.map(([cat, count]) => (
                    <div key={cat} className="flex items-start justify-between">
                      <span className="text-sm font-medium text-slate-700 leading-tight max-w-[150px]">{cat}</span>
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">No categories active.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing.id ? "Edit SOP" : "Add SOP"}
        description="Write a clear, repeatable procedure with numbered steps."
        fields={sopFields}
        initial={editing}
        onSubmit={(values) => saveRecord("sops", { ...editing, ...values } as Sop)}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.title}
        onConfirm={() => {
          if (toDelete) deleteRecord("sops", toDelete.id);
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
              <SopStatusBadge value={detail.status} />
              <TonePill label={detail.category} tone="slate" />
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Owner", value: detail.owner },
                { label: "Last Updated", value: fmtDate(detail.lastUpdated) },
                { label: "Purpose", value: detail.purpose, full: true },
                { label: "Steps", value: detail.steps, full: true },
                { label: "Notes", value: detail.notes, full: true },
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
