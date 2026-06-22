import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, MessageSquare, ExternalLink, Activity, Users, Clock } from "lucide-react";
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
import { TonePill } from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { communicationFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import { agencyName, matterTitle, agencyOptions, matterOptions } from "@/lib/lookups";
import { fmtDate, fmtDateTime, nowISO, isOverdue } from "@/lib/format";
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

  const stats = useMemo(() => {
    const total = db.communications.length;
    const past7Days = db.communications.filter(c => {
      const d = new Date(c.dateTime);
      const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
      return diff <= 7 && diff >= 0;
    }).length;
    const followUps = db.communications.filter(c => c.followUpNeeded).length;
    const overdueFollowUps = db.communications.filter(c => c.followUpNeeded && isOverdue(c.followUpDate)).length;
    return { total, past7Days, followUps, overdueFollowUps };
  }, [db.communications]);

  const methodsDistribution = useMemo(() => {
    const counts = db.communications.reduce((acc, c) => {
      acc[c.contactMethod] = (acc[c.contactMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [db.communications]);

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
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-primary/5 to-accent/5 p-6 sm:p-8 border border-white shadow-sm">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm text-primary">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Communications Hub</h2>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                A timestamped record of every interaction with agencies, with outcomes and next steps.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-primary text-white shadow-sm hover:bg-primary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Log Communication
          </Button>
        </div>
      </div>

      {/* KPI stat strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Logs",
            value: stats.total,
            icon: MessageSquare,
          },
          {
            label: "Past 7 Days",
            value: stats.past7Days,
            icon: Activity,
          },
          {
            label: "Pending Follow-Ups",
            value: stats.followUps,
            icon: Clock,
          },
          {
            label: "Overdue Follow-Ups",
            value: stats.overdueFollowUps,
            icon: Users,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="relative overflow-hidden rounded-2xl border border-white/40 p-5 text-slate-700 shadow-sm bg-white hover:-translate-y-1 hover:shadow-md transition-all group"
            >
              <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-primary/5 blur-2xl" />
              <div className="relative mb-3 flex items-start justify-between">
                <div className="text-4xl font-extrabold leading-none tracking-tight text-slate-800">
                  {kpi.value}
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary group-hover:scale-110 transition-transform">
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
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

          <Card className="overflow-hidden border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-primary to-accent" />
                Communication Logs
              </h3>
              <span className="text-sm text-muted-foreground">
                {filtered.length} logs
              </span>
            </div>
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
                        <TableCell className="whitespace-nowrap text-sm text-slate-800 font-medium">
                          {fmtDateTime(c.dateTime)}
                        </TableCell>
                        <TableCell>
                          <TonePill label={c.contactMethod} tone="slate" />
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="text-slate-800 font-medium">{agencyName(db, c.agencyId)}</div>
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
                              tone={isOverdue(c.followUpDate) ? "red" : "amber"}
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
        </div>
        
        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
                Methods
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              {methodsDistribution.map(([method, count]) => (
                <div key={method} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{method}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" 
                      style={{ width: `${Math.max(5, (count / stats.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

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
