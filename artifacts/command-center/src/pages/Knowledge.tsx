import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Toolbar } from "@/components/shared/Toolbar";
import { TonePill } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { knowledgeFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { agencyName, agencyOptions } from "@/lib/lookups";
import { fmtDate } from "@/lib/format";
import type { KnowledgeEntry } from "@/lib/types";

const emptyEntry: Partial<KnowledgeEntry> = {
  topic: "",
  agencyId: "",
};

export default function Knowledge() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("__all__");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<KnowledgeEntry>>(emptyEntry);
  const [detail, setDetail] = useState<KnowledgeEntry | null>(null);
  const [toDelete, setToDelete] = useState<KnowledgeEntry | null>(null);

  const agOpts = useMemo(() => agencyOptions(db), [db]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.knowledge
      .filter((k) => (agencyFilter === "__all__" ? true : k.agencyId === agencyFilter))
      .filter((k) =>
        q === ""
          ? true
          : [k.topic, k.summary, k.detailedNotes, k.stateJurisdiction, k.commonDeficiencies]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => a.topic.localeCompare(b.topic));
  }, [db.knowledge, search, agencyFilter]);

  const openAdd = () => {
    setEditing(emptyEntry);
    setFormOpen(true);
  };
  const openEdit = (k: KnowledgeEntry) => {
    setEditing(k);
    setFormOpen(true);
    setDetail(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Knowledge Library"
        description="Institutional knowledge for each agency: processes, portal steps, common deficiencies, and internal tips."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Entry
          </Button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search topics, notes, deficiencies..."
        filters={[
          {
            key: "agency",
            label: "Agency",
            value: agencyFilter,
            onChange: setAgencyFilter,
            options: agOpts,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={BookOpen}
              title="No knowledge entries"
              description="Capture how an agency works so the whole team benefits."
              action={
                <Button variant="outline" onClick={openAdd}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Entry
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((k) => (
            <Card
              key={k.id}
              className="flex cursor-pointer flex-col transition-shadow hover:shadow-md"
              onClick={() => setDetail(k)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight text-foreground">
                    {k.topic}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {agencyName(db, k.agencyId)}
                </p>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {k.summary || k.detailedNotes || "No summary provided."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {k.stateJurisdiction ? (
                    <TonePill label={k.stateJurisdiction} tone="slate" />
                  ) : null}
                  {k.lastVerifiedDate ? (
                    <TonePill label={`Verified ${fmtDate(k.lastVerifiedDate)}`} tone="green" />
                  ) : (
                    <TonePill label="Unverified" tone="amber" />
                  )}
                </div>
              </CardContent>
              <CardFooter
                className="justify-end gap-1 pt-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button variant="ghost" size="icon" onClick={() => openEdit(k)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setToDelete(k)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing.id ? "Edit Knowledge Entry" : "Add Knowledge Entry"}
        description="Document how this agency works so the process is repeatable."
        fields={knowledgeFields(agOpts)}
        initial={editing}
        onSubmit={(values) =>
          saveRecord("knowledge", { ...editing, ...values } as KnowledgeEntry)
        }
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.topic}
        onConfirm={() => {
          if (toDelete) deleteRecord("knowledge", toDelete.id);
          setToDelete(null);
        }}
      />

      <DetailSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.topic ?? ""}
        subtitle={
          detail ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <TonePill label={agencyName(db, detail.agencyId)} tone="blue" />
              {detail.stateJurisdiction ? (
                <TonePill label={detail.stateJurisdiction} tone="slate" />
              ) : null}
            </div>
          ) : null
        }
        rows={
          detail
            ? [
                { label: "Summary", value: detail.summary, full: true },
                { label: "Detailed Notes", value: detail.detailedNotes, full: true },
                { label: "Portal Instructions", value: detail.portalInstructions, full: true },
                { label: "Follow-Up Timing Guidance", value: detail.followUpTimingGuidance, full: true },
                { label: "Common Deficiencies", value: detail.commonDeficiencies, full: true },
                { label: "Required Forms / Links", value: detail.requiredFormsOrLinks, full: true },
                { label: "Contact Preferences", value: detail.contactPreferences, full: true },
                { label: "Internal Tips", value: detail.internalTips, full: true },
                { label: "Last Verified", value: fmtDate(detail.lastVerifiedDate) },
                { label: "Verified By", value: detail.verifiedBy },
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
