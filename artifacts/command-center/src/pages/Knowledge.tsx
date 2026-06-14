import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, GraduationCap, CheckCircle2, ShieldAlert, Library } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/shared/Toolbar";
import { TonePill } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { knowledgeFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { agencyName, agencyOptions } from "@/lib/lookups";
import { fmtDate, daysSince } from "@/lib/format";
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

  const stats = useMemo(() => {
    const total = db.knowledge.length;
    const recent = db.knowledge.filter(k => {
      if (!k.lastVerifiedDate) return false;
      const days = daysSince(k.lastVerifiedDate);
      return days !== null && days <= 30;
    }).length;
    const unverified = db.knowledge.filter(k => !k.lastVerifiedDate).length;
    const agenciesCovered = new Set(db.knowledge.map(k => k.agencyId)).size;
    return { total, recent, unverified, agenciesCovered };
  }, [db.knowledge]);

  const openAdd = () => {
    setEditing(emptyEntry);
    setFormOpen(true);
  };
  const openEdit = (k: KnowledgeEntry) => {
    setEditing(k);
    setFormOpen(true);
    setDetail(null);
  };

  const kpis = [
    { label: "Total Entries", value: stats.total, icon: Library, gradient: "from-indigo-600 to-violet-600", shadow: "hover:shadow-indigo-500/30" },
    { label: "Agencies Covered", value: stats.agenciesCovered, icon: BookOpen, gradient: "from-violet-500 to-purple-600", shadow: "hover:shadow-purple-500/30" },
    { label: "Verified (<30d)", value: stats.recent, icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600", shadow: "hover:shadow-emerald-500/30" },
    { label: "Unverified", value: stats.unverified, icon: ShieldAlert, gradient: "from-amber-500 to-orange-600", shadow: "hover:shadow-amber-500/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Agency Knowledge Library</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Institutional knowledge for each agency: processes, portal steps, common deficiencies, and internal tips.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-white text-indigo-900 shadow-lg hover:bg-white/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Entry
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

      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex justify-between items-center">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            Knowledge Base
          </h3>
          <span className="text-sm text-muted-foreground">
            {filtered.length} matching
          </span>
        </div>
        <CardContent className="p-5">
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

          <div className="mt-6">
            {filtered.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((k) => (
                  <Card
                    key={k.id}
                    className="flex cursor-pointer flex-col transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 bg-white"
                    onClick={() => setDetail(k)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold leading-tight text-slate-800 group-hover:text-primary">
                          {k.topic}
                        </h3>
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        {agencyName(db, k.agencyId)}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-2">
                      <p className="line-clamp-3 text-sm text-slate-600">
                        {k.summary || k.detailedNotes || "No summary provided."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
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
                      className="justify-end gap-1 pt-0 border-t border-slate-50 mt-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mt-2 flex w-full justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(k)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(k)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
