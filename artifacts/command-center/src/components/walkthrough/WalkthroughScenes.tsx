import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  FolderKanban,
  CheckSquare,
  Activity,
  Lightbulb,
  BarChart3,
  ShieldCheck,
  Bell,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import ccaCrest from "@assets/cca-crest-inset_1781445846297.png";

const crestFilter =
  "hue-rotate(-32deg) saturate(1.45) drop-shadow(0 0 18px rgba(20,184,166,0.75))";

export const CHAPTERS = [
  { title: "Welcome", icon: Sparkles },
  { title: "Dashboard", icon: LayoutDashboard },
  { title: "Agencies & Comms", icon: Building2 },
  { title: "Regulatory Tracker", icon: FolderKanban },
  { title: "Tasks & Monitor", icon: CheckSquare },
  { title: "Knowledge & Insight", icon: Lightbulb },
  { title: "Wrap-up", icon: ShieldCheck },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function SceneShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0f2c] via-indigo-950 to-teal-900"
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {/* drifting glow accents */}
      <motion.div
        className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-teal-600/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </motion.div>
  );
}

function CountUp({
  to,
  duration = 1.4,
  delay = 0,
}: {
  to: number;
  duration?: number;
  delay?: number;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    let startT: number | null = null;
    const startDelay = setTimeout(() => {
      const tick = (t: number) => {
        if (startT === null) startT = t;
        const p = Math.min((t - startT) / (duration * 1000), 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay * 1000);
    return () => {
      clearTimeout(startDelay);
      cancelAnimationFrame(raf);
    };
  }, [to, duration, delay]);
  return <>{n}</>;
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

function Eyebrow({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <motion.div
      {...fadeUp(0.1)}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-200 backdrop-blur-sm"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </motion.div>
  );
}

/* ----------------------------- Scene 1: Welcome ---------------------------- */
function Welcome() {
  return (
    <SceneShell>
      <div className="flex h-full w-full flex-col items-center justify-center text-center px-8">
        <motion.div
          className="relative mb-7"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0 -m-6 rounded-full border border-teal-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 -m-12 rounded-full border border-indigo-400/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <img
            src={ccaCrest}
            alt="CCA crest"
            className="h-24 w-24 object-contain"
            style={{ filter: crestFilter }}
          />
        </motion.div>
        <motion.h1
          {...fadeUp(0.5)}
          className="text-5xl md:text-6xl font-black tracking-tight text-white"
        >
          CCA{" "}
          <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
            EmilyOS
          </span>
        </motion.h1>
        <motion.p
          {...fadeUp(0.8)}
          className="mt-4 max-w-lg text-base md:text-lg text-white/70"
        >
          Your command center for regulatory communications and compliance
          operations.
        </motion.p>
        <motion.div
          {...fadeUp(1.1)}
          className="mt-6 h-[3px] w-40 rounded-full bg-gradient-to-r from-transparent via-teal-400 to-transparent"
        />
      </div>
    </SceneShell>
  );
}

/* ---------------------------- Scene 2: Dashboard --------------------------- */
function Dashboard() {
  const kpis = [
    { label: "Active Agencies", to: 5, icon: Building2 },
    { label: "Active Projects", to: 7, icon: FolderKanban },
    { label: "Compliance Items", to: 3, icon: AlertTriangle },
  ];
  const ringPct = 86;
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <SceneShell>
      <div className="flex h-full w-full flex-col px-8 py-7 md:px-12 md:py-9">
        <Eyebrow icon={LayoutDashboard} label="Dashboard" />
        <motion.h2
          {...fadeUp(0.25)}
          className="mt-3 text-2xl md:text-3xl font-bold text-white"
        >
          Your day, at a glance
        </motion.h2>

        <div className="mt-6 grid flex-1 grid-cols-1 gap-5 md:grid-cols-3">
          <div className="md:col-span-2 grid grid-cols-3 gap-3 content-start">
            {kpis.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div
                  key={k.label}
                  {...fadeUp(0.45 + i * 0.12)}
                  className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"
                >
                  <div className="mb-3 inline-flex rounded-lg bg-teal-500/20 p-2 text-teal-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    <CountUp to={k.to} delay={0.6 + i * 0.12} />
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/50">
                    {k.label}
                  </div>
                </motion.div>
              );
            })}
            <div className="col-span-3 mt-1 space-y-2">
              {["Review NAICS reclassification", "Verify emissions inventory", "Approve route survey"].map(
                (t, i) => (
                  <motion.div
                    key={t}
                    {...fadeUp(0.9 + i * 0.14)}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    <span className="text-sm text-white/80">{t}</span>
                    <span className="ml-auto text-[11px] text-white/40">High</span>
                  </motion.div>
                )
              )}
            </div>
          </div>

          {/* compliance ring */}
          <motion.div
            {...fadeUp(0.7)}
            className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm"
          >
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: C }}
                  animate={{ strokeDashoffset: C * (1 - ringPct / 100) }}
                  transition={{ duration: 1.6, ease: EASE, delay: 0.9 }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5eead4" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">
                  <CountUp to={ringPct} delay={0.9} duration={1.6} />%
                </span>
                <span className="text-[10px] uppercase tracking-wide text-white/50">
                  Compliant
                </span>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-white/55">
              Compliance health, computed live
            </p>
          </motion.div>
        </div>
      </div>
    </SceneShell>
  );
}

