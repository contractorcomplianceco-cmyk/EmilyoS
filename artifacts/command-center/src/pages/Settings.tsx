import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resetData, useDatabase } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, Bell, Shield, User, Palette, Settings as SettingsIcon, Database } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const db = useDatabase();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data to default demo state? This cannot be undone.")) {
      resetData();
      toast({
        title: "Data Reset",
        description: "All application data has been restored to default demo state.",
      });
    }
  };

  const totalRecords = 
    db.agencies.length + 
    db.matters.length + 
    db.deficiencies.length + 
    db.communications.length + 
    db.tasks.length + 
    db.alerts.length +
    db.escalations.length +
    db.sops.length +
    db.knowledge.length;

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <SettingsIcon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings & Preferences</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Manage your account settings, notification preferences, and system data.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
                Profile Details
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" disabled value="Emily Jones" className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-600 shadow-inner" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input type="text" disabled value="emily.jones@cca.com" className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-600 shadow-inner" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role / Title</label>
                  <input type="text" disabled value="Director of Compliance & Regulatory Communications" className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-600 shadow-inner" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
                Notifications
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Email Alerts for Overdue Items</p>
                    <p className="text-xs text-slate-500 mt-0.5">Receive a daily summary of overdue tasks and deficiencies.</p>
                  </div>
                  <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">New Regulatory Changes</p>
                    <p className="text-xs text-slate-500 mt-0.5">Immediate notification when a new critical regulatory alert is posted.</p>
                  </div>
                  <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Weekly Performance Report</p>
                    <p className="text-xs text-slate-500 mt-0.5">Receive an automated analytics report every Monday morning.</p>
                  </div>
                  <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer shadow-inner border border-slate-300">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
                System Data
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Local DB Records</p>
                  <p className="text-2xl font-bold text-slate-800">{totalRecords}</p>
                </div>
                <Database className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Resetting data will clear all local changes and restore the application to its original demonstration state with seeded agencies, matters, and alerts.
              </p>
              <Button variant="destructive" className="w-full gap-2 shadow-lg" onClick={handleReset}>
                <RefreshCcw className="w-4 h-4" />
                Reset Demo Data
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden border-white/20 bg-primary/5 shadow-sm backdrop-blur-md">
             <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-5 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
                Appearance
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                EmilyOS is currently configured to use the high-contrast enterprise theme. Dark mode toggle is disabled by system administrator policy.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
