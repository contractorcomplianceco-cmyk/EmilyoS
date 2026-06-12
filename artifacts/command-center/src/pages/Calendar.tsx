import { useMemo, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Toolbar } from "@/components/shared/Toolbar";
import {
  RiskBadge,
  MatterStatusBadge,
  DeficiencyStatusBadge,
  EscalationStatusBadge,
  TonePill,
} from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDatabase } from "@/lib/store";
import { agencyName, matterTitle } from "@/lib/lookups";
import { fmtDate, daysUntil, isOverdue, isDueToday } from "@/lib/format";
import {
  OPEN_MATTER_STATUSES,
  OPEN_DEFICIENCY_STATUSES,
  OPEN_ESCALATION_STATUSES,
} from "@/lib/types";

type Source = "Matter" | "Deficiency" | "Escalation" | "Communication";

interface FollowUpItem {
  id: string;
  date: string;
  source: Source;
  title: string;
  context: string;
  badge: React.ReactNode;
  href: string;
}

function bucketOf(date: string): "overdue" | "today" | "week" | "later" {
  if (isOverdue(date)) return "overdue";
  if (isDueToday(date)) return "today";
  const n = daysUntil(date) ?? 999;
  return n <= 7 ? "week" : "later";
}

export default function Calendar() {
  const db = useDatabase();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("__all__");

  const items = useMemo<FollowUpItem[]>(() => {
    const out: FollowUpItem[] = [];

    db.matters
      .filter((m) => m.nextFollowUpDate && OPEN_MATTER_STATUSES.includes(m.currentStatus))
      .forEach((m) =>
        out.push({
          id: `m_${m.id}`,
          date: m.nextFollowUpDate,
          source: "Matter",
          title: m.title,
          context: `${m.clientOrCompanyName} · ${agencyName(db, m.agencyId)}`,
          badge: <MatterStatusBadge value={m.currentStatus} />,
          href: "/matters",
        }),
      );

    db.deficiencies
      .filter((d) => d.dueDate && OPEN_DEFICIENCY_STATUSES.includes(d.status))
      .forEach((d) =>
        out.push({
          id: `d_${d.id}`,
          date: d.dueDate,
          source: "Deficiency",
          title: d.requestOrDeficiencyType,
          context: matterTitle(db, d.matterId),
          badge: <DeficiencyStatusBadge value={d.status} />,
          href: "/deficiencies",
        }),
      );

    db.escalations
      .filter((e) => e.dueDate && OPEN_ESCALATION_STATUSES.includes(e.status))
      .forEach((e) =>
        out.push({
          id: `e_${e.id}`,
          date: e.dueDate,
          source: "Escalation",
          title: e.reasonForEscalation,
          context: matterTitle(db, e.matterId),
          badge: <EscalationStatusBadge value={e.status} />,
          href: "/escalations",
        }),
      );

    db.communications
      .filter((c) => c.followUpNeeded && c.followUpDate)
      .forEach((c) =>
        out.push({
          id: `c_${c.id}`,
          date: c.followUpDate,
          source: "Communication",
          title: `Follow up: ${c.contactMethod}`,
          context: `${agencyName(db, c.agencyId)} · ${c.summary.slice(0, 50)}`,
          badge: <TonePill label={c.contactMethod} tone="slate" />,
          href: "/communications",
        }),
      );

    return out.sort((a, b) => a.date.localeCompare(b.date));
  }, [db]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => (sourceFilter === "__all__" ? true : i.source === sourceFilter))
      .filter((i) =>
        q === "" ? true : `${i.title} ${i.context}`.toLowerCase().includes(q),
      );
  }, [items, search, sourceFilter]);

  const groups = useMemo(() => {
    return {
      overdue: filtered.filter((i) => bucketOf(i.date) === "overdue"),
      today: filtered.filter((i) => bucketOf(i.date) === "today"),
      week: filtered.filter((i) => bucketOf(i.date) === "week"),
      later: filtered.filter((i) => bucketOf(i.date) === "later"),
    };
  }, [filtered]);

  const sections: {
    key: keyof typeof groups;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }[] = [
    { key: "overdue", label: "Overdue", icon: AlertCircle, tone: "text-red-600" },
    { key: "today", label: "Due Today", icon: Clock, tone: "text-amber-600" },
    { key: "week", label: "Next 7 Days", icon: CalendarDays, tone: "text-blue-600" },
    { key: "later", label: "Later", icon: CheckCircle2, tone: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-Up Calendar"
        description="Consolidated view of every upcoming follow-up across matters, deficiencies, escalations, and communications."
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search follow-ups..."
        filters={[
          {
            key: "source",
            label: "Source",
            value: sourceFilter,
            onChange: setSourceFilter,
            options: [
              { value: "Matter", label: "Matter" },
              { value: "Deficiency", label: "Deficiency" },
              { value: "Escalation", label: "Escalation" },
              { value: "Communication", label: "Communication" },
            ],
          },
        ]}
      />

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={CalendarDays}
              title="No follow-ups scheduled"
              description="Set follow-up dates on matters, deficiencies, escalations, or communications to populate this calendar."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map(({ key, label, icon: Icon, tone }) => {
            const list = groups[key];
            if (list.length === 0) return null;
            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className={`h-4 w-4 ${tone}`} />
                    {label}
                    <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {list.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.map((i) => {
                    const n = daysUntil(i.date);
                    const over = isOverdue(i.date);
                    const today = isDueToday(i.date);
                    return (
                      <Link key={i.id} href={i.href}>
                        <div className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-foreground">
                                {i.title}
                              </span>
                              <TonePill label={i.source} tone="neutral" />
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {i.context}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            {i.badge}
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">
                                {fmtDate(i.date)}
                              </div>
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
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
