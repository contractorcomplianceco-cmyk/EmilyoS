import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TonePill } from "@/components/shared/Badges";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Smartphone,
  Monitor,
  LogOut,
  SlidersHorizontal,
  Bell,
} from "lucide-react";

const SESSIONS = [
  { id: "s1", device: "MacBook Pro · Chrome", location: "Chicago, IL", lastActive: "Active now", current: true },
  { id: "s2", device: "iPhone 15 · Safari", location: "Chicago, IL", lastActive: "2 hours ago", current: false },
  { id: "s3", device: "Windows 11 · Edge", location: "Springfield, IL", lastActive: "Yesterday", current: false },
];

const NOTIFICATIONS = [
  { key: "deadlines", label: "Deadline reminders", desc: "Upcoming filing and follow-up dates", on: true },
  { key: "deficiencies", label: "New deficiencies", desc: "When an agency issues a deficiency", on: true },
  { key: "escalations", label: "Escalation updates", desc: "Status changes on escalated matters", on: true },
  { key: "changes", label: "Regulatory changes", desc: "Change monitor alerts", on: false },
  { key: "digest", label: "Weekly digest", desc: "Monday summary email", on: true },
  { key: "mentions", label: "Team mentions", desc: "When a teammate tags you", on: false },
];

export default function AccountSettings() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState(SESSIONS);
  const [twoFactor, setTwoFactor] = useState(true);
  const [notifs, setNotifs] = useState(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.on])),
  );
  const [language, setLanguage] = useState("en-US");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [density, setDensity] = useState("comfortable");
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const notify = (title: string) => toast({ title, description: "Preference saved." });

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Account</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Manage your sign-in, security, preferences, and notifications for this app.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => notify("Signed out")}
            className="self-start border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sign-in & security */}
        <Card className="lg:col-span-2 overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              Sign-in &amp; Security
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Login Email</p>
                  <p className="text-sm text-slate-500">emily.jones@cca.com</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => notify("Email change requested")}>
                Update
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Password</p>
                  <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => notify("Password change started")}>
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">
                    Authenticator app {twoFactor ? "enabled" : "disabled"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TonePill label={twoFactor ? "Enabled" : "Disabled"} tone={twoFactor ? "green" : "amber"} />
                <Switch
                  checked={twoFactor}
                  onCheckedChange={(v) => {
                    setTwoFactor(v);
                    notify(v ? "Two-factor enabled" : "Two-factor disabled");
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md self-start">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
              Preferences
            </h3>
          </div>
          <div className="space-y-5 p-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Language</label>
              <Select value={language} onValueChange={(v) => { setLanguage(v); notify("Language updated"); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                  <SelectItem value="fr-FR">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Time Zone</label>
              <Select value={timezone} onValueChange={(v) => { setTimezone(v); notify("Time zone updated"); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Chicago">Central (Chicago)</SelectItem>
                  <SelectItem value="America/New_York">Eastern (New York)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (Denver)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (Los Angeles)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Dashboard Density</label>
              <Select value={density} onValueChange={(v) => { setDensity(v); notify("Density updated"); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="cozy">Cozy</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-sm font-medium text-slate-700">Compact sidebar</p>
                <p className="text-xs text-slate-400">Collapse labels by default</p>
              </div>
              <Switch checked={compactSidebar} onCheckedChange={setCompactSidebar} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Reduce motion</p>
                <p className="text-xs text-slate-400">Minimize animations</p>
              </div>
              <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active sessions */}
        <Card className="lg:col-span-2 overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
              Active Sessions
            </h3>
            <span className="text-sm font-medium text-slate-500">{sessions.length} devices</span>
          </div>
          <div className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{s.device}</p>
                      {s.current && <TonePill label="This device" tone="blue" />}
                    </div>
                    <p className="text-sm text-slate-500">
                      {s.location} · {s.lastActive}
                    </p>
                  </div>
                </div>
                {!s.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSessions((prev) => prev.filter((x) => x.id !== s.id));
                      notify("Session signed out");
                    }}
                  >
                    Sign out
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Notification preferences */}
        <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md self-start">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
              Notifications
            </h3>
            <Bell className="h-4 w-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {NOTIFICATIONS.map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700">{n.label}</p>
                  <p className="text-xs text-slate-400">{n.desc}</p>
                </div>
                <Switch
                  checked={notifs[n.key]}
                  onCheckedChange={(v) => setNotifs((prev) => ({ ...prev, [n.key]: v }))}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-5 py-4">
        <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-sm text-slate-500">
          These are your personal app settings. Employment, payroll, and benefits records are managed
          separately under Employee Profile and My Benefits.
        </p>
      </div>
    </div>
  );
}
