import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
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
import { PageHeader } from "@/components/shared/PageHeader";
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

  const openAdd = () => {
    setEditing(emptySop);
    setFormOpen(true);
  };
  const openEdit = (s: Sop) => {
    setEditing(s);
    setFormOpen(true);
    setDetail(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="SOP & Training Center"
        description="Standard operating procedures and training references that keep the department consistent."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add SOP
          </Button>
        }
      />

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

      <Card>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => setDetail(s)}
                  >
                    <TableCell>
                      <div className="font-medium">{s.title}</div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {s.purpose}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TonePill label={s.category} tone="slate" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.owner || "—"}
                    </TableCell>
                    <TableCell>
                      <SopStatusBadge value={s.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
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
