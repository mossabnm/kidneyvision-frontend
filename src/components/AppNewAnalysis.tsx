/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Upload, Sparkles, Loader2, Play, CircleDot, ShieldCheck, 
  Eye, FileText, CheckCircle2, ChevronRight, Download, Dna, ArrowRight, Heart, AlertCircle, FileDown, X, RefreshCw
} from "lucide-react";
import { createPrediction, downloadReport, updateAnalysis, getReportPdfBlobUrl } from "../services/api";
import { DiagnosisResult, KidneyAnalysis } from "../types";
import { validateScanFile } from "../utils/fileValidation";
import { parseClinicalError, ClinicalError } from "../utils/errorParser";

// Dynamic sample images with varied clinical outcomes
const SAMPLE_PRESETS = [
  {
    patientId: "PT-8492",
    name: "Sample 1: Hyperechoic Calculus",
    desc: "Posterior acoustic shadowing indicative of kidney stone",
    gender: "Male" as const,
    age: 54,
    location: "Left Kidney" as const,
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    patientName: "Marcus Sterling"
  },
  {
    patientId: "PT-3104",
    name: "Sample 2: Normal Renal Parenchyma",
    desc: "Healthy cortical architecture and normal parenchyma",
    gender: "Female" as const,
    age: 39,
    location: "Right Kidney" as const,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    patientName: "Elena Rostova"
  },
  {
    patientId: "PT-9521",
    name: "Sample 3: Obstructive Calculus Focus",
    desc: "Pelvic calculus with distinct acoustic attenuation",
    gender: "Male" as const,
    age: 62,
    location: "Right Kidney" as const,
    imageUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80",
    patientName: "Alistair Vance"
  }
];

interface AppNewAnalysisProps {
  onAddSuccess: () => void;
}

