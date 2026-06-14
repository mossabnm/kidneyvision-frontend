/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { 
  Activity, ShieldCheck, FileText, Sparkles, TrendingUp, AlertTriangle, 
  HelpCircle, CheckCircle2, Loader2, Database, ShieldAlert
} from "lucide-react";
import { getStatistics } from "../services/api";
import { DashboardStats } from "../types";

export default function AppDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStatistics();
        setStats(data);
      } catch (e) {
        console.error("Failed to load clinical stats dashboard", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin mb-2" />
        <span className="font-sans text-xs text-[#737686] font-medium">Re-calculating clinical indicators...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Title block */}
      <div>
        <h1 className="font-sans text-2xl font-bold text-[#131b2e] tracking-tight">Clinical Dashboard</h1>
        <p className="font-sans text-xs text-[#434655]">
          Acoustic imaging performance and real-time neural network detection triage metrics.
        </p>
      </div>

      {/* Numerical Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans Card */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Total Scans</span>
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb]">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-sans text-2xl font-black text-[#131b2e] leading-none">
              {stats.totalScans.toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-600 font-sans font-medium mt-1 inline-block">
              +14.2% from previous month
            </span>
          </div>
        </div>

        {/* Anomaly Rate Card */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Anomaly Prevalence</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-sans text-2xl font-black text-[#131b2e] leading-none">
              {stats.anomalyRate}%
            </h3>
            <span className="text-[10px] text-[#737686] font-sans mt-1 inline-block">
              Consistent with clinical Bosniak guidelines
            </span>
          </div>
        </div>

        {/* Pending Reviews Card */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Pending Peer Checks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-sans text-2xl font-black text-[#131b2e] leading-none">
              {stats.pendingReviews}
            </h3>
            <span className="text-[10px] text-[#737686] font-sans mt-1 inline-block">
              Requires secondary radiology check
            </span>
          </div>
        </div>

        {/* Accuracy Rate Card */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737686]">AI Validation Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-sans text-2xl font-black text-[#131b2e] leading-none">
              {stats.accuracyRate}%
            </h3>
            <span className="text-[10px] text-teal-600 font-sans font-medium mt-1 inline-block">
              99.2% expected under multi-layered checks
            </span>
          </div>
        </div>
      </div>

      {/* Visual Diagnostic Charts Side-By-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Bar Chart */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-sans text-sm font-bold text-[#131b2e]">Scan History workload trends</h4>
            <p className="font-sans text-[11px] text-[#737686]">Active clinical scans grouped by findings during 2026</p>
          </div>
          
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.scansByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#737686" }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#737686" }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#283044", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                <Bar dataKey="normals" name="Normal scan slices" fill="#64748b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="anomalies" name="Anomaly detected slices" fill="#2563eb" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pathology classification Pie Chart */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-sans text-sm font-bold text-[#131b2e]">Bosniak Cyst Distribution</h4>
            <p className="font-sans text-[11px] text-[#737686]">Proportions of diagnosed classes in database</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.cystDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.cystDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#283044", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Simple legend details */}
          <div className="space-y-1.5 mt-2">
            {stats.cystDistribution.map((entry, index) => (
              <div key={index} className="flex justify-between items-center text-[10.5px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate text-[#434655] font-sans font-medium">{entry.name}</span>
                </div>
                <span className="font-sans font-bold text-[#131b2e] ml-2 shrink-0">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended radiology standards advice of the week */}
      <div className="bg-[#eaedff] border border-[#2563eb]/20 rounded-xl p-4 flex gap-3">
        <Sparkles className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
        <div>
          <h5 className="font-sans text-xs font-bold text-[#2563eb]">Clinical Radiologist Tip (Bosniak Classification Scheme)</h5>
          <p className="font-sans text-[11px] text-[#434655] mt-1 leading-relaxed">
            Please make sure color Doppler flow controls are configured to standard thresholds when taking renal ultrasound sweeps. Thickening of septa values above 2.0mm can trigger immediate Complex Cyst Level-III anomalies inside KidneyVision AI engines. Compare with historic scans via the Triage logs.
          </p>
        </div>
      </div>
    </div>
  );
}
