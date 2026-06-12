import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
import { useDatabase } from "@/lib/store";
import { isOverdue } from "@/lib/format";
import {
  OPEN_MATTER_STATUSES,
  OPEN_DEFICIENCY_STATUSES,
  OPEN_ESCALATION_STATUSES,
  RISK_LEVELS,
} from "@/lib/types";

const RISK_COLORS: Record<string, string> = {
  Low: "#94a3b8",
  Medium: "#3b82f6",
  High: "#f59e0b",
  Critical: "#ef4444",
};

function StatTile({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
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
  const overdueFollowUps = db.matters.filter(
    (m) =>
      OPEN_MATTER_STATUSES.includes(m.currentStatus) && isOverdue(m.nextFollowUpDate),
  );

  const byStatus = useMemo(() => {
    const counts = new Map<string, number>();
    db.matters.forEach((m) =>
      counts.set(m.currentStatus, (counts.get(m.currentStatus) ?? 0) + 1),
    );
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [db.matters]);

  const byRisk = useMemo(() => {
    return RISK_LEVELS.map((r) => ({
      name: r,
      value: db.matters.filter((m) => m.priorityRiskLevel === r).length,
    })).filter((d) => d.value > 0);
  }, [db.matters]);

  const byAgency = useMemo(() => {
    return db.agencies
      .map((a) => ({
        name: a.name.replace(/^(California|Texas|Florida|Delaware|US |City of )/, "").slice(0, 18),
        Open: db.matters.filter(
          (m) => m.agencyId === a.id && OPEN_MATTER_STATUSES.includes(m.currentStatus),
        ).length,
        Total: db.matters.filter((m) => m.agencyId === a.id).length,
      }))
      .filter((d) => d.Total > 0)
      .sort((a, b) => b.Total - a.Total);
  }, [db.agencies, db.matters]);

  const workload = useMemo(() => {
    const counts = new Map<string, { open: number; total: number }>();
    db.matters.forEach((m) => {
      const owner = m.internalOwner || "Unassigned";
      const cur = counts.get(owner) ?? { open: 0, total: 0 };
      cur.total += 1;
      if (OPEN_MATTER_STATUSES.includes(m.currentStatus)) cur.open += 1;
      counts.set(owner, cur);
    });
    return Array.from(counts.entries())
      .map(([owner, v]) => ({ owner, ...v }))
      .sort((a, b) => b.open - a.open);
  }, [db.matters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting"
        description="Operational metrics across matters, risk, agencies, and team workload. Figures reflect current tracked records."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Open Matters" value={openMatters.length} hint={`${db.matters.length} total`} />
        <StatTile label="Open Deficiencies" value={openDeficiencies.length} hint={`${db.deficiencies.length} total`} />
        <StatTile label="Active Escalations" value={openEscalations.length} hint={`${db.escalations.length} total`} />
        <StatTile label="Overdue Follow-Ups" value={overdueFollowUps.length} hint="On open matters" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Matters by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byStatus} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  stroke="#94a3b8"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" name="Matters" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matters by Risk</CardTitle>
          </CardHeader>
          <CardContent>
            {byRisk.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byRisk}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e) => `${e.name}: ${e.value}`}
                    labelLine={false}
                    fontSize={11}
                    isAnimationActive={false}
                  >
                    {byRisk.map((d) => (
                      <Cell key={d.name} fill={RISK_COLORS[d.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matters by Agency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byAgency} margin={{ left: -10, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={70}
                interval={0}
                stroke="#94a3b8"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Open" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Total" fill="#1e293b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Workload</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Internal Owner</TableHead>
                <TableHead className="text-right">Open Matters</TableHead>
                <TableHead className="text-right">Total Matters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workload.map((w) => (
                <TableRow key={w.owner}>
                  <TableCell className="font-medium">{w.owner}</TableCell>
                  <TableCell className="text-right">{w.open}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{w.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