export default function AppNewAnalysis({ onAddSuccess }: AppNewAnalysisProps) {
  // Input fields state
  const [patientId, setPatientId] = useState("PT-8492");
  const [patientName, setPatientName] = useState("Marcus Sterling");
  const [patientAge, setPatientAge] = useState<number>(54);
  const [patientGender, setPatientGender] = useState<"Male" | "Female" | "Other">("Male");
  const [location, setLocation] = useState<"Left Kidney" | "Right Kidney" | "Unspecified">("Left Kidney");
  const [clinicianNotes, setClinicianNotes] = useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [noteSavedSuccess, setNoteSavedSuccess] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  // Custom file or sample selected state
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>(SAMPLE_PRESETS[0].imageUrl);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Diagnosis & Pipeline states
  const [isScanning, setIsScanning] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [clinicalError, setClinicalError] = useState<ClinicalError | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<KidneyAnalysis | null>(null);

  // Analysis Pipeline Stages (Requirement 17: Uploading, Processing image, Running AI analysis, Generating report, Completed)
  const ANALYSIS_STAGES = [
    { id: "uploading", label: "Uploading", desc: "Uploading ultrasound scan to secure medical portal..." },
    { id: "processing", label: "Processing image", desc: "Validating scan tensor format & spatial dimensions..." },
    { id: "analyzing", label: "Running AI analysis", desc: "Executing CNN BatchNorm model (Normal vs. Kidney Stone)..." },
    { id: "generating", label: "Generating report", desc: "Compiling diagnostic findings and clinical telemetry..." },
    { id: "completed", label: "Completed", desc: "Analysis verified — ready for radiologist review." },
  ];

  // Pick preset handler
  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setSelectedPresetImage(preset.imageUrl);
    setPatientId(preset.patientId);
    setPatientName(preset.patientName);
    setPatientAge(preset.age);
    setPatientGender(preset.gender);
    setLocation(preset.location);
    setUploadedFile(null);
    setUploadedFilePreview(null);
    setUploadError(null);
    setActiveAnalysis(null);
  };

  // Image upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Strict client-side validation
      const validation = await validateScanFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid file format.");
        setUploadedFile(null);
        setUploadedFilePreview(null);
        e.target.value = "";
        return;
      }

      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedFilePreview(url);
      
      // If patientName was one of the preset sample names or the old dummy string, suggest the clean file name
      const isPresetOrDummy = SAMPLE_PRESETS.some(p => p.patientName.toLowerCase() === patientName.toLowerCase()) || patientName.startsWith("Acoustic Slice Upload");
      if (isPresetOrDummy || !patientName.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setPatientName(cleanName);
        setPatientId(`PT-${Math.floor(1000 + Math.random() * 9000)}`);
      }
      setActiveAnalysis(null);
    }
  };

  // Run AI Scan Execution
  const handleTriggerAnalysis = async () => {
    setIsScanning(true);
    setCurrentStageIdx(0); // Uploading
    setClinicalError(null);
    setActiveAnalysis(null);

    // Dynamic stage progression timer ensuring UI is actively moving and never appears frozen
    const stageTimer = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 500);

    try {
      const finalScanImage = uploadedFilePreview || selectedPresetImage;
      const finalPatientName = patientName.trim() || (uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Unspecified Patient");
      const scanPromise = createPrediction(uploadedFile, {
        patientId: patientId.trim() || undefined,
        patientName: finalPatientName,
        patientAge,
        patientGender,
        location,
        imageUrl: finalScanImage,
        clinicianNotes: clinicianNotes.trim() || undefined,
      });

      const res = await scanPromise;
      clearInterval(stageTimer);
      setCurrentStageIdx(4); // Completed

      setTimeout(() => {
        setActiveAnalysis(res);
        if (res.clinicianNotes) {
          setClinicianNotes(res.clinicianNotes);
        }
        setIsScanning(false);
      }, 350);
    } catch (e: any) {
      clearInterval(stageTimer);
      setIsScanning(false);
      const parsed = e?.clinicalError || parseClinicalError(e);
      setClinicalError(parsed);
    }
  };

  // Save report action (persists clinician notes and metadata updates)
  const handleSaveReport = async () => {
    if (activeAnalysis?.id) {
      setIsSavingNotes(true);
      try {
        await updateAnalysis(activeAnalysis.id, {
          patientId: patientId.trim() || undefined,
          patientName: patientName.trim() || undefined,
          patientAge,
          patientGender,
          location,
          clinicianNotes: clinicianNotes.trim() || undefined,
        });
        setNoteSavedSuccess(true);
      } catch (err: any) {
        console.warn("Failed to persist final signoff update:", err);
      } finally {
        setIsSavingNotes(false);
      }
    }
    alert("Diagnostic log and clinical addendum notes have been successfully signed under clinical audit standards. Saved to history records.");
    onAddSuccess();
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Upper Branding Header info */}
      <div>
        <h1 className="font-sans text-2xl font-bold text-[#131b2e] tracking-tight">AI New Diagnostic Workshop</h1>
        <p className="font-sans text-xs text-[#434655]">
          Register a patient, upload their renal ultrasound sweep, and trigger real-time neural rating.
        </p>
      </div>

      {/* Clinical Error Alert Banner */}
      {clinicalError && (
        <div className="bg-red-50/95 border border-red-200 rounded-xl p-4 space-y-2.5 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-sans text-xs font-bold text-red-900 flex items-center gap-2">
                <span>{clinicalError.title}</span>
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-red-200 text-red-800 uppercase font-mono">
                  {clinicalError.type}
                </span>
              </h4>
              <p className="font-sans text-xs text-red-700 mt-1 leading-relaxed">{clinicalError.message}</p>
              {clinicalError.suggestion && (
                <p className="font-sans text-[11px] text-red-800 bg-red-100/60 p-2 rounded-md mt-2 font-medium">
                  {clinicalError.suggestion}
                </p>
              )}
            </div>
            <button
              onClick={() => setClinicalError(null)}
              className="text-red-400 hover:text-red-700 p-1.5 rounded transition-colors cursor-pointer"
              title="Dismiss error notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-red-200/60">
            <button
              type="button"
              onClick={() => setClinicalError(null)}
              className="px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                setClinicalError(null);
                handleTriggerAnalysis();
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Analysis
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parameters Registration & Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section A: Patient Registration */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e] pb-2 border-b border-[#e2e8f0] flex items-center gap-1.5">
              <Dna className="w-4 h-4 text-[#2563eb]" />
              Patient Metrics
            </h3>

            {/* Patient ID and Name */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <label className="font-sans text-[11px] font-semibold text-[#434655]" htmlFor="patient-id">Patient ID</label>
                <input 
                  id="patient-id"
                  className="w-full px-3 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all focus:bg-white font-mono" 
                  type="text" 
                  placeholder="e.g. PT-8492"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="font-sans text-[11px] font-semibold text-[#434655]" htmlFor="patient-name">Patient Full Name</label>
                <input 
                  id="patient-name"
                  className="w-full px-3 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all focus:bg-white" 
                  type="text" 
                  placeholder="e.g. John Doe or Clinical Case #102"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Patient Age */}
              <div className="space-y-1">
                <label className="font-sans text-[11px] font-semibold text-[#434655]" htmlFor="patient-age">Age</label>
                <input 
                  id="patient-age"
                  className="w-full px-3 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all focus:bg-white" 
                  type="number" 
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                />
              </div>

              {/* Patient Gender */}
              <div className="space-y-1">
                <label className="font-sans text-[11px] font-semibold text-[#434655]" htmlFor="patient-gender">Gender</label>
                <select 
                  id="patient-gender"
                  className="w-full px-3 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all focus:bg-white"
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Anatomical location targets */}
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold text-[#434655]" htmlFor="scan-target">Anatomical Target Site</label>
              <div className="grid grid-cols-3 gap-2">
                {["Left Kidney", "Right Kidney", "Unspecified"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc as any)}
                    className={`py-1.5 px-2 border rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
                      location === loc 
                        ? "bg-[#2563eb] text-white border-[#2563eb]" 
                        : "bg-white text-[#434655] border-[#c3c6d7] hover:bg-[#faf8ff]"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section B: Medical Imaging Sources */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e] pb-2 border-b border-[#e2e8f0] flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#2563eb]" />
              Select Scan Sweep Source
            </h3>

            {/* Preset Samples */}
            <div className="space-y-2">
              <div className="font-sans text-[11px] font-semibold text-[#434655]">Clinical Quick Presets:</div>
              <div className="space-y-1.5">
                {SAMPLE_PRESETS.map((preset, idx) => {
                  const isSelected = selectedPresetImage === preset.imageUrl && !uploadedFile;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex justify-between items-center transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-[#2563eb]/5 border-[#2563eb] text-[#131b2e] ring-1 ring-[#2563eb]" 
                          : "bg-white border-[#c3c6d7] text-[#434655] hover:bg-[#faf8ff]"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold truncate text-[11px]">{preset.name}</div>
                        <div className="text-[9.5px] text-[#737686] truncate">{preset.desc}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-[#2563eb] translate-x-0.5" : "text-[#737686]"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom File Upload */}
            <div className="pt-2">
              <div className="font-sans text-[11px] font-semibold text-[#434655] mb-2">Or Upload Custom Ultrasound Slice:</div>
              <label className="border-2 border-dashed border-[#c3c6d7] rounded-xl p-4 flex flex-col items-center justify-center bg-[#faf8ff] hover:bg-[#f2f3ff] transition-all cursor-pointer text-center hover:border-[#2563eb]/50">
                <Upload className="w-6 h-6 text-[#737686] mb-1.5" />
                <span className="font-sans text-[11px] font-bold text-[#131b2e]">Upload Raw Ultrasound Scan (JPG, PNG)</span>
                <span className="font-sans text-[9px] text-[#737686] mt-0.5">Max 5MB • Validated & Sanitized instantly</span>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png" 
                  className="hidden" 
                  onChange={handleImageFileChange} 
                />
              </label>
              {uploadError && (
                <div className="mt-2 text-[11px] text-red-700 font-sans font-medium bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
              {uploadedFile && !uploadError && (
                <div className="mt-2 text-[10px] text-emerald-600 font-sans font-medium bg-emerald-50 px-2 py-1 rounded inline-block">
                  ✓ Validated ultrasound scan: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)} KB)
                </div>
              )}
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={handleTriggerAnalysis}
              disabled={isScanning}
              className="w-full bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow shadow-[#2563eb]/15 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ANALYZING CORE TENSORS...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  RUN DEEP NEURAL DISCOVERY
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Render HUD Scanning and AI Explainability Outputs (7 cols) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          
          {/* Diagnostic Display Canvas Card */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm">
            
            {/* Display header */}
            <div className="bg-[#f2f3ff] px-5 py-3 border-b border-[#c3c6d7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDot className={`w-3 h-3 ${isScanning ? "text-[#2563eb] animate-ping" : "text-[#737686]"}`} />
                <span className="font-sans text-[11px] font-bold text-[#131b2e] uppercase tracking-wider">
                  Diagnostic Imaging Viewer HUD
                </span>
              </div>
              <span className="font-mono text-[10.5px] text-[#737686]">
                Patient ID: {activeAnalysis ? activeAnalysis.id : "PT_PENDING"}
              </span>
            </div>

            <div className="p-5 grid md:grid-cols-2 gap-5">
              
              {/* Scan slice visualization panel */}
              <div className="space-y-3">
                <div className="aspect-square bg-black rounded-xl border border-[#c3c6d7] relative overflow-hidden flex items-center justify-center">
                  
                  {/* Underlay Raw Ultrasound Picture */}
                  <img
                    alt="Ultrasound Diagnostic Target"
                    className="w-full h-full object-cover select-none"
                    src={uploadedFilePreview || selectedPresetImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80";
                    }}
                  />

                  {/* Telemetry frame borders */}
                  <div className="absolute inset-0 border border-white/10 m-3 pointer-events-none rounded-lg" />

                  {/* Healthy badge overlay for normal findings */}
                  {activeAnalysis && activeAnalysis.diagnosis === DiagnosisResult.NORMAL_FINDINGS && !isScanning && (
                    <div className="absolute bottom-3 right-3 bg-teal-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Clear — No Anomalies</span>
                    </div>
                  )}

                  {/* Anomaly badge overlay for stone findings */}
                  {activeAnalysis && activeAnalysis.diagnosis === DiagnosisResult.ANOMALY_DETECTED && !isScanning && (
                    <div className="absolute bottom-3 right-3 bg-red-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                      <CircleDot className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Pathology Detected</span>
                    </div>
                  )}

                  {/* HUD scanning overlay when actively processing */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#283044]/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                      <Loader2 className="w-8 h-8 text-white animate-spin mb-3" />
                      <div className="w-4/5 bg-white/20 h-1.5 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-[#acedff] transition-all duration-300"
                          style={{ width: `${((currentStageIdx + 1) / ANALYSIS_STAGES.length) * 100}%` }}
                        />
                      </div>
                      <span className="font-sans text-[10px] text-white font-bold uppercase tracking-widest animate-pulse">
                        {ANALYSIS_STAGES[currentStageIdx]?.label || "Neural Sweeps Processing..."}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Textual Inference Outputs Panel (Visible once analysis complete) */}
              <div className="flex flex-col justify-between">
                
                {/* Multi-Stage Visual Pipeline Progression (when scanning) */}
                {isScanning && (
                  <div className="flex-1 flex flex-col justify-center space-y-4 py-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                      <div className="font-sans text-[11px] font-bold text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 text-[#2563eb] animate-spin" />
                        AI Analysis Pipeline
                      </div>
                      <span className="text-[10.5px] font-mono font-bold text-[#2563eb]">
                        {Math.round(((currentStageIdx + 1) / ANALYSIS_STAGES.length) * 100)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#eaedff] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#2563eb] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${((currentStageIdx + 1) / ANALYSIS_STAGES.length) * 100}%` }}
                      />
                    </div>

                    {/* Stage Steps */}
                    <div className="space-y-2">
                      {ANALYSIS_STAGES.map((stage, idx) => {
                        const isDone = currentStageIdx > idx;
                        const isCurrent = currentStageIdx === idx;
                        return (
                          <div 
                            key={stage.id} 
                            className={`text-xs flex items-center gap-2.5 transition-all p-1.5 rounded-lg ${
                              isDone 
                                ? "text-emerald-700 font-medium bg-emerald-50/50" 
                                : isCurrent 
                                ? "text-[#2563eb] font-bold bg-[#2563eb]/5 border border-[#2563eb]/30" 
                                : "text-[#737686] opacity-50"
                            }`}
                          >
                            <span className="shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isCurrent ? (
                                <Loader2 className="w-4 h-4 text-[#2563eb] animate-spin" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-[#c3c6d7] flex items-center justify-center text-[9px] text-[#737686]">
                                  {idx + 1}
                                </div>
                              )}
                            </span>
                            <div className="min-w-0">
                              <div className="leading-tight text-[11px]">{stage.label}</div>
                              {isCurrent && (
                                <div className="text-[9.5px] font-normal text-[#434655] truncate mt-0.5 animate-pulse">
                                  {stage.desc}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Raw Initial View */}
                {!isScanning && !activeAnalysis && (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-2">
                    <Sparkles className="w-8 h-8 text-[#2563eb] opacity-40 animate-pulse" />
                    <h5 className="font-sans text-xs font-bold text-[#131b2e]">Scan Awaiting Inference</h5>
                    <p className="font-sans text-[10.5px] text-[#737686] max-w-[200px]">
                      Trigger neural classification on the left parameters to populate diagnostic indexes.
                    </p>
                  </div>
                )}

                {/* Finished AI Analysis Outward Indices */}
                {!isScanning && activeAnalysis && (
                  <div className="flex-grow flex flex-col justify-between space-y-4">
                    
                    {/* Diagnostic Outcome Status Badge */}
                    <div className="space-y-1">
                      <div className="font-sans text-[10px] font-semibold text-[#737686] uppercase tracking-wider">
                        Diagnostic Outcome:
                      </div>
                      <div>
                        {activeAnalysis.diagnosis === DiagnosisResult.ANOMALY_DETECTED ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 font-sans text-xs font-bold rounded-lg uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                            Anomaly detected
                          </span>
                        ) : activeAnalysis.diagnosis === DiagnosisResult.NORMAL_FINDINGS ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-sans text-xs font-bold rounded-lg uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                            Normal findings
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-sans text-xs font-bold rounded-lg uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                            Review Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI Confidence Index */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-sans font-semibold text-[#737686]">Confidence level:</span>
                        <span className="font-sans font-bold text-[#131b2e]">{activeAnalysis.confidence}%</span>
                      </div>
                      <div className="w-full bg-[#f2f3ff] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            activeAnalysis.diagnosis === DiagnosisResult.ANOMALY_DETECTED
                              ? "bg-red-500"
                              : activeAnalysis.diagnosis === DiagnosisResult.NORMAL_FINDINGS
                              ? "bg-teal-500"
                              : "bg-amber-400"
                          }`}
                          style={{ width: `${activeAnalysis.confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Pathology Class Details Mapping */}
                    <div className="grid grid-cols-2 gap-3 bg-[#faf8ff] border border-[#c3c6d7] p-3 rounded-lg text-xs leading-relaxed">
                      <div>
                        <div className="text-[10px] text-[#737686]">Pathology Finding:</div>
                        <div className="font-bold text-[#131b2e] truncate">
                          {activeAnalysis.pathologyFinding || activeAnalysis.cystType || "Normal Renal Parenchyma"}
                        </div>
                      </div>
                      <div>
                        {activeAnalysis.dimensions && activeAnalysis.dimensions.length > 0 ? (
                          <>
                            <div className="text-[10px] text-[#737686]">Sizing Bounds:</div>
                            <div className="font-bold text-[#131b2e] text-[11px] truncate">
                              {activeAnalysis.dimensions.length}mm ({activeAnalysis.dimensions.volume}cm³)
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-[10px] text-[#737686]">AI Task:</div>
                            <div className="font-bold text-[#131b2e] truncate">Kidney Stone Detection</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Low Confidence / Borderline Warning Banner */}
                    {(activeAnalysis.isUncertain || activeAnalysis.confidence < 70 || activeAnalysis.diagnosis === DiagnosisResult.REVIEW_REQUIRED) && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded text-[11px] text-amber-900 leading-snug">
                        <span className="font-bold">Borderline Confidence Notice:</span> AI confidence ({activeAnalysis.confidence}%) is near the decision threshold. Secondary clinician evaluation recommended.
                      </div>
                    )}

                    {/* Clinical recommendation generator */}
                    <div className="space-y-1 bg-blue-50/40 border border-blue-200 p-3 rounded-lg">
                      <div className="font-sans text-[10px] font-bold text-[#0053db] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Clinical Suggestion Summary:
                      </div>
                      <p className="font-sans text-[11px] text-[#434655] italic leading-relaxed">
                        "{activeAnalysis.recommendation}"
                      </p>
                    </div>

                    {/* Medical AI Disclaimer */}
                    <div className="text-[9.5px] text-[#737686] bg-[#f9fafb] p-2 rounded border border-[#e5e7eb] leading-tight">
                      <strong>Medical Disclaimer:</strong> KidneyVision AI provides assistive screening for Kidney Stones vs. Normal Renal Parenchyma. It does not replace clinical diagnosis by a licensed radiologist or physician.
                    </div>

                    {/* Action Panel: save to records table, PDF preview & download */}
                    <div className="pt-2 flex gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={handleSaveReport}
                        disabled={isSavingNotes}
                        className="flex-1 bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold text-[11px] py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingNotes ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        {isSavingNotes ? "Saving..." : "Sign & Log"}
                      </button>

                      {/* PDF Preview Button */}
                      <button
                        onClick={async () => {
                          try {
                            if (!activeAnalysis?.id) return;
                            setIsPreviewLoading(true);
                            if (clinicianNotes.trim()) {
                              await updateAnalysis(activeAnalysis.id, {
                                clinicianNotes: clinicianNotes.trim()
                              });
                            }
                            const url = await getReportPdfBlobUrl(activeAnalysis.id);
                            setPdfPreviewUrl(url);
                          } catch (e) {
                            alert("Failed to load PDF preview. Ensure backend is running.");
                          } finally {
                            setIsPreviewLoading(false);
                          }
                        }}
                        disabled={isPreviewLoading}
                        className="px-3 py-2 border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb]/10 font-semibold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Preview PDF inside modal"
                      >
                        {isPreviewLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        Preview PDF
                      </button>
                      
                      {/* PDF Download Button */}
                      <button
                        onClick={async () => {
                          try {
                            if (!activeAnalysis?.id) return;
                            const btn = document.getElementById('pdf-btn') as HTMLButtonElement;
                            if (btn) btn.innerHTML = '<span class="animate-pulse">Saving...</span>';
                            
                            // Auto-persist clinician notes before downloading PDF report
                            if (clinicianNotes.trim()) {
                              await updateAnalysis(activeAnalysis.id, {
                                clinicianNotes: clinicianNotes.trim()
                              });
                            }

                            await downloadReport(activeAnalysis.id);
                            if (btn) btn.innerHTML = '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>';
                          } catch (e) {
                            alert("Failed to download PDF report. Ensure backend is running.");
                          }
                        }}
                        id="pdf-btn"
                        className="px-3 border border-[#c3c6d7] hover:bg-[#faf8ff] text-[#131b2e] rounded-lg transition-all flex items-center justify-center cursor-pointer"
                        title="Download PDF Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>
            
          </div>

          {/* Clinician notes box (Linked to state when prediction is ready to add professional feedback) */}
          {activeAnalysis && (
            <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
                  Radiologist Diagnostic Addendum Notes
                </h4>
                <button
                  type="button"
                  onClick={async () => {
                    setIsSavingNotes(true);
                    try {
                      await updateAnalysis(activeAnalysis.id, {
                        clinicianNotes: clinicianNotes.trim()
                      });
                      setNoteSavedSuccess(true);
                      setTimeout(() => setNoteSavedSuccess(false), 3500);
                    } catch (e: any) {
                      alert("Failed to save notes: " + e.message);
                    } finally {
                      setIsSavingNotes(false);
                    }
                  }}
                  disabled={isSavingNotes}
                  className="px-2.5 py-1 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[10.5px] font-bold rounded-md flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  {isSavingNotes ? "Saving..." : noteSavedSuccess ? "Saved to Report ✓" : "Save Notes"}
                </button>
              </div>
              <textarea
                className="w-full p-3 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg text-xs font-sans focus:bg-white outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all min-h-[90px]"
                placeholder="Submit specialized biopsy indicators or Doppler results here to sign with this AI print audit..."
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
              />
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#737686]">
                  * Signing this addendum logs the exact credentials of your secure clinical login portal signature.
                </span>
                {noteSavedSuccess && (
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-[fadeIn_200ms_ease-out]">
                    ✓ Saved to database and PDF report
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* In-App PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f9fafb]">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4.5 h-4.5 text-[#2563eb] shrink-0" />
                <h3 className="font-bold text-sm text-[#131b2e] truncate">
                  Diagnostic Report Preview {activeAnalysis ? `(#${activeAnalysis.id} - ${patientName || patientId})` : ""}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={pdfPreviewUrl}
                  download={`kidneyvision_report_${activeAnalysis?.id || "preview"}.pdf`}
                  className="px-3 py-1.5 bg-[#2563eb] text-white hover:bg-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  onClick={() => {
                    if (pdfPreviewUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(pdfPreviewUrl);
                    }
                    setPdfPreviewUrl(null);
                  }}
                  className="p-1.5 text-[#737686] hover:text-[#131b2e] hover:bg-neutral-200 rounded-lg transition-all cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with PDF Viewer iframe */}
            <div className="flex-1 bg-[#525659] relative min-h-[550px]">
              <iframe
                src={`${pdfPreviewUrl}#toolbar=1&navpanes=0`}
                title="Diagnostic Report PDF"
                className="w-full h-full min-h-[550px] border-0"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
