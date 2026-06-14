import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Building2,
  CircleCheck,
  Layers,
  MapPin,
} from "lucide-react";
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

  const stats = useMemo(() => {
    const total = db.agencies.length;
    const active = db.agencies.filter((a) => a.activeStatus === "Active").length;
    const types = new Set(db.agencies.map((a) => a.agencyType)).size;
    const states = new Set(
      db.agencies.map((a) => a.stateRegion).filter((s) => s && s.trim() !== ""),
    ).size;
    return { total, active, types, states };
  }, [db.agencies]);

  const kpis = [
    {
      label: "Total Agencies",
      value: stats.total,
      icon: Building2,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Active",
      value: stats.active,
      icon: CircleCheck,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "hover:shadow-emerald-500/30",
    },
    {
      label: "Agency Types",
      value: stats.types,
      icon: Layers,
      gradient: "from-violet-500 to-purple-600",
      shadow: "hover:shadow-purple-500/30",
    },
    {
      label: "States / Regions",
      value: stats.states,
      icon: MapPin,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Agency Directory</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Reference profiles for every government agency, including portals, contacts,
                and known patterns.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-white text-indigo-900 shadow-lg hover:bg-white/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Agency
          </Button>
        </div>
      </div>

      {/* KPI stat strip */}
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

      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            All Agencies
          </h3>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {db.agencies.length}
          </span>
        </div>
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
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm">
                          {initials(a.name)}
                        </div>
                        <span className="font-medium text-slate-800">{a.name}</span>
                      </div>
                    </TableCell>
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
