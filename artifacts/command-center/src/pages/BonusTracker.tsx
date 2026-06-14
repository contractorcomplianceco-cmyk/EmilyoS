import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TonePill } from "@/components/shared/Badges";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { bonusOpportunityFields } from "@/lib/fields";
import { useDatabase, saveRecord, deleteRecord } from "@/lib/store";
import type { BonusOpportunity, BonusTone } from "@/lib/types";
import {
  Coins,
  Plus,
  Pencil,
  Trash2,
  Library,
  Megaphone,
  Users,
  PieChart,
  Briefcase,
  BookOpen,
} from "lucide-react";

const OWNER = "Emily Jones";

const TONE_STYLES: Record<
  BonusTone,
  { icon: typeof Library; iconClass: string; accent: string }
> = {
  blue: {
    icon: Library,
    iconClass: "bg-indigo-50 text-indigo-600",
    accent: "from-indigo-500 to-violet-600",
  },
  purple: {
    icon: Megaphone,
    iconClass: "bg-violet-50 text-violet-600",
    accent: "from-violet-500 to-purple-600",
  },
  amber: {
    icon: Users,
    iconClass: "bg-amber-50 text-amber-600",
    accent: "from-amber-500 to-orange-600",
  },
  green: {
    icon: PieChart,
    iconClass: "bg-emerald-50 text-emerald-600",
    accent: "from-emerald-500 to-teal-600",
  },
  slate: {
    icon: Briefcase,
    iconClass: "bg-sky-50 text-sky-600",
    accent: "from-sky-500 to-indigo-600",
  },
};

const emptyOpportunity: Partial<BonusOpportunity> = {
  name: "",
  amount: "",
  status: "",
  tone: "blue",
  criteria: "",
  meta: "",
};

export default function BonusTracker() {
  const db = useDatabase();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<BonusOpportunity>>(emptyOpportunity);
  const [toDelete, setToDelete] = useState<BonusOpportunity | null>(null);

  // Data-derived: the Board Knowledge Library Buildout Bonus is tied to the
  // institutional-knowledge work Emily actually contributes — verified knowledge
  // entries plus SOPs/policies she owns.
  const libraryEntries = db.knowledge.filter((k) => k.verifiedBy === OWNER).length;
  const sopsOwned = db.sops.filter((s) => s.owner === OWNER).length;
  const libraryContributions = libraryEntries + sopsOwned;
  // Per the proposal, $500–$1,500 per completed buildout project; we estimate at
  // the mid-range ($1,000) per contribution for a live projection.
  const libraryProjection = libraryContributions * 1000;

  const currency = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const opportunities = useMemo(
    () => [...db.bonusOpportunities].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [db.bonusOpportunities],
  );

  const stipend = db.bonusOpportunities.find((o) => o.id === "bo_stipend");
  const equity = db.bonusOpportunities.find((o) => o.id === "bo_equity");

  const kpis = [
    {
      label: "Library Contributions",
      value: String(libraryContributions),
      icon: BookOpen,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Buildout Bonus (Est.)",
      value: currency(libraryProjection),
      icon: Coins,
      gradient: "from-violet-500 to-purple-600",
      shadow: "hover:shadow-purple-500/30",
    },
    {
      label: "Monthly Stipend",
      value: stipend?.amount ?? "—",
      icon: Megaphone,
      gradient: "from-amber-500 to-orange-600",
      shadow: "hover:shadow-amber-500/30",
    },
    {
      label: "Profit / Equity Track",
      value: equity?.amount ?? "—",
      icon: PieChart,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "hover:shadow-emerald-500/30",
    },
  ];

  const openAdd = () => {
    setEditing(emptyOpportunity);
    setFormOpen(true);
  };
  const openEdit = (o: BonusOpportunity) => {
    setEditing(o);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Coins className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Bonus Tracker</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Your bonus structure — project and milestone bonuses, a monthly communications
                stipend, and future profit/equity consideration. The Knowledge Library buildout
                bonus is projected live from your contributions.
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="shrink-0 bg-white text-indigo-900 shadow-lg hover:bg-white/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Bonus
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
                <div className="text-2xl font-extrabold leading-none tracking-tight">{kpi.value}</div>
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

      {/* Bonus opportunities */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            Bonus Opportunities
          </h3>
          <span className="text-sm font-medium text-slate-500">{opportunities.length} types</span>
        </div>
        <div className="p-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {opportunities.map((o) => {
            const style = TONE_STYLES[o.tone] ?? TONE_STYLES.slate;
            const Icon = style.icon;
            const meta = o.dataDerived
              ? `${libraryContributions} contributions logged · est. ${currency(libraryProjection)}`
              : o.meta;
            return (
              <div
                key={o.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span
                  className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${style.accent}`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-lg p-2 ${style.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">{o.name}</p>
                      <p className="mt-0.5 text-sm font-semibold text-indigo-600">{o.amount}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {o.status ? <TonePill label={o.status} tone={o.tone} /> : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(o)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setToDelete(o)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {o.criteria ? (
                  <p className="mt-3 text-sm text-slate-600">{o.criteria}</p>
                ) : null}
                {meta ? (
                  <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                    {meta}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing.id ? "Edit Bonus" : "Add Bonus"}
        description="Keep your bonus structure current as proposal terms change."
        fields={bonusOpportunityFields}
        initial={editing}
        onSubmit={(values) =>
          saveRecord("bonusOpportunities", { ...editing, ...values } as BonusOpportunity)
        }
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete?.name}
        onConfirm={() => {
          if (toDelete) deleteRecord("bonusOpportunities", toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
