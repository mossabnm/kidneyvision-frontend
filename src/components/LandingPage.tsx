/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, ShieldCheck, Timer, Users, UploadCloud, Award, Eye, FileDown, ArrowRight, BrainCircuit } from "lucide-react";

interface LandingPageProps {
  onNavigateToAuth: () => void;
  onEnterPortalDirectly: () => void;
}

export default function LandingPage({ onNavigateToAuth, onEnterPortalDirectly }: LandingPageProps) {
  return (
    <div className="bg-[#fcfcff] text-[#131b2e] min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#b4c5ff]">
      {/* Dynamic Grid Overlay Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(115, 118, 134, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(115, 118, 134, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px"
        }}
      />
      
      {/* Ambient medical blur ornaments */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#dbe1ff]/30 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[200px] right-[-100px] w-[600px] h-[600px] bg-[#acedff]/20 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <nav id="landing-navbar" className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 backdrop-blur-md bg-[#ffffff]/80 border-b border-[#c3c6d7]/40">
        <div className="font-sans font-bold text-lg text-[#004ac6] flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white">
            <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="tracking-tight text-[#131b2e]">Kidney<span className="text-[#2563eb]">Vision</span> AI</span>
        </div>
        
        <div className="hidden md:flex gap-8 items-center font-sans text-sm font-medium text-[#434655]">
          <a href="#features" className="hover:text-[#004ac6] transition-colors">Key Features</a>
          <a href="#metrics" className="hover:text-[#004ac6] transition-colors">Clinical Accuracy</a>
          <a href="#workflow" className="hover:text-[#004ac6] transition-colors">Workflow</a>
          <a href="#compliance" className="hover:text-[#004ac6] transition-colors">Compliance</a>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            id="login-link-btn"
            onClick={onNavigateToAuth}
            className="text-sm font-medium text-[#434655] hover:text-[#004ac6] px-3 py-1.5 rounded-lg hover:bg-[#faf8ff] transition-colors cursor-pointer"
          >
            Professional Login
          </button>
          <button 
            id="register-link-btn"
            onClick={onEnterPortalDirectly}
            className="bg-[#2563eb] hover:bg-[#004ac6] text-white px-4 py-2 text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all active:scale-95 duration-100 cursor-pointer"
          >
            Analyze as Guest
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 md:px-12 pt-20 pb-24 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Call to Action Side */}
            <div className="flex flex-col gap-6 z-10 text-left">
              <div className="inline-flex items-center gap-2 bg-[#eaedff] border border-[#c3c6d7] px-3 py-1 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping" />
                <span className="font-sans text-xs font-medium text-[#004ac6]">CE-Certified &amp; FDA Clinical Guideline Grade</span>
              </div>
              
              <h1 className="font-sans text-4xl md:text-5xl lg:text-[56px] font-bold leading-tight tracking-tight text-[#131b2e]">
                AI-Powered <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004ac6] to-[#39b8fd]">
                  Kidney Cyst
                </span> Classification
              </h1>
              
              <p className="font-sans text-base md:text-lg text-[#434655] leading-relaxed max-w-lg">
                Upload an ultrasound image and receive an instant AI prediction on cyst categorization. Available for both general public exploration and registered medical professionals.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-2">
                <button 
                  id="hero-portal-btn"
                  onClick={onEnterPortalDirectly}
                  className="bg-[#2563eb] hover:bg-[#004ac6] text-white font-sans font-medium text-sm px-8 py-3.5 rounded-xl transition-all shadow-md shadow-[#2563eb]/20 hover:shadow-[#004ac6]/30 flex items-center gap-2 cursor-pointer"
                >
                  Analyze as Guest
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  id="hero-login-btn"
                  onClick={onNavigateToAuth}
                  className="bg-white text-[#131b2e] border border-[#c3c6d7] hover:bg-[#f2f3ff] font-sans font-medium text-sm px-8 py-3.5 rounded-xl transition-all flex items-center justify-center align-middle cursor-pointer"
                >
                  Professional Login
                </button>
              </div>
            </div>

            {/* Graphic Mockup Side */}
            <div className="relative z-10 flex justify-center">
              <div className="w-full max-w-lg aspect-[4/3] bg-white border border-[#c3c6d7] rounded-2xl shadow-lg overflow-hidden relative group">
                {/* Simulated Diagnostic Scan Display */}
                <img 
                  alt="Clinical Interface Diagnostic Visualization" 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
                />
                
                {/* HUD gradient footer */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/90 via-[#131b2e]/20 to-transparent flex flex-col justify-between p-6">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#ba1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                      AI Triage Alert
                    </span>
                    <span className="bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] text-[#acedff] font-mono border border-white/10">
                      SYS_MODE: CLINICAL_PRO
                    </span>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#c3c6d7] w-full flex justify-between items-center shadow">
                    <div>
                      <div className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#434655]">
                        Diagnostic Outcome
                      </div>
                      <div className="font-sans text-[#ba1a1a] font-bold flex items-center gap-1.5 text-base">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse inline-block" />
                        Anomaly Detected
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#434655]">
                        Confidence Score
                      </div>
                      <div className="font-sans text-xl font-extrabold text-[#131b2e]">
                        99.2%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics highlights bar */}
        <section id="metrics" className="bg-[#f2f3ff] py-12 border-y border-[#c3c6d7]/50">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Award className="w-8 h-8 text-[#2563eb]" />
              <h3 className="font-sans text-3xl font-bold text-[#131b2e]">99.8%</h3>
              <p className="font-sans text-xs text-[#434655]">Radiology Precision Ratios</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Timer className="w-8 h-8 text-[#2563eb]" />
              <h3 className="font-sans text-3xl font-bold text-[#131b2e]">&lt; 3.0s</h3>
              <p className="font-sans text-xs text-[#434655]">Real-time Deep Prediction</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="w-8 h-8 text-[#2563eb]" />
              <h3 className="font-sans text-3xl font-bold text-[#131b2e]">HIPAA</h3>
              <p className="font-sans text-xs text-[#434655]">Zero-Leak AES Crypts</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Users className="w-8 h-8 text-[#2563eb]" />
              <h3 className="font-sans text-3xl font-bold text-[#131b2e]">1,400+</h3>
              <p className="font-sans text-xs text-[#434655]">Onboarded Radiologists</p>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-sans text-3xl font-bold text-[#131b2e] tracking-tight">
              Clinical-Grade Intelligence Array
            </h2>
            <p className="font-sans text-sm text-[#434655] mt-3">
              Designed as a modern radiologist companion, implementing state-of-the-art classification with full accountability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Bento block 1: Upload */}
            <div className="md:col-span-2 bg-white border border-[#c3c6d7] rounded-xl p-8 flex flex-col justify-between hover:bg-[#faf8ff] transition-all group">
              <div>
                <UploadCloud className="w-10 h-10 text-[#2563eb] mb-4" />
                <h3 className="font-sans text-lg font-bold text-[#131b2e] mb-2">
                  Fluid Imaging Ingestion
                </h3>
                <p className="font-sans text-xs text-[#434655] max-w-md leading-relaxed">
                  Securely drag and drop clinical DICOM files, raw scans, or generic ultrasound slices. The app automatically sanitizes file metadata for complete HIPAA safety.
                </p>
              </div>
              <div className="w-full mt-6 h-36 bg-[#f2f3ff] rounded-lg border border-dashed border-[#c3c6d7] flex flex-col items-center justify-center text-xs text-[#434655] gap-2 p-4 group-hover:border-[#2563eb]/60 transition-colors">
                <UploadCloud className="w-6 h-6 text-[#737686] animate-bounce" />
                <span>Simulated workspace drag zone active inside the portal</span>
              </div>
            </div>

            {/* Bento block 2: AI prediction */}
            <div className="bg-white border border-[#c3c6d7] rounded-xl p-8 flex flex-col justify-between hover:bg-[#faf8ff] transition-all">
              <div>
                <Activity className="w-10 h-10 text-[#00788c] mb-4" />
                <h3 className="font-sans text-lg font-bold text-[#131b2e] mb-2">
                  AI Bosniak Rating
                </h3>
                <p className="font-sans text-xs text-[#434655] leading-relaxed">
                  Instantly categorize ultrasound renal findings using advanced weights calibrated for cyst classification. High, low, or complex anomaly flags generated immediately.
                </p>
              </div>
              <div className="flex items-end gap-2 h-24 pt-4 mt-6">
                <div className="w-1/3 bg-[#b4c5ff] hover:bg-[#2563eb] rounded-t-lg h-2/5 transition-colors cursor-pointer" title="Simple Cyst" />
                <div className="w-1/3 bg-[#39b8fd] hover:bg-[#2563eb] rounded-t-lg h-4/5 transition-colors cursor-pointer" title="Review Required" />
                <div className="w-1/3 bg-[#ba1a1a] hover:bg-red-700 rounded-t-lg h-full transition-colors cursor-pointer" title="Anomaly" />
              </div>
            </div>

            {/* Bento block 3: Grad-CAM Explainable AI */}
            <div className="bg-white border border-[#c3c6d7] rounded-xl p-8 flex flex-col justify-between hover:bg-[#faf8ff] transition-all">
              <div>
                <Eye className="w-10 h-10 text-[#0053db] mb-4" />
                <h3 className="font-sans text-lg font-bold text-[#131b2e] mb-2">
                  Grad-CAM Localization
                </h3>
                <p className="font-sans text-xs text-[#434655] leading-relaxed">
                  Eliminate black-box AI problems. Toggle visual focus overlays and pixel heatmaps to evaluate precisely which structural boundaries led back to the classification anomaly score.
                </p>
              </div>
              <div className="w-full h-24 bg-gradient-to-r from-teal-500/20 via-orange-400/30 to-red-500/30 rounded-lg p-2 flex items-center justify-center border border-[#c3c6d7]/40 text-[10px] font-mono mt-6 text-[#131b2e]">
                <span>[ GRAD_CAM HEATMAP ENGINES OK ]</span>
              </div>
            </div>

            {/* Bento block 4: Instant Document Reports */}
            <div className="md:col-span-2 bg-white border border-[#c3c6d7] rounded-xl p-8 flex flex-col justify-between hover:bg-[#faf8ff] transition-all relative overflow-hidden group">
              <div className="relative z-10">
                <FileDown className="w-10 h-10 text-[#2563eb] mb-4" />
                <h3 className="font-sans text-lg font-bold text-[#131b2e] mb-2">
                  Download Analysis Report
                </h3>
                <p className="font-sans text-xs text-[#434655] max-w-sm leading-relaxed">
                  Download fully structured reports in high resolution. Providing rapid documentation complete with confidence metrics, image previews, and prediction data.
                </p>
              </div>
              <div className="absolute right-[-40px] bottom-[-40px] w-1/2 h-4/5 bg-[#f2f3ff] rounded-tl-2xl border-l border-t border-[#c3c6d7] translate-x-3 translate-y-3 shadow-inner p-4 hidden md:flex flex-col gap-2">
                <div className="w-3/4 h-2 bg-[#131b2e]/20 rounded" />
                <div className="w-1/2 h-2 bg-[#131b2e]/10 rounded" />
                <div className="w-5/6 h-8 bg-white border border-[#c3c6d7] rounded p-2 flex justify-between items-center text-[8px] font-mono">
                  <span>PRINT_EXPORT_V1</span>
                  <span className="text-emerald-600">SIGNED_MD</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Streamlined Workflow) */}
        <section id="workflow" className="py-20 bg-white border-t border-[#c3c6d7]/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-sans text-3xl font-bold text-[#131b2e] tracking-tight">
                Streamlined Clinical Workflow
              </h2>
              <p className="font-sans text-sm text-[#434655] mt-2">
                Evaluate ultrasound imagery with clinical confidence in three straightforward phases.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Process guide layout link bars */}
              <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-[1px] bg-[#c3c6d7]" />
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-[#faf8ff] border border-[#c3c6d7] rounded-full flex items-center justify-center mb-6 shadow-sm hover:border-[#2563eb] transition-colors">
                  <span className="font-sans text-2xl font-black text-[#2563eb]">1</span>
                </div>
                <h3 className="font-sans text-base font-bold text-[#131b2e] mb-1">Upload Slice</h3>
                <p className="font-sans text-xs text-[#434655] max-w-[200px]">
                  Securely feed image pixels into the encrypted workspace pipeline.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-[#2563eb] text-white border border-[#b4c5ff] rounded-full flex items-center justify-center mb-6 shadow shadow-[#2563eb]/20">
                  <span className="font-sans text-2xl font-black">2</span>
                </div>
                <h3 className="font-sans text-base font-bold text-[#131b2e] mb-1">Deep Inference</h3>
                <p className="font-sans text-xs text-[#434655] max-w-[200px]">
                  AI algorithm pinpoints coordinates, classifying cyst contours.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-[#faf8ff] border border-[#c3c6d7] rounded-full flex items-center justify-center mb-6 shadow-sm hover:border-[#2563eb] transition-colors">
                  <span className="font-sans text-2xl font-black text-[#2563eb]">3</span>
                </div>
                <h3 className="font-sans text-base font-bold text-[#131b2e] mb-1">Get Results</h3>
                <p className="font-sans text-xs text-[#434655] max-w-[200px]">
                  View classification output and download your analysis report immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security / HIPAA Compliance */}
        <section id="compliance" className="py-20 bg-[#eaedff]/30 border-y border-[#c3c6d7]/40">
          <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#2563eb] border border-[#c3c6d7]">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="font-sans text-2xl lg:text-3xl font-bold text-[#131b2e] tracking-tight">
              Hospital Integration &amp; Complete Security Compliance
            </h2>
            <p className="font-sans text-xs md:text-sm text-[#434655] leading-relaxed">
              KidneyVision AI complies entirely with HIPAA, HITECH, and GDTR criteria. No Patient Health Information (PHI) is persisted inside un-encrypted cloud nodes. Dedicated logs are fully auditable under professional clinical parameters.
            </p>
            <div className="flex gap-4 items-center justify-center pt-2">
              <span className="border border-[#c3c6d7]/80 rounded-lg px-4 py-2 bg-white text-xs text-[#131b2e] font-sans font-semibold">
                ✓ HIPAA COMPLIANT
              </span>
              <span className="border border-[#c3c6d7]/80 rounded-lg px-4 py-2 bg-white text-xs text-[#131b2e] font-sans font-semibold">
                ✓ SOC2 TYPE II
              </span>
              <span className="border border-[#c3c6d7]/80 rounded-lg px-4 py-2 bg-white text-xs text-[#131b2e] font-sans font-semibold">
                ✓ AES-256 BIT KEY CRYPTS
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Area */}
      <footer className="w-full py-12 px-6 md:px-12 bg-[#faf8ff] border-t border-[#c3c6d7]/40 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <div className="font-sans font-bold text-base text-[#131b2e]">
              KidneyVision AI
            </div>
            <p className="font-sans text-[11.5px] text-[#737686] mt-1">
              AI-powered nephrological analysis system. Note: This tool provides preliminary analysis and is not a substitute for professional medical consultation.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-[#737686]">
            <a href="#" className="hover:text-[#2563eb] transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-[#2563eb] transition-all">Data Sharing Agreement</a>
            <a href="#" className="hover:text-[#2563eb] transition-all">SOC-3 Audits</a>
            <a href="#" className="hover:text-[#2563eb] transition-all">Support Desk</a>
          </div>
          <div className="text-xs text-[#737686]">
            © 2026 KidneyVision AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
