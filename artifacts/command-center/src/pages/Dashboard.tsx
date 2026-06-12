import { Link } from "wouter";
import {
  FolderKanban,
  AlertTriangle,
  Siren,
  CalendarClock,
  ArrowRight,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  RiskBadge,
  MatterStatusBadge,
  EscalationStatusBadge,
} from "@/components/shared/Badges";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDatabase } from "@/lib/store";
import { agencyName } from "@/lib/lookups";
import {
  fmtDate,
  daysUntil,
  isOverdue,
  isDueToday,
} from "@/lib/format";
import {
  OPEN_MATTER_STATUSES,
  OPEN_DEFICIENCY_STATUSES,
  OPEN_ESCALATION_STATUSES,
} from "@/lib/types";
import type { Matter } from "@/lib/types";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  tone: string;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="flex items-start justify-between p-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function dueLabel(value?: string | null): { text: string; tone: string } {
  const n = daysUntil(value);
  if (n === null) return { text: "No date", tone: "text-muted-foreground" };
  if (isOverdue(value))
    return { text: `${Math.abs(n)}d overdue`, tone: "text-red-600 font-medium" };
  if (isDueToday(value)) return { text: "Due today", tone: "text-amber-600 font-medium" };
  return { text: `in ${n}d`, tone: "text-muted-foreground" };
}

export default function Dashboard() {
  const db = useDatabase();

  const openMatters = db.matters.filter((m) =>
    OPEN_MATTER_STATUSES.includes(m.currentStatus),
  );
  const openDeficiencies = db.deficiencies.filter((d) =>
    OPEN_DEFICIENCY_STATUSES.includes(d.status),
  );
  const openEscalations = db.escalations.filter((e) =>
    OPEN_ESCALATION_STATUSES.includes(e.status),
  );

  const followUps = db.matters
    .filter((m) => m.nextFollowUpDate && OPEN_MATTER_STATUSES.includes(m.currentStatus))
    .sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate));

  const dueSoon = followUps.filter(
    (m) => isOverdue(m.nextFollowUpDate) || (daysUntil(m.nextFollowUpDate) ?? 99) <= 7,
  );

  const attention = [...openMatters]
    .filter(
      (m) =>
        m.priorityRiskLevel === "Critical" ||
        m.priorityRiskLevel === "High" ||
        isOverdue(m.nextFollowUpDate),
    )
    .sort((a, b) => {
      const rank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return rank[a.priorityRiskLevel] - rank[b.priorityRiskLevel];
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational overview of regulatory matters, deficiencies, escalations, and follow-ups."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open Matters"
          value={openMatters.length}
          hint={`${db.matters.length} total tracked`}
          icon={FolderKanban}
          href="/matters"
          tone="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Open Deficiencies"
          value={openDeficiencies.length}
          hint="Agency requests awaiting response"
          icon={AlertTriangle}
          href="/deficiencies"
          tone="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Active Escalations"
          value={openEscalations.length}
          hint="Routed for review or decision"
          icon={Siren}
          href="/escalations"
          tone="bg-red-50 text-red-700"
        />
        <StatCard
          label="Follow-Ups Due (7d)"
          value={dueSoon.length}
          hint="Includes overdue items"
          icon={CalendarClock}
          href="/calendar"
          tone="bg-violet-50 text-violet-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Matters Needing Attention</CardTitle>
            <Link href="/matters">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent>
            {attention.length === 0 ? (
              <EmptyState
                title="Nothing urgent"
                description="No high-risk or overdue matters right now."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matter</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Follow-Up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attention.map((m: Matter) => {
                    const due = dueLabel(m.nextFollowUpDate);
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <Link href="/matters">
                            <span className="cursor-pointer font-medium text-foreground hover:underline">
                              {m.title}
                            </span>
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {m.clientOrCompanyName}
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
                        <TableCell className={`text-right text-xs ${due.tone}`}>
                          {due.text}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Active Escalations</CardTitle>
            <Link href="/escalations">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {openEscalations.length === 0 ? (
              <EmptyState title="No active escalations" />
            ) : (
              openEscalations.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="rounded-md border p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {e.reasonForEscalation}
                    </span>
                    <EscalationStatusBadge value={e.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {e.summary}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due {fmtDate(e.dueDate)} · {e.assignedReviewer || "Unassigned"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming Follow-Ups</CardTitle>
          <Link href="/calendar">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Open calendar <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </CardHeader>
        <CardContent>
          {followUps.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No scheduled follow-ups"
              description="Follow-up dates set on open matters will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Matter</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followUps.slice(0, 8).map((m) => {
                  const due = dueLabel(m.nextFollowUpDate);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">
                        {fmtDate(m.nextFollowUpDate)}
                      </TableCell>
                      <TableCell className="font-medium">{m.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {agencyName(db, m.agencyId)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.internalOwner || "—"}
                      </TableCell>
                      <TableCell className={`text-right text-xs ${due.tone}`}>
                        {due.text}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
