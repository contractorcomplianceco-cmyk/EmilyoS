import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, MessageSquare, ExternalLink } from "lucide-react";
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
import { TonePill } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { communicationFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { agencyName, matterTitle, agencyOptions, matterOptions } from "@/lib/lookups";
import { fmtDate, fmtDateTime, nowISO } from "@/lib/format";
import { COMMUNICATION_METHODS } from "@/lib/types";
import type { Communication } from "@/lib/types";

const emptyComm: Partial<Communication> = {
  dateTime: nowISO(),
  contactMethod: "Email",
  agencyId: "",
  matterId: "",
  followUpNeeded: false,
};

export default function Communications() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("__all__");
  const [agencyFilter, setAgencyFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Communication>>(emptyComm);
  const [detail, setDetail] = useState<Communication | null>(null);
  const [toDelete, setToDelete] = useState<Communication | null>(null);

  const agOpts = useMemo(() => agencyOptions(db), [db]);
  const mtOpts = useMemo(() => matterOptions(db), [db]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.communications
      .filter((c) => (methodFilter === "__all__" ? true : c.contactMethod === methodFilter))
      .filter((c) => (agencyFilter === "__all__" ? true : c.agencyId === agencyFilter))
      .filter((c) =>
        q === ""
          ? true
          : [c.summary, c.outcome, c.personContacted, c.loggedBy, c.nextStep]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => (b.dateTime || "").localeCompare(a.dateTime || ""));
  }, [db.communications, search, methodFilter, agencyFilter]);

  const openAdd = () => {
    setEditing({ ...emptyComm, dateTime: nowISO() });
    setFormOpen(true);
  };
  const openEdit = (c: Communication) => {
    setEditing(c);
    setFormOpen(true);
    setDetail(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Log"
        description="A timestamped record of every interaction with agencies, with outcomes and next steps."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Log Communication
          </Button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search summaries, contacts, outcomes..."
        filters={[
          {
            key: "method",
            label: "Method",
            value: methodFilter,
            onChange: setMethodFilter,
            options: COMMUNICATION_METHODS.map((m) => ({ value: m, label: m })),
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
                icon={MessageSquare}
                title="No communications logged"
                description="Log a call, email, or portal message to start building the record."
                action={
                  <Button variant="outline" onClick={openAdd}>
                    <Plus className="mr-1.5 h-4 w-4" /> Log Communication
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Agency / Matter</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Logged By</TableHead>
                  <TableHead>Follow-Up</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => setDetail(c)}
                  >
                    <TableCell className="whitespace-nowrap text-sm">
                      {fmtDateTime(c.dateTime)}
                    </TableCell>
                    <TableCell>
                      <TonePill label={c.contactMethod} tone="slate" />
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="text-foreground">{agencyName(db, c.agencyId)}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.matterId ? matterTitle(db, c.matterId) : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {c.summary}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.loggedBy || "—"}
                    </TableCell>
                    <TableCell>
                      {c.followUpNeeded ? (
                        <TonePill
                          label={c.followUpDate ? fmtDate(c.followUpDate) : "Needed"}
                          tone="amber"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(c)}
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
        title={editing.id ? "Edit Communication" : "Log Communication"}
        description="Record what was discussed, the outcome, and the next step."
        fields={communicationFields(agOpts, mtOpts)}
        initial={editing}
        onSubmit={(values) =>
          saveRecord("communications", { ...editing, ...values } as Communication)
        }
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.summary?.slice(0, 40)}
        onConfirm={() => {
          if (toDelete) deleteRecord("communications", toDelete.id);
          setToDelete(null);
        }}
      />

      <DetailSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail ? `${detail.contactMethod} · ${fmtDateTime(detail.dateTime)}` : ""}
        subtitle={
          detail ? (
            <div className="pt-1 text-sm text-muted-foreground">
              {agencyName(db, detail.agencyId)}
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Related Matter", value: detail.matterId ? matterTitle(db, detail.matterId) : "—" },
                { label: "Person Contacted", value: detail.personContacted },
                { label: "Logged By", value: detail.loggedBy },
                { label: "Follow-Up Needed", value: detail.followUpNeeded ? "Yes" : "No" },
                { label: "Follow-Up Date", value: fmtDate(detail.followUpDate) },
                { label: "Summary", value: detail.summary, full: true },
                { label: "Outcome", value: detail.outcome, full: true },
                { label: "Next Step", value: detail.nextStep, full: true },
                {
                  label: "Attachments / Reference Links",
                  full: true,
                  value: detail.attachmentsOrLinks ? (
                    /^https?:\/\//.test(detail.attachmentsOrLinks.trim()) ? (
                      <a
                        href={detail.attachmentsOrLinks.trim()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Open link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      detail.attachmentsOrLinks
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
