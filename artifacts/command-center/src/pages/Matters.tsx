import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FolderKanban, ExternalLink } from "lucide-react";
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
import { RiskBadge, MatterStatusBadge } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { matterFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { agencyName, agencyOptions } from "@/lib/lookups";
import { fmtDate, daysUntil, isOverdue, isDueToday } from "@/lib/format";
import { MATTER_STATUSES, RISK_LEVELS, OPEN_MATTER_STATUSES } from "@/lib/types";
import type { Matter } from "@/lib/types";

const emptyMatter: Partial<Matter> = {
  title: "",
  clientOrCompanyName: "",
  agencyId: "",
  matterType: "License Application",
  currentStatus: "Not Started",
  priorityRiskLevel: "Medium",
};

function deadlineCell(value?: string | null) {
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

export default function Matters() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [riskFilter, setRiskFilter] = useState("__all__");
  const [agencyFilter, setAgencyFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Matter>>(emptyMatter);
  const [detail, setDetail] = useState<Matter | null>(null);
  const [toDelete, setToDelete] = useState<Matter | null>(null);

  const agOpts = useMemo(() => agencyOptions(db), [db]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.matters
      .filter((m) =>
        statusFilter === "__all__"
          ? true
          : statusFilter === "__open__"
            ? OPEN_MATTER_STATUSES.includes(m.currentStatus)
            : m.currentStatus === statusFilter,
      )
      .filter((m) => (riskFilter === "__all__" ? true : m.priorityRiskLevel === riskFilter))
      .filter((m) => (agencyFilter === "__all__" ? true : m.agencyId === agencyFilter))
      .filter((m) =>
        q === ""
          ? true
          : [m.title, m.clientOrCompanyName, m.internalOwner, m.matterType]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => {
        const ad = a.nextFollowUpDate || "9999";
        const bd = b.nextFollowUpDate || "9999";
        return ad.localeCompare(bd);
      });
  }, [db.matters, search, statusFilter, riskFilter, agencyFilter]);

  const openAdd = () => {
    setEditing(emptyMatter);
    setFormOpen(true);
  };
  const openEdit = (m: Matter) => {
    setEditing(m);
    setFormOpen(true);
    setDetail(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Matters Tracker"
        description="Every active and historical regulatory matter, with status, ownership, and deadlines."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Matter
          </Button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search matters, clients, owners..."
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "__open__", label: "Open only" },
              ...MATTER_STATUSES.map((s) => ({ value: s, label: s })),
            ],
          },
          {
            key: "risk",
            label: "Risk",
            value: riskFilter,
            onChange: setRiskFilter,
            options: RISK_LEVELS.map((r) => ({ value: r, label: r })),
          },
          {
            key: "agency",
            label: "Agency",
            value: agencyFilter,
            onChange: setAgencyFilter,
            options: agOpts,
          },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FolderKanban}
                title="No matters found"
                description="Adjust filters or add a new regulatory matter."
                action={
                  <Button variant="outline" onClick={openAdd}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add Matter
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matter</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Follow-Up</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow
                    key={m.id}
                    className="cursor-pointer"
                    onClick={() => setDetail(m)}
                  >
                    <TableCell>
                      <div className="font-medium">{m.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.clientOrCompanyName} · {m.matterType}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {agencyName(db, m.agencyId)}
                    </TableCell>
                    <TableCell>
                      <MatterStatusBadge value={m.currentStatus} />
                    </TableCell>
                    <TableCell>
                      <RiskBadge value={m.priorityRiskLevel} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.internalOwner || "—"}
                    </TableCell>
                    <TableCell>{deadlineCell(m.nextFollowUpDate)}</TableCell>
                    <TableCell>{deadlineCell(m.deadlineRenewalDate)}</TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(m)}
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
        title={editing.id ? "Edit Matter" : "Add Matter"}
        description="Track this regulatory matter from intake through completion."
        fields={matterFields(agOpts)}
        initial={editing}
        onSubmit={(values) => saveRecord("matters", { ...editing, ...values } as Matter)}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.title}
        onConfirm={() => {
          if (toDelete) deleteRecord("matters", toDelete.id);
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
              <MatterStatusBadge value={detail.currentStatus} />
              <RiskBadge value={detail.priorityRiskLevel} />
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Client / Company", value: detail.clientOrCompanyName },
                { label: "Agency", value: agencyName(db, detail.agencyId) },
                { label: "Matter Type", value: detail.matterType },
                { label: "State / Jurisdiction", value: detail.stateJurisdiction },
                { label: "Internal Owner", value: detail.internalOwner },
                { label: "Emily Owner Status", value: detail.emilyOwnerStatus },
                { label: "Waiting On", value: detail.waitingOn },
                { label: "Date Opened", value: fmtDate(detail.dateOpened) },
                { label: "Last Contact", value: fmtDate(detail.lastContactDate) },
                { label: "Next Follow-Up", value: fmtDate(detail.nextFollowUpDate) },
                { label: "Deadline / Renewal", value: fmtDate(detail.deadlineRenewalDate) },
                { label: "Submission Date", value: fmtDate(detail.submissionDate) },
                { label: "Next Action", value: detail.nextAction, full: true },
                { label: "Notes", value: detail.notes, full: true },
                {
                  label: "Documents / Reference Links",
                  full: true,
                  value: detail.referenceLinks ? (
                    /^https?:\/\//.test(detail.referenceLinks.trim()) ? (
                      <a
                        href={detail.referenceLinks.trim()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Open link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      detail.referenceLinks
                    )
                  ) : null,
                },
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
