import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Building2 } from "lucide-react";
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
import { ActiveBadge, TonePill } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { agencyFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { AGENCY_TYPES, ACTIVE_STATUSES } from "@/lib/types";
import type { Agency } from "@/lib/types";

const emptyAgency: Partial<Agency> = {
  name: "",
  agencyType: "Licensing Board",
  activeStatus: "Active",
  preferredCommunicationMethod: "Email",
};

export default function Agencies() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("__all__");
  const [statusFilter, setStatusFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Agency>>(emptyAgency);
  const [detail, setDetail] = useState<Agency | null>(null);
  const [toDelete, setToDelete] = useState<Agency | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.agencies
      .filter((a) => (typeFilter === "__all__" ? true : a.agencyType === typeFilter))
      .filter((a) =>
        statusFilter === "__all__" ? true : a.activeStatus === statusFilter,
      )
      .filter((a) =>
        q === ""
          ? true
          : [a.name, a.stateRegion, a.contactPerson, a.departmentCategory]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [db.agencies, search, typeFilter, statusFilter]);

  const openAdd = () => {
    setEditing(emptyAgency);
    setFormOpen(true);
  };
  const openEdit = (a: Agency) => {
    setEditing(a);
    setFormOpen(true);
    setDetail(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Directory"
        description="Reference profiles for every government agency, including portals, contacts, and known patterns."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Agency
          </Button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search agencies..."
        filters={[
          {
            key: "type",
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: AGENCY_TYPES.map((t) => ({ value: t, label: t })),
          },
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: ACTIVE_STATUSES.map((s) => ({ value: s, label: s })),
          },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Building2}
                title="No agencies found"
                description="Adjust filters or add a new agency to the directory."
                action={
                  <Button variant="outline" onClick={openAdd}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add Agency
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>State / Region</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Preferred</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer"
                    onClick={() => setDetail(a)}
                  >
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.agencyType}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.stateRegion || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.contactPerson || "—"}
                    </TableCell>
                    <TableCell>
                      <TonePill label={a.preferredCommunicationMethod} tone="slate" />
                    </TableCell>
                    <TableCell>
                      <ActiveBadge value={a.activeStatus} />
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(a)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(a)}
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
        title={editing.id ? "Edit Agency" : "Add Agency"}
        description="Maintain a reliable reference profile for this agency."
        fields={agencyFields}
        initial={editing}
        onSubmit={(values) => saveRecord("agencies", { ...editing, ...values } as Agency)}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.name}
        onConfirm={() => {
          if (toDelete) deleteRecord("agencies", toDelete.id);
          setToDelete(null);
        }}
      />

      <DetailSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        subtitle={
          detail ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <ActiveBadge value={detail.activeStatus} />
              <TonePill label={detail.agencyType} tone="blue" />
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "State / Region", value: detail.stateRegion },
                { label: "Department Category", value: detail.departmentCategory },
                { label: "Contact Person", value: detail.contactPerson },
                {
                  label: "Preferred Method",
                  value: detail.preferredCommunicationMethod,
                },
                { label: "Main Phone", value: detail.mainPhone },
                { label: "Main Email", value: detail.mainEmail },
                {
                  label: "Website",
                  value: detail.website ? (
                    <a
                      href={detail.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Visit site <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null,
                },
                {
                  label: "Portal Link",
                  value: detail.portalLink ? (
                    <a
                      href={detail.portalLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Open portal <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null,
                },
                { label: "Login / Access Notes", value: detail.loginAccessNotes, full: true },
                { label: "Follow-Up Timing Rules", value: detail.followUpTimingRules, full: true },
                { label: "Known Processing Patterns", value: detail.knownProcessingPatterns, full: true },
                { label: "Common Issues", value: detail.commonIssues, full: true },
                { label: "Escalation Notes", value: detail.escalationNotes, full: true },
                { label: "Added", value: fmtDate(detail.createdAt) },
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
