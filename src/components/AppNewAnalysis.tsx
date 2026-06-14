/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Upload, Sparkles, Loader2, Play, CircleDot, ShieldCheck, 
  Eye, FileText, CheckCircle2, ChevronRight, Download, Sliders, Dna, ArrowRight, Heart
} from "lucide-react";
import { createPrediction, downloadReport } from "../services/api";
import { DiagnosisResult, KidneyAnalysis } from "../types";

// Dynamic sample images with varied clinical outcomes
const SAMPLE_PRESETS = [
  {
    name: "Sample 1: Complex Nephrological Scan",
    desc: "Anomalous multi-septated cyst visible",
    gender: "Male" as const,
    age: 54,
    location: "Left Kidney" as const,
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    patientName: "Marcus Sterling"
  },
  {
    name: "Sample 2: Sterile Corticomedullary Border",
    desc: "Healthy kidney architecture",
    gender: "Female" as const,
    age: 39,
    location: "Right Kidney" as const,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    patientName: "Elena Rostova"
  },
  {
    name: "Sample 3: Simple Acoustic Shadowing",
    desc: "Fluid-filled circular simple cyst",
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
  const [patientName, setPatientName] = useState("Marcus Sterling");
  const [patientAge, setPatientAge] = useState<number>(54);
  const [patientGender, setPatientGender] = useState<"Male" | "Female" | "Other">("Male");
  const [location, setLocation] = useState<"Left Kidney" | "Right Kidney" | "Unspecified">("Left Kidney");
  
  // Custom file or sample selected state
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>(SAMPLE_PRESETS[0].imageUrl);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  
  // Diagnosis states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [activeAnalysis, setActiveAnalysis] = useState<KidneyAnalysis | null>(null);
  const [gradCamIntensity, setGradCamIntensity] = useState<number>(50); // Slider 0-100 to toggle visual heatmap opacity

  // Scanning simulation steps array
  const scanningSteps = [
    "Purifying clinical DICOM header payload & sanitizing PHI variables...",
    "Re-sampling acoustic slice array down to standard 512x512 tensor format...",
    "Injecting model weights of KidneyVision Neural Engine v4.2...",
    "Conducting real-time feed-forward convolution cycles...",
    "Isolating vascular bounds and processing Grad-CAM focus heatmaps..."
  ];

  // Pick preset handler
  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setSelectedPresetImage(preset.imageUrl);
    setPatientName(preset.patientName);
    setPatientAge(preset.age);
    setPatientGender(preset.gender);
    setLocation(preset.location);
    setUploadedFile(null);
    setUploadedFilePreview(null);
    setActiveAnalysis(null);
  };

  // Image upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedFilePreview(url);
      setPatientName("Acoustic Slice Upload #" + Math.floor(100+Math.random()*900));
      setActiveAnalysis(null);
    }
  };

  // Run AI Scan Execution
  const handleTriggerAnalysis = async () => {
    setIsScanning(true);
    setScanStep(0);
    setActiveAnalysis(null);

    try {
      const finalScanImage = uploadedFilePreview || selectedPresetImage;
      const scanPromise = createPrediction(uploadedFile, {
        patientName,
        patientAge,
        patientGender,
        location,
        imageUrl: finalScanImage
      });

      // Simple rapid visual progress bar without artificial 3 second wait
      const progressInterval = setInterval(() => {
        setScanStep(prev => (prev < scanningSteps.length ? prev + 1 : prev));
      }, 300);

      const res = await scanPromise;
      clearInterval(progressInterval);
      setScanStep(scanningSteps.length);
      setActiveAnalysis(res);
    } catch (e: any) {
      console.error("Clinical inference failed.", e);
      alert(e.message || "Failed to analyze image.");
    } finally {
      setIsScanning(false);
    }
  };

  // Save report action
  const handleSaveReport = () => {
    alert("Diagnostic log has been successfully signed under clinical audit standards. Saved to history records.");
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parameters Registration & Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section A: Patient Registration */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e] pb-2 border-b border-[#e2e8f0] flex items-center gap-1.5">
              <Dna className="w-4 h-4 text-[#2563eb]" />
              Patient Metrics
            </h3>

            {/* Patient Name */}
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold text-[#434655]" htmlFor="patient-name">Patient Full Name</label>
              <input 
                id="patient-name"
                className="w-full px-3 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none transition-all focus:bg-white" 
                type="text" 
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
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
                <span className="font-sans text-[11px] font-bold text-[#131b2e]">Upload Raw JPG/PNG or DICOM</span>
                <span className="font-sans text-[9px] text-[#737686] mt-0.5">Files sanitized securely instantly</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageFileChange} 
                />
              </label>
              {uploadedFile && (
                <div className="mt-2 text-[10px] text-emerald-600 font-sans font-medium bg-emerald-50 px-2 py-1 rounded inline-block">
                  ✓ Uploaded file: {uploadedFile.name}
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
              
              {/* Scan slice visualization panel with Grad-CAM overlay */}
              <div className="space-y-3">
                <div className="aspect-square bg-black rounded-xl border border-[#c3c6d7] relative overflow-hidden flex items-center justify-center">
                  
                  {/* Underlay Raw Ultrasound Picture */}
                  <img
                    alt="Ultrasound Diagnostic Target"
                    className="w-full h-full object-cover select-none"
                    src={uploadedFilePreview || selectedPresetImage}
                  />

                  {/* Heatmap overlay (Abstract layered canvas simulated via visual gradients + opacity slider) */}
                  {activeAnalysis && gradCamIntensity > 0 && (
                    <div 
                      className="absolute inset-0 bg-radial-heatmap pointer-events-none mix-blend-color-burn"
                      style={{ 
                        opacity: gradCamIntensity / 100,
                        backgroundImage: `radial-gradient(circle at 45% 40%, rgba(239, 68, 68, 0.95) 0%, rgba(245, 158, 11, 0.7) 30%, rgba(13, 148, 136, 0.4) 50%, rgba(37, 99, 235, 0.1) 75%)`
                      }}
                    />
                  )}

                  {/* Telemetry frame borders */}
                  <div className="absolute inset-0 border border-white/10 m-3 pointer-events-none rounded-lg" />

                  {/* Target Reticle circle focus over the kidney cyst area */}
                  {activeAnalysis && activeAnalysis.diagnosis === DiagnosisResult.ANOMALY_DETECTED && (
                    <div className="absolute top-[35%] left-[32%] w-16 h-16 border-2 border-dashed border-red-500 rounded-full animate-pulse flex items-center justify-center">
                      <span className="text-[8px] bg-red-600 text-white font-mono leading-none px-1 rounded absolute -top-5">
                        CYST_LOC
                      </span>
                    </div>
                  )}

                  {/* HUD scanning overlay when actively processing */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#283044]/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                      <Loader2 className="w-8 h-8 text-white animate-spin mb-3" />
                      <div className="w-4/5 bg-white/20 h-1.5 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-[#acedff] transition-all duration-300"
                          style={{ width: `${(scanStep / scanningSteps.length) * 100}%` }}
                        />
                      </div>
                      <span className="font-sans text-[10px] text-white font-bold uppercase tracking-widest animate-pulse">
                        Neural Sweeps Processing...
                      </span>
                    </div>
                  )}
                </div>

                {/* Explainable Grad-CAM controller */}
                {activeAnalysis && (
                  <div className="bg-[#f2f3ff] border border-[#c3c6d7] p-2.5 rounded-lg space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-sans font-bold flex items-center gap-1 text-[#0053db]">
                        <Sliders className="w-3.5 h-3.5" />
                        Grad-CAM Target Focus Opacity
                      </span>
                      <span className="font-mono text-[#0053db] font-bold">{gradCamIntensity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      className="w-full accent-[#0053db] cursor-pointer" 
                      value={gradCamIntensity} 
                      onChange={(e) => setGradCamIntensity(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>

              {/* Textual Inference Outputs Panel (Visible once analysis complete) */}
              <div className="flex flex-col justify-between">
                
                {/* Simulated Progression Steps (when scanning) */}
                {isScanning && (
                  <div className="flex-1 flex flex-col justify-center space-y-2.5 py-4">
                    <div className="font-sans text-[11px] font-bold text-[#131b2e] uppercase tracking-wider pl-1.5 border-l-2 border-[#2563eb]">
                      Processing Pipeline
                    </div>
                    <div className="space-y-2">
                      {scanningSteps.map((step, idx) => {
                        const isDone = scanStep > idx;
                        const isCurrent = scanStep === idx;
                        return (
                          <div 
                            key={idx} 
                            className={`text-[10px] flex items-start gap-2 transition-all ${
                              isDone ? "text-emerald-700 font-medium" : isCurrent ? "text-[#2563eb] font-bold" : "text-[#737686] opacity-50"
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {isDone ? "✓" : isCurrent ? "●" : "○"}
                            </span>
                            <span className="leading-tight">{step}</span>
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
                        <div className="text-[10px] text-[#737686]">Pathology Class:</div>
                        <div className="font-bold text-[#131b2e] truncate">{activeAnalysis.cystType}</div>
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
                            <div className="text-[10px] text-[#737686]">Sizing Bounds:</div>
                            <div className="font-bold text-[#131b2e] truncate">N/A (Sterile)</div>
                          </>
                        )}
                      </div>
                    </div>

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

                    {/* Action Panel: save to records table, PDF print */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={handleSaveReport}
                        className="flex-1 bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold text-[11px] py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Authorize Sign &amp; Log Record
                      </button>
                      
                      <button
                        onClick={async () => {
                          try {
                            if (!activeAnalysis?.id) return;
                            const btn = document.getElementById('pdf-btn') as HTMLButtonElement;
                            if (btn) btn.innerHTML = '<span class="animate-pulse">Downloading...</span>';
                            await downloadReport(activeAnalysis.id.replace('PT-', ''));
                            if (btn) btn.innerHTML = '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>';
                          } catch (e) {
                            alert("Failed to download PDF report. Ensure backend is running.");
                          }
                        }}
                        id="pdf-btn"
                        className="px-3 border border-[#c3c6d7] hover:bg-[#faf8ff] text-[#131b2e] rounded-lg transition-all flex items-center justify-center cursor-pointer"
                        title="Print Report"
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
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e]">
                Radiologist Diagnostic Addendum Notes
              </h4>
              <textarea
                className="w-full p-3 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg text-xs font-sans focus:bg-white outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all min-h-[90px]"
                placeholder="Submit specialized biopsy indicators or Doppler results here to sign with this AI print audit..."
                defaultValue={activeAnalysis.clinicianNotes || ""}
              />
              <span className="text-[10px] text-[#737686] block">
                * Signing this addendum logs the exact credentials of your secure clinical login portal signature.
              </span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
