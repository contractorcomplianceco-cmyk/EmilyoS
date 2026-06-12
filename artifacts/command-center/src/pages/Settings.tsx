import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resetData } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, Bell, Shield, User, Palette } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data to default demo state? This cannot be undone.")) {
      resetData();
      toast({
        title: "Data Reset",
        description: "All application data has been restored to default demo state.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings & Preferences" 
        description="Manage your account settings, notification preferences, and system data."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-md">
                <User className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Profile Details</h3>
            </div>
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" disabled value="Emily Jones" className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="text" disabled value="emily.jones@cca.com" className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role / Title</label>
                <input type="text" disabled value="Director of Compliance & Regulatory Communications" className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-md">
                <Bell className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">Email Alerts for Overdue Items</p>
                  <p className="text-xs text-slate-500">Receive a daily summary of overdue tasks and deficiencies.</p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">New Regulatory Changes</p>
                  <p className="text-xs text-slate-500">Immediate notification when a new critical regulatory alert is posted.</p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">Weekly Performance Report</p>
                  <p className="text-xs text-slate-500">Receive an automated analytics report every Monday morning.</p>
                </div>
                <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-destructive/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-destructive/10 rounded-md">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">System Data</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Resetting data will clear all local changes and restore the application to its original demonstration state with seeded agencies, matters, and alerts.
            </p>
            <Button variant="destructive" className="w-full gap-2" onClick={handleReset}>
              <RefreshCcw className="w-4 h-4" />
              Reset Demo Data
            </Button>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20 backdrop-blur-sm">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Appearance</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              EmilyOS is currently configured to use the high-contrast enterprise theme. Dark mode toggle is disabled by system administrator policy.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}