/* --------------------- Scene 3: Agencies & Communications ------------------ */
function AgenciesComms() {
  const agencies = [
    "California Contractors State License Board",
    "Texas Comptroller of Public Accounts",
    "Florida Dept. of Transportation",
  ];
  const comms = [
    { icon: Mail, who: "EPA Region 5", text: "Title V permit renewal", side: "in" },
    { icon: Phone, who: "Emily Jones", text: "Logged call summary", side: "out" },
    { icon: FileText, who: "State Board", text: "Deficiency notice filed", side: "in" },
  ];
  return (
    <SceneShell>
      <div className="flex h-full w-full flex-col px-8 py-7 md:px-12 md:py-9">
        <Eyebrow icon={Building2} label="Agencies & Communications" />
        <motion.h2
          {...fadeUp(0.25)}
          className="mt-3 text-2xl md:text-3xl font-bold text-white"
        >
          Every regulator, every exchange
        </motion.h2>
        <div className="mt-6 grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Agency Directory
            </p>
            {agencies.map((a, i) => (
              <motion.div
                key={a}
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.4 + i * 0.16 }}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-3"
              >
                <div className="rounded-md bg-teal-500/20 p-2 text-teal-200">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-sm leading-snug text-white/85">{a}</span>
              </motion.div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Communications Hub
            </p>
            {comms.map((c, i) => {
              const Icon = c.icon;
              const out = c.side === "out";
              return (
                <motion.div
                  key={c.text}
                  initial={{ opacity: 0, x: out ? 28 : -28, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.6 + i * 0.22 }}
                  className={`flex max-w-[88%] items-start gap-2.5 rounded-xl border px-3 py-2.5 ${
                    out
                      ? "ml-auto border-teal-400/30 bg-teal-500/20"
                      : "border-white/10 bg-white/[0.05]"
                  }`}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
                  <div>
                    <p className="text-[11px] font-semibold text-white/55">{c.who}</p>
                    <p className="text-sm text-white/85">{c.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ----------------------- Scene 4: Regulatory Tracker ---------------------- */
function RegulatoryTracker() {
  const stages = ["Intake", "In Review", "Deficiency", "Resolved"];
  return (
    <SceneShell>
      <div className="flex h-full w-full flex-col px-8 py-7 md:px-12 md:py-9">
        <Eyebrow icon={FolderKanban} label="Regulatory Tracker" />
        <motion.h2
          {...fadeUp(0.25)}
          className="mt-3 text-2xl md:text-3xl font-bold text-white"
        >
          Follow every matter, end to end
        </motion.h2>

        <div className="mt-10 flex flex-1 flex-col justify-center">
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 h-[3px] bg-white/10" />
            <motion.div
              className="absolute left-0 top-5 h-[3px] rounded-full bg-gradient-to-r from-teal-400 to-cyan-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: EASE, delay: 0.5 }}
            />
            <div className="relative flex justify-between">
              {stages.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.6 + i * 0.45 }}
                  className="flex flex-col items-center"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-400 bg-[#0a0f2c] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="mt-2 text-xs font-medium text-white/75">{s}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { icon: AlertTriangle, t: "2 open deficiencies", d: "Flagged for response" },
              { icon: Clock, t: "Deadline in 3 days", d: "Title V annual report" },
              { icon: ShieldCheck, t: "1 escalation routed", d: "Awaiting decision" },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.t}
                  {...fadeUp(1.4 + i * 0.18)}
                  className="rounded-xl border border-white/10 bg-white/[0.05] p-4"
                >
                  <Icon className="mb-2 h-5 w-5 text-teal-300" />
                  <p className="text-sm font-semibold text-white">{c.t}</p>
                  <p className="text-xs text-white/50">{c.d}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* --------------------- Scene 5: Tasks & Change Monitor -------------------- */
function TasksMonitor() {
  const tasks = [
    "Send route survey follow-up",
    "Approve emissions filing",
    "Confirm NAICS reclassification",
  ];
  return (
    <SceneShell>
      <div className="flex h-full w-full flex-col px-8 py-7 md:px-12 md:py-9">
        <Eyebrow icon={CheckSquare} label="Tasks & Change Monitor" />
        <motion.h2
          {...fadeUp(0.25)}
          className="mt-3 text-2xl md:text-3xl font-bold text-white"
        >
          Route follow-ups, catch every change
        </motion.h2>
        <div className="mt-6 grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Tasks & Approvals
            </p>
            {tasks.map((t, i) => (
              <motion.div
                key={t}
                {...fadeUp(0.45 + i * 0.18)}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-3"
              >
                <motion.span
                  className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-500/30 text-teal-200"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.9 + i * 0.3 }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.span>
                <span className="text-sm text-white/85">{t}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Change Monitor
            </p>
            <motion.div
              {...fadeUp(0.7)}
              className="relative rounded-2xl border border-teal-400/30 bg-teal-500/15 p-5"
            >
              <span className="absolute right-4 top-4 flex h-3 w-3">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-teal-400"
                  animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-300" />
              </span>
              <div className="mb-3 inline-flex rounded-lg bg-white/10 p-2 text-violet-100">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-base font-bold text-white">New regulation detected</p>
              <p className="mt-1 text-sm text-white/70">
                EPA emissions inventory format updated — review required.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-violet-100">
                <Activity className="h-3.5 w-3.5" />
                Flagged moments ago
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ------------------- Scene 6: Knowledge & Intelligence -------------------- */
function KnowledgeInsight() {
  const bars = [48, 72, 60, 88, 66];
  return (
    <SceneShell>
      <div className="flex h-full w-full flex-col px-8 py-7 md:px-12 md:py-9">
        <Eyebrow icon={Lightbulb} label="Knowledge & Intelligence" />
        <motion.h2
          {...fadeUp(0.25)}
          className="mt-3 text-2xl md:text-3xl font-bold text-white"
        >
          Turn activity into insight
        </motion.h2>
        <div className="mt-6 grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            {...fadeUp(0.45)}
            className="flex flex-col rounded-xl border border-white/10 bg-white/[0.06] p-5"
          >
            <div className="mb-1 flex items-center gap-2 text-white/70">
              <BarChart3 className="h-4 w-4 text-teal-300" />
              <span className="text-sm font-semibold">Reports & Analytics</span>
            </div>
            <div className="flex flex-1 items-end justify-between gap-3 pt-4">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="w-full rounded-t-md bg-gradient-to-t from-teal-600 to-cyan-400"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.6 + i * 0.12 }}
                />
              ))}
            </div>
          </motion.div>
          <div className="space-y-3">
            {[
              { t: "Response times improved 18%", d: "Across all agencies this quarter" },
              { t: "3 recurring deficiency themes", d: "Surfaced from your history" },
              { t: "Knowledge base: 42 entries", d: "Institutional memory, searchable" },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                {...fadeUp(0.8 + i * 0.2)}
                className="rounded-xl border border-white/10 bg-white/[0.05] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-teal-500/20 p-2 text-teal-200">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.t}</p>
                    <p className="text-xs text-white/50">{c.d}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ---------------------------- Scene 7: Outro ----------------------------- */
function Outro() {
  return (
    <SceneShell>
      <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
        <motion.div
          {...fadeUp(0.2)}
          className="mb-6 flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm"
        >
          <ShieldCheck className="h-4 w-4 text-teal-300" />
          Communication, follow-up &amp; documentation — not legal advice
        </motion.div>
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
        >
          <img
            src={ccaCrest}
            alt="CCA crest"
            className="h-16 w-16 object-contain"
            style={{ filter: crestFilter }}
          />
        </motion.div>
        <motion.h2
          {...fadeUp(0.6)}
          className="text-4xl md:text-5xl font-black tracking-tight text-white"
        >
          Powered by clarity.
        </motion.h2>
        <motion.h2
          {...fadeUp(0.85)}
          className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent"
        >
          Driven by compliance.
        </motion.h2>
        <motion.p {...fadeUp(1.15)} className="mt-5 text-sm uppercase tracking-[0.3em] text-white/50">
          CCA EmilyOS
        </motion.p>
      </div>
    </SceneShell>
  );
}

export function WalkthroughScene({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <Welcome />;
    case 1:
      return <Dashboard />;
    case 2:
      return <AgenciesComms />;
    case 3:
      return <RegulatoryTracker />;
    case 4:
      return <TasksMonitor />;
    case 5:
      return <KnowledgeInsight />;
    case 6:
      return <Outro />;
    default:
      return <Welcome />;
  }
}
