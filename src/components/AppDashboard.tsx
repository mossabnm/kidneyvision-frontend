/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { 
  ShieldCheck, FileText, Sparkles, TrendingUp, AlertTriangle, 
  CheckCircle2, Loader2, Database, ShieldAlert, ArrowRight
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
        <span className="font-sans text-xs text-[#737686] font-medium">Loading clinical indicators from database...</span>
      </div>
    );
  }

  const hasData = stats.totalScans > 0;
  const normalPercent = hasData ? Math.round((stats.normalCount / stats.totalScans) * 100) : 0;
  const stonePercent = hasData ? Math.round((stats.stoneCount / stats.totalScans) * 100) : 0;

  return (
    <div className="space-y-6 text-left">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-[#131b2e] tracking-tight">Clinical Dashboard</h1>
          <p className="font-sans text-xs text-[#434655]">
            Acoustic imaging performance and real-time neural network detection triage metrics.
          </p>
        </div>
        <Link
          to="/analysis"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          New Ultrasound Scan
        </Link>
      </div>

      {/* Empty State Banner (Displayed when database has 0 analyses) */}
      {!hasData && (
        <div className="bg-[#eff6ff] border border-[#2563eb]/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-bold text-[#131b2e]">No analyses yet</h3>
              <p className="font-sans text-xs text-[#434655] mt-0.5">
                Upload your first kidney ultrasound to begin analysis and unlock real-time clinical telemetry.
              </p>
            </div>
          </div>
          <Link
            to="/analysis"
            className="px-4 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            Upload First Scan
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Numerical Indicators Grid (All real values from database) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Scans */}
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
            {!hasData ? (
              <span className="text-[10px] text-[#737686] font-sans font-medium mt-1 inline-block">
                No scans recorded yet
              </span>
            ) : stats.monthGrowthPercentage !== null ? (
              <span className={`text-[10px] font-sans font-medium mt-1 inline-block ${
                stats.monthGrowthPercentage >= 0 ? "text-emerald-600" : "text-amber-600"
              }`}>
                {stats.monthGrowthPercentage >= 0 ? `+${stats.monthGrowthPercentage}%` : `${stats.monthGrowthPercentage}%`} vs previous month
              </span>
            ) : (
              <span className="text-[10px] text-[#2563eb] font-sans font-medium mt-1 inline-block">
                {stats.currentMonthCount} scan{stats.currentMonthCount !== 1 ? 's' : ''} this month
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Kidney Stone Results */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Kidney Stone Results</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-sans text-2xl font-black text-[#131b2e] leading-none">
              {stats.stoneCount.toLocaleString()}
            </h3>
            <span className="text-[10px] text-[#737686] font-sans mt-1 inline-block">
              {hasData ? `${stonePercent}% detection prevalence (${stats.stoneCount} of ${stats.totalScans})` : "0% positive detections"}
            </span>
          </div>
        </div>

        {/* Card 3: Normal Results */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Normal Findings</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-sans text-2xl font-black text-[#131b2e] leading-none">
              {stats.normalCount.toLocaleString()}
            </h3>
            <span className="text-[10px] text-teal-600 font-sans font-medium mt-1 inline-block">
              {hasData ? `${normalPercent}% of total scans (${stats.normalCount} of ${stats.totalScans})` : "0% normal scans"}
            </span>
          </div>
        </div>

        {/* Card 4: Detection Statistics / Average Confidence */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Detection Confidence</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#2563eb]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-sans text-2xl font-black text-[#131b2e] leading-none">
              {hasData && stats.accuracyRate > 0 ? `${stats.accuracyRate}%` : "N/A"}
            </h3>
            <span className="text-[10px] text-[#737686] font-sans mt-1 inline-block">
              {stats.pendingReviews > 0
                ? `${stats.pendingReviews} scan${stats.pendingReviews !== 1 ? 's' : ''} under clinical review`
                : hasData
                ? "Mean AI validation confidence"
                : "Awaiting first ultrasound analysis"}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Diagnostic Charts Side-By-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Bar Chart */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-sans text-sm font-bold text-[#131b2e]">Scan History Workload Trends</h4>
            <p className="font-sans text-[11px] text-[#737686]">Active clinical scans grouped by findings by month</p>
          </div>
          
          {stats.scansByMonth && stats.scansByMonth.length > 0 ? (
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
                  <Bar dataKey="normals" name="Normal Renal Parenchyma" fill="#0d9488" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="anomalies" name="Kidney Stone Detected" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full mt-2 flex flex-col items-center justify-center text-center p-6 bg-[#faf8ff] rounded-lg border border-dashed border-[#c3c6d7]">
              <div className="w-12 h-12 rounded-full bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h5 className="font-sans text-xs font-bold text-[#131b2e]">No monthly scan trends yet</h5>
              <p className="font-sans text-[11px] text-[#737686] max-w-sm mt-1">
                Monthly workload and condition trends will aggregate here automatically as renal ultrasound scans are analyzed.
              </p>
            </div>
          )}
        </div>

        {/* Pathology classification Pie Chart */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-sans text-sm font-bold text-[#131b2e]">Kidney Stone / Renal Parenchyma Distribution</h4>
            <p className="font-sans text-[11px] text-[#737686]">Proportions of diagnosed classes in database</p>
          </div>

          {hasData && (stats.conditionDistribution || stats.cystDistribution)?.length > 0 ? (
            <>
              <div className="h-56 w-full flex items-center justify-center mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.conditionDistribution || stats.cystDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(stats.conditionDistribution || stats.cystDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#283044", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend details */}
              <div className="space-y-1.5 mt-2">
                {(stats.conditionDistribution || stats.cystDistribution).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center text-[10.5px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="truncate text-[#434655] font-sans font-medium">{entry.name}</span>
                    </div>
                    <span className="font-sans font-bold text-[#131b2e] ml-2 shrink-0">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-56 w-full flex flex-col items-center justify-center text-center p-6 bg-[#faf8ff] rounded-lg border border-dashed border-[#c3c6d7] mt-2">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h5 className="font-sans text-xs font-bold text-[#131b2e]">No pathology distributions</h5>
              <p className="font-sans text-[11px] text-[#737686] max-w-xs mt-1">
                Normal vs. Kidney Stone proportions will calculate as scans are processed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended radiology standards advice of the week */}
      <div className="bg-[#eaedff] border border-[#2563eb]/20 rounded-xl p-4 flex gap-3">
        <Sparkles className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
        <div>
          <h5 className="font-sans text-xs font-bold text-[#2563eb]">Clinical Radiologist Tip (Kidney Stone vs. Parenchyma Evaluation)</h5>
          <p className="font-sans text-[11px] text-[#434655] mt-1 leading-relaxed">
            Ensure proper gain and acoustic focus positioning when evaluating renal parenchyma sweeps. Distinct posterior acoustic shadowing and hyperechoic foci indicate nephrolithiasis (kidney stones). Compare with previous scans in the History &amp; Reports triage records.
          </p>
        </div>
      </div>
    </div>
  );
}
