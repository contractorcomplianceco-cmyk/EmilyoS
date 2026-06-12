import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Siren } from "lucide-react";
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

  const openAdd = () => {
    setEditing(emptyEscalation);
    setFormOpen(true);
  };
  const openEdit = (e: Escalation) => {
    setEditing(e);
    setFormOpen(true);
    setDetail(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escalation Queue"
        description="Matters routed for legal, compliance, tax, or leadership review. Routing only — decisions stay with the right authority."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Escalation
          </Button>
        }
      />

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

      <Card>
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
                  <TableHead>Reason</TableHead>
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
                  const over = isOverdue(e.dueDate);
                  const today = isDueToday(e.dueDate);
                  return (
                    <TableRow
                      key={e.id}
                      className="cursor-pointer"
                      onClick={() => setDetail(e)}
                    >
                      <TableCell className="max-w-xs">
                        <div className="font-medium">{e.reasonForEscalation}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {e.summary}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {matterTitle(db, e.matterId)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {e.assignedReviewer || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <EscalationStatusBadge value={e.status} />
                      </TableCell>
                      <TableCell>
                        {e.dueDate ? (
                          <div>
                            <div className="text-sm">{fmtDate(e.dueDate)}</div>
                            <div
                              className={
                                over
                                  ? "text-xs font-medium text-red-600"
                                  : today
                                    ? "text-xs font-medium text-amber-600"
                                    : "text-xs text-muted-foreground"
                              }
                            >
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
