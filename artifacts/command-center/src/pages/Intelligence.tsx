import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { useDatabase } from "@/lib/store";
import { Lightbulb, TrendingUp, AlertTriangle, Activity } from "lucide-react";

export default function Intelligence() {
  const db = useDatabase();
  
  const activeMatters = db.matters.filter(m => !["Closed", "Approved / Completed"].includes(m.currentStatus)).length;
  const overdueDeficiencies = db.deficiencies.filter(d => !["Resolved", "Submitted to Agency"].includes(d.status)).length;
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Intelligence & Insights" 
        description="AI-driven observations, agency processing trends, and risk forecasts based on recent activities."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/60 backdrop-blur-sm border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Agency Processing Trends</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm font-medium text-slate-800 mb-1">Texas Comptroller</p>
              <p className="text-sm text-slate-600 leading-relaxed">Processing times for Sales Tax Permit reviews have increased by 15% over the last 30 days. Recommend adding +7 days to internal SLAs.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm font-medium text-slate-800 mb-1">California CSLB</p>
              <p className="text-sm text-slate-600 leading-relaxed">New applications are showing a high rate of surety bond formatting inquiries. Consider proactive review of all submitted bonds.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/60 backdrop-blur-sm border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Risk Forecast</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100/50">
              <p className="text-sm font-medium text-slate-800 mb-1">Upcoming Deadlines Risk</p>
              <p className="text-sm text-slate-600 leading-relaxed">There are {activeMatters} active matters, and {overdueDeficiencies} unresolved deficiencies. Capacity constraint likely next week.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm font-medium text-slate-800 mb-1">Communication Gaps</p>
              <p className="text-sm text-slate-600 leading-relaxed">3 active matters have not had recorded communications in over 14 days. Recommend automated follow-up scheduling.</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 md:col-span-2 bg-white/60 backdrop-blur-sm border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Recommended Workflow Improvements</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
              <Activity className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">Consider creating a specialized SOP for EPA Title V Air Permit Annual Reports, as they frequently trigger formatting deficiencies.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
              <Activity className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">Standardize the "Waiting on Client" follow-up cadence to reduce stall times on client-dependent actions.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}