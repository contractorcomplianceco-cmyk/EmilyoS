import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
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
      <PageHeader
        title="Deficiency & Agency Request Queue"
        description="Track agency deficiencies and information requests through to resolution."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Request
          </Button>
        }
      />

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

      <Card>
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
                      <div className="font-medium">{d.requestOrDeficiencyType}</div>
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
