/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Search, Calendar, Filter, Eye, Trash2, Sliders, X, 
  ChevronRight, ChevronLeft, Loader2, Award, ClipboardCheck, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";
import { getAnalyses, deleteAnalysis, downloadReport } from "../services/api";
import { KidneyAnalysis, DiagnosisResult } from "../types";
import LoadingSkeleton from "./common/LoadingSkeleton";

export default function AppHistory() {
  const [analyses, setAnalyses] = useState<KidneyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Results");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  
  const [selectedAnalysis, setSelectedAnalysis] = useState<KidneyAnalysis | null>(null);
  const [gradCamOverlay, setGradCamOverlay] = useState(true);
  const [submittingNote, setSubmittingNote] = useState(false);

  async function loadAnalyses(page: number) {
    setLoading(true);
    try {
      const response = await getAnalyses(page, 10);
      setAnalyses(response.data);
      setMeta(response.meta);
      setCurrentPage(response.meta.current_page);
    } catch (e) {
      console.error("Could not fetch clinical history", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalyses(currentPage);
  }, [currentPage]);

  // Handle Deletion (DELETE /analyses/:id)
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details modal drawer
    if (confirm(`Are you sure you want to delete patient record ${id}?`)) {
      try {
        await deleteAnalysis(id);
        setAnalyses(prev => prev.filter(x => x.id !== id));
        if (selectedAnalysis?.id === id) {
          setSelectedAnalysis(null);
        }
      } catch (e) {
        alert("Deletion failed inside clinical portal secure core.");
      }
    }
  };

  // Perform search & state filtering
  const filteredAnalyses = analyses.filter((item) => {
    const matchesSearch = item.patientId.toLowerCase().includes(searchId.toLowerCase()) || 
                          item.patientName.toLowerCase().includes(searchId.toLowerCase());
    
    if (statusFilter === "All Results") return matchesSearch;
    if (statusFilter === "Anomaly Detected") return matchesSearch && item.diagnosis === DiagnosisResult.ANOMALY_DETECTED;
    if (statusFilter === "Normal Findings") return matchesSearch && item.diagnosis === DiagnosisResult.NORMAL_FINDINGS;
    if (statusFilter === "Review Required") return matchesSearch && item.diagnosis === DiagnosisResult.REVIEW_REQUIRED;
    
    return matchesSearch;
  });

  // Simple relative date formatting
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PST' : 'AM'; // Match the PST tag in mockups
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      
      return {
        date: formattedDate,
        time: `${hours}:${minutes} ${ampm}`
      };
    } catch {
      return { date: "Oct 24, 2024", time: "14:32 PST" };
    }
  };

  return (
    <div className="space-y-6 text-left relative min-h-[500px]">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-[#131b2e] tracking-tight">Analysis History</h2>
          <p className="font-sans text-xs text-[#434655]">
            Review past ultrasound analyses, diagnostic confidence scores, and historical patient imaging records.
          </p>
        </div>

        {/* Top bar controls: Search & Filters (identical to Screen 3 Header controls) */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Patient ID */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]">
              <Search className="w-4 h-4" />
            </span>
            <input 
              className="pl-9 pr-4 py-2 bg-white border border-[#c3c6d7] rounded-lg text-xs font-sans focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] w-60 placeholder:text-[#737686]" 
              placeholder="Search Patient ID or Name..." 
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>

          {/* Date range trigger */}
          <button 
            onClick={() => alert("Simulation date threshold filter triggers last 30 days of standard clinical cycles.")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-xs font-sans text-[#131b2e] hover:bg-[#faf8ff] transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#737686]" />
            Last 30 Days
            <span className="text-[10px] text-[#737686]">▼</span>
          </button>

          {/* Diagnosis code filter dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-xs font-sans text-[#131b2e] hover:bg-[#faf8ff] transition-colors cursor-pointer"
            >
              <Filter className="w-4 h-4 text-[#737686]" />
              {statusFilter}
              <span className="text-[10px] text-[#737686]">▼</span>
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-1 bg-white border border-[#c3c6d7] rounded-lg shadow-lg z-20 py-1 w-44 font-sans text-xs">
                {["All Results", "Anomaly Detected", "Normal Findings", "Review Required"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#f2f3ff] text-[#131b2e] cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Table view container (Identical to Screen 3 Table layout) */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
        
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="py-24 text-center text-[#737686] space-y-2">
            <AlertCircle className="w-8 h-8 text-[#737686] opacity-40 mx-auto" />
            <p className="font-sans text-xs font-bold">No clinical logs matched your search terms.</p>
            <button onClick={() => { setSearchId(""); setStatusFilter("All Results"); }} className="text-[#2563eb] text-[11px] font-semibold hover:underline">
              Reset all search filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              
              <thead>
                <tr className="bg-[#f2f3ff] border-b border-[#c3c6d7] text-left">
                  <th className="font-semibold text-[#434655] uppercase tracking-wider py-4 px-6">Patient ID</th>
                  <th className="font-semibold text-[#434655] uppercase tracking-wider py-4 px-6">Date &amp; Time</th>
                  <th className="font-semibold text-[#434655] uppercase tracking-wider py-4 px-6">Diagnosis Result</th>
                  <th className="font-semibold text-[#434655] uppercase tracking-wider py-4 px-6">Confidence Score</th>
                  <th className="font-semibold text-[#434655] uppercase tracking-wider py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#c3c6d7]/30">
                {filteredAnalyses.map((item) => {
                  const { date, time } = formatDateTime(item.createdAt);
                  const isAnomaly = item.diagnosis === DiagnosisResult.ANOMALY_DETECTED;
                  const isNormal = item.diagnosis === DiagnosisResult.NORMAL_FINDINGS;
                  const isReview = item.diagnosis === DiagnosisResult.REVIEW_REQUIRED;

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => { setSelectedAnalysis(item); }}
                      className="hover:bg-[#f2f3ff] transition-colors cursor-pointer group"
                    >
                      {/* Patient ID */}
                      <td className="py-4 px-6 font-semibold text-[#131b2e]">
                        {item.patientId}
                        <span className="block text-[10px] text-[#737686] font-normal">{item.patientName}</span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-6 text-[#434655] leading-normal">
                        {date}
                        <br />
                        <span className="text-[10.5px] text-[#737686] opacity-80">{time}</span>
                      </td>

                      {/* Diagnostic status pill badge (Matches Screen 3 custom indicators) */}
                      <td className="py-4 px-6">
                        {isAnomaly && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100/70 border border-red-200 text-red-700 font-sans text-[11px] font-bold tracking-wide uppercase rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            Anomaly Detected
                          </span>
                        )}
                        {isNormal && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100/70 border border-teal-200 text-teal-700 font-sans text-[11px] font-bold tracking-wide uppercase rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                            Normal findings
                          </span>
                        )}
                        {isReview && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#c9e6ff]/70 border border-[#39b8fd]/30 text-sky-800 font-sans text-[11px] font-bold tracking-wide uppercase rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006591]" />
                            Review Required
                          </span>
                        )}
                        {item.diagnosis === DiagnosisResult.ANALYZING && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dbe1ff]/70 text-[#004ac6] font-sans text-[11px] font-bold tracking-wide uppercase rounded-full">
                            <RefreshCw className="w-3 h-3 animate-spin text-[#004ac6]" />
                            Analyzing...
                          </span>
                        )}
                      </td>

                      {/* AI Confidence Meter Bar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#131b2e] w-8">
                            {item.diagnosis === DiagnosisResult.ANALYZING ? "--%" : `${item.confidence}%`}
                          </span>
                          <div className="w-24 h-1.5 bg-[#eaedff] rounded-full overflow-hidden relative">
                            {item.diagnosis === DiagnosisResult.ANALYZING ? (
                              <div className="absolute inset-0 bg-blue-500/20 animate-pulse w-full" />
                            ) : (
                              <div 
                                className={`h-full ${isAnomaly ? "bg-red-500" : isNormal ? "bg-teal-500" : "bg-sky-500"}`} 
                                style={{ width: `${item.confidence}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action items */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          
                          {/* Viewer Trigger */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedAnalysis(item); }}
                            className="p-1.5 text-[#434655] hover:text-[#2563eb] hover:bg-[#2563eb]/10 rounded transition-all cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Trigger */}
                          <button 
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all cursor-pointer"
                            title="Purge Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

        {/* Paginated Footer stamp matching the exact bottom values of Screen 3 */}
        <div className="px-6 py-4 border-t border-[#c3c6d7]/50 bg-white flex items-center justify-between font-sans text-xs">
          <p className="text-[#434655]">
            Showing <span className="font-semibold text-[#131b2e]">{(meta.current_page - 1) * 10 + 1}</span> to <span className="font-semibold text-[#131b2e]">{Math.min(meta.current_page * 10, meta.total)}</span> of <span className="font-semibold text-[#131b2e]">{meta.total}</span> analyses
          </p>
          
          <div className="flex items-center gap-1">
            <button 
              disabled={meta.current_page === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 border border-[#c3c6d7] rounded text-[#131b2e] hover:bg-[#f2f3ff] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#2563eb] text-white font-bold">
              {meta.current_page}
            </button>
            <span className="px-1 text-[#434655]">of {meta.last_page}</span>
            <button 
              disabled={meta.current_page === meta.last_page || meta.last_page === 0}
              onClick={() => setCurrentPage(prev => Math.min(meta.last_page, prev + 1))}
              className="p-1.5 border border-[#c3c6d7] rounded text-[#131b2e] hover:bg-[#f2f3ff] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* --- Patient Details Slider Drawer (Micro-interaction) --- */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex justify-end transition-opacity duration-300">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto p-6 flex flex-col justify-between text-left animate-[slideIn_300ms_ease-out]">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#e2e8f0]">
              <div>
                <span className="text-[10px] font-bold text-[#2563eb] tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded">
                  Clinical Scan Dossier
                </span>
                <h3 className="font-sans text-lg font-bold text-[#131b2e] mt-1">
                  Patient ID: {selectedAnalysis.patientId}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAnalysis(null)}
                className="p-1.5 text-[#434655] hover:text-[#131b2e] hover:bg-[#f2f3ff] rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Dossier Content */}
            <div className="flex-grow py-5 space-y-6">
              
              {/* Patient Core Profile */}
              <div className="grid grid-cols-2 gap-4 bg-[#faf8ff] p-4 rounded-xl border border-[#c3c6d7]/50 text-xs">
                <div>
                  <span className="text-[#737686] block">Full Name:</span>
                  <span className="font-bold text-[#131b2e] text-sm">{selectedAnalysis.patientName}</span>
                </div>
                <div>
                  <span className="text-[#737686] block">Anatomical Target:</span>
                  <span className="font-bold text-sm text-[#131b2e] flex items-center gap-1">
                    {selectedAnalysis.location || "Left Kidney"}
                  </span>
                </div>
                <div>
                  <span className="text-[#737686] block">Patient Age / Gender:</span>
                  <span className="font-bold text-sm text-[#131b2e]">{selectedAnalysis.patientAge} yrs / {selectedAnalysis.patientGender}</span>
                </div>
                <div>
                  <span className="text-[#737686] block">Inference Date:</span>
                  <span className="font-bold text-sm text-[#131b2e]">
                    {formatDateTime(selectedAnalysis.createdAt).date}
                  </span>
                </div>
              </div>

              {/* Patient Scan Slice with Grad-CAM toggler toggle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#131b2e]">Ultrasound Sweep Focus Area</span>
                  <button 
                    onClick={() => setGradCamOverlay(!gradCamOverlay)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      gradCamOverlay 
                        ? "bg-[#2563eb] text-white border-[#2563eb]" 
                        : "bg-white text-[#737686] border-[#c3c6d7]"
                    }`}
                  >
                    Toggle Grad-CAM Maps
                  </button>
                </div>
                
                <div className="aspect-video bg-black rounded-lg relative overflow-hidden flex items-center justify-center border border-[#c3c6d7]">
                  <img 
                    alt="Rad slide target" 
                    className="w-full h-full object-cover" 
                    src={selectedAnalysis.imageUrl} 
                  />
                  {gradCamOverlay && selectedAnalysis.diagnosis !== DiagnosisResult.NORMAL_FINDINGS && (
                    <div 
                      className="absolute inset-0 bg-radial-heatmap opacity-75 pointer-events-none mix-blend-color-burn"
                      style={{ 
                        backgroundImage: `radial-gradient(circle at 45% 40%, rgba(239, 68, 68, 0.95) 0%, rgba(245, 158, 11, 0.7) 30%, rgba(13, 148, 136, 0.4) 50%, rgba(37, 99, 235, 0.1) 75%)`
                      }}
                    />
                  )}
                  {/* Floating target bounds box */}
                  {selectedAnalysis.diagnosis === DiagnosisResult.ANOMALY_DETECTED && (
                    <div className="absolute top-[32%] left-[30%] w-14 h-14 border-2 border-dashed border-red-500 rounded-full flex items-center justify-center animate-pulse" />
                  )}
                </div>
              </div>

              {/* Diagnostic Sizing Metrics & Diagnosis */}
              <div className="space-y-3">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e]">
                  AI Quantitative Classification
                </h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-[#c3c6d7] rounded-lg p-2.5 bg-[#faf8ff] text-center">
                    <span className="text-[10px] text-[#737686] block">Diagnosis:</span>
                    <span className="font-bold text-[11px] text-[#131b2e] capitalize leading-tight">
                      {selectedAnalysis.diagnosis}
                    </span>
                  </div>
                  <div className="border border-[#c3c6d7] rounded-lg p-2.5 bg-[#faf8ff] text-center">
                    <span className="text-[10px] text-[#737686] block">Acoustic Sizing:</span>
                    <span className="font-bold text-[11px] text-[#131b2e]">
                      {selectedAnalysis.dimensions?.length ? `${selectedAnalysis.dimensions.length}mm` : "Unaffected"}
                    </span>
                  </div>
                  <div className="border border-[#c3c6d7] rounded-lg p-2.5 bg-[#faf8ff] text-center">
                    <span className="text-[10px] text-[#737686] block">Confidence:</span>
                    <span className="font-bold text-[11px] text-[#2563eb]">
                      {selectedAnalysis.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Clinical recommendation box */}
              <div className="space-y-1.5 p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="font-sans text-xs font-bold text-[#004ac6] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Structured Clinical Guidance
                </div>
                <p className="font-sans text-xs text-[#434655] leading-relaxed italic">
                  "{selectedAnalysis.recommendation}"
                </p>
              </div>

              {/* Clinician's Notes Addendum Display */}
              <div className="space-y-2">
                <div className="font-sans text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                  <ClipboardCheck className="w-4.5 h-4.5 text-[#2563eb]" />
                  Radiological Signature Addendum
                </div>
                <div className="p-3 bg-[#faf8ff] rounded-lg border border-[#c3c6d7] text-xs text-[#434655] leading-relaxed min-h-[50px] whitespace-pre-wrap">
                  {selectedAnalysis.clinicianNotes || "No clinical notes appended at the time of authorization. Edit notes in New Analysis workspace to lock signature."}
                </div>
              </div>

            </div>

            {/* Folder Print Action Footer */}
            <div className="pt-4 border-t border-[#e2e8f0] flex gap-3">
              <button 
                onClick={async (e) => {
                  try {
                    const btn = e.currentTarget;
                    btn.innerHTML = '<span class="animate-pulse">Downloading...</span>';
                    await downloadReport(selectedAnalysis.id.toString());
                    btn.innerHTML = '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-award"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> Dossier Export Print';
                  } catch (err) {
                    alert("Failed to download PDF report. Ensure backend is running.");
                  }
                }}
                className="flex-1 bg-[#2563eb] hover:bg-[#004ac6] text-white font-sans font-semibold text-xs py-2.5 rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Dossier Export Print
              </button>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-4 py-2 border border-[#c3c6d7] hover:bg-[#faf8ff] text-xs font-sans text-[#131b2e] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